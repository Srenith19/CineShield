import os
from flask import Blueprint, request, jsonify, send_file
from services.watermark_service import embed_watermark, extract_watermark
from config import UPLOAD_FOLDER

watermark_bp = Blueprint('watermark', __name__)


@watermark_bp.route('/api/watermark/embed', methods=['POST'])
def embed():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    watermark_text = request.form.get('watermark_text', '')
    if not watermark_text:
        return jsonify({"error": "watermark_text is required"}), 400

    file = request.files['image']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    output_path, output_filename = embed_watermark(filepath, watermark_text)

    return jsonify({
        "message": "Watermark embedded successfully",
        "original": file.filename,
        "watermarked_file": output_filename,
        "watermark_text": watermark_text
    })


@watermark_bp.route('/api/watermark/extract', methods=['POST'])
def extract():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    filepath = os.path.join(UPLOAD_FOLDER, f"extract_{file.filename}")
    file.save(filepath)

    result = extract_watermark(filepath)

    if result:
        return jsonify({"watermark_found": True, "watermark_text": result})
    return jsonify({"watermark_found": False, "message": "No watermark detected"})
