from flask import Blueprint, request, jsonify
from database import get_db

films_bp = Blueprint('films', __name__)


@films_bp.route('/api/films', methods=['GET'])
def list_films():
    conn = get_db()
    films = conn.execute("SELECT * FROM films ORDER BY created_at DESC").fetchall()
    conn.close()
    return jsonify([dict(f) for f in films])


@films_bp.route('/api/films', methods=['POST'])
def create_film():
    data = request.json
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO films (title, director, release_year, genre, studio) VALUES (?, ?, ?, ?, ?)",
        (data['title'], data.get('director', ''), data.get('release_year'), data.get('genre', ''), data.get('studio', ''))
    )
    conn.commit()
    film_id = cursor.lastrowid
    film = conn.execute("SELECT * FROM films WHERE id = ?", (film_id,)).fetchone()
    conn.close()
    return jsonify(dict(film)), 201


@films_bp.route('/api/films/<int:film_id>', methods=['GET'])
def get_film(film_id):
    conn = get_db()
    film = conn.execute("SELECT * FROM films WHERE id = ?", (film_id,)).fetchone()
    if not film:
        conn.close()
        return jsonify({"error": "Film not found"}), 404
    fingerprints = conn.execute("SELECT * FROM fingerprints WHERE film_id = ?", (film_id,)).fetchall()
    distributions = conn.execute("SELECT * FROM distributions WHERE film_id = ?", (film_id,)).fetchall()
    piracy = conn.execute("SELECT * FROM piracy_reports WHERE film_id = ?", (film_id,)).fetchall()
    conn.close()
    return jsonify({
        "film": dict(film),
        "fingerprints": [dict(f) for f in fingerprints],
        "distributions": [dict(d) for d in distributions],
        "piracy_reports": [dict(p) for p in piracy]
    })
