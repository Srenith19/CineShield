import os
from flask import Blueprint, request, jsonify
from services.fingerprint_service import generate_fingerprints, get_fingerprints_for_film
from config import UPLOAD_FOLDER

fingerprints_bp = Blueprint('fingerprints', __name__)


@fingerprints_bp.route('/api/fingerprints/generate', methods=['POST'])
def generate():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    film_id = request.form.get('film_id')
    if not film_id:
        return jsonify({"error": "film_id is required"}), 400

    file = request.files['image']
    frame_index = int(request.form.get('frame_index', 0))
    filename = file.filename
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    hashes = generate_fingerprints(filepath, int(film_id), frame_index, filename)

    return jsonify({
        "film_id": int(film_id),
        "filename": filename,
        "frame_index": frame_index,
        "hashes": hashes
    }), 201


@fingerprints_bp.route('/api/fingerprints/<int:film_id>', methods=['GET'])
def get_for_film(film_id):
    fps = get_fingerprints_for_film(film_id)
    return jsonify(fps)
