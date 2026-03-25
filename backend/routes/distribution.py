from flask import Blueprint, request, jsonify
from database import get_db
from services.blockchain_service import add_block

distribution_bp = Blueprint('distribution', __name__)


def generate_watermark_code(distributor, region, film_id):
    dist_short = distributor.replace(" ", "")[:6].upper()
    region_short = region.replace(" ", "")[:2].upper()
    return f"{dist_short}-{region_short}-2024-FILM{film_id}"


@distribution_bp.route('/api/distribution', methods=['GET'])
def list_distributions():
    conn = get_db()
    rows = conn.execute(
        """SELECT d.*, f.title as film_title
           FROM distributions d JOIN films f ON d.film_id = f.id
           ORDER BY d.created_at DESC"""
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@distribution_bp.route('/api/distribution', methods=['POST'])
def create_distribution():
    data = request.json

    distributor = data.get('distributor', 'Unknown')
    watermark_code = generate_watermark_code(distributor, data['region'], data['film_id'])

    block = add_block({
        "event": "distribution",
        "film_id": data['film_id'],
        "channel": data['channel'],
        "region": data['region'],
        "distributor": distributor,
        "watermark_code": watermark_code,
        "revenue": data.get('revenue', 0)
    })

    conn = get_db()
    cursor = conn.execute(
        """INSERT INTO distributions (film_id, channel, region, distributor, revenue, audience_count, start_date, end_date, block_hash, watermark_code)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (data['film_id'], data['channel'], data['region'], distributor,
         data.get('revenue', 0), data.get('audience_count', 0),
         data.get('start_date'), data.get('end_date'), block['hash'], watermark_code)
    )
    conn.commit()
    dist_id = cursor.lastrowid
    dist = conn.execute(
        "SELECT d.*, f.title as film_title FROM distributions d JOIN films f ON d.film_id = f.id WHERE d.id = ?",
        (dist_id,)
    ).fetchone()
    conn.close()

    return jsonify({"distribution": dict(dist), "block": block}), 201
