import os
from flask import Blueprint, request, jsonify
from services.fingerprint_service import find_matches
from services.watermark_service import extract_watermark
from database import get_db
from config import UPLOAD_FOLDER

piracy_bp = Blueprint('piracy', __name__)


def identify_leaker(watermark_text):
    """Look up the watermark code in distributions to find who leaked it."""
    if not watermark_text:
        return None, None
    conn = get_db()
    dist = conn.execute(
        """SELECT d.distributor, d.watermark_code, d.channel, d.region, f.title as film_title
           FROM distributions d JOIN films f ON d.film_id = f.id
           WHERE d.watermark_code = ?""",
        (watermark_text,)
    ).fetchone()
    conn.close()
    if dist:
        return dict(dist), dist['distributor']
    return None, None


@piracy_bp.route('/api/piracy/scan', methods=['POST'])
def scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    filename = f"suspect_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Step 1: Fingerprint matching — identify WHICH film was pirated
    matches, suspect_hashes = find_matches(filepath)

    # Step 2: Watermark extraction — identify WHO leaked it
    watermark_text = None
    leak_source = None
    leaker_name = None
    try:
        watermark_text = extract_watermark(filepath)
        if watermark_text:
            leak_source, leaker_name = identify_leaker(watermark_text)
    except Exception:
        pass

    conn = get_db()
    if matches:
        best = matches[0]
        conn.execute(
            """INSERT INTO piracy_reports
               (film_id, suspect_hash, match_score, match_type, suspect_filename, status, leaked_by, watermark_extracted)
               VALUES (?, ?, ?, ?, ?, 'new', ?, ?)""",
            (best['film_id'], suspect_hashes['phash'], best['avg_score'], best['match_type'],
             filename, leaker_name, watermark_text)
        )
    else:
        conn.execute(
            """INSERT INTO piracy_reports
               (suspect_hash, match_score, match_type, suspect_filename, status, leaked_by, watermark_extracted)
               VALUES (?, 0, 'none', ?, 'dismissed', ?, ?)""",
            (suspect_hashes['phash'], filename, leaker_name, watermark_text)
        )
    conn.commit()
    conn.close()

    return jsonify({
        "suspect_hashes": suspect_hashes,
        "matches": matches,
        "total_matches": len(matches),
        "watermark": {
            "extracted": watermark_text,
            "leaker": leaker_name,
            "leak_source": leak_source
        }
    })


@piracy_bp.route('/api/piracy/reports', methods=['GET'])
def list_reports():
    conn = get_db()
    reports = conn.execute(
        """SELECT p.*, f.title as film_title
           FROM piracy_reports p LEFT JOIN films f ON p.film_id = f.id
           ORDER BY p.detected_at DESC"""
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in reports])


@piracy_bp.route('/api/piracy/reports/<int:report_id>', methods=['PATCH'])
def update_report(report_id):
    data = request.json
    conn = get_db()
    conn.execute("UPDATE piracy_reports SET status = ? WHERE id = ?", (data['status'], report_id))
    conn.commit()
    report = conn.execute("SELECT * FROM piracy_reports WHERE id = ?", (report_id,)).fetchone()
    conn.close()
    return jsonify(dict(report))
