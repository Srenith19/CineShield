import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from config import UPLOAD_FOLDER
from database import init_db, seed_database

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'dist')

app = Flask(__name__, static_folder=DIST_DIR, static_url_path='')
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

from routes.films import films_bp
from routes.fingerprints import fingerprints_bp
from routes.piracy import piracy_bp
from routes.distribution import distribution_bp
from routes.blockchain import blockchain_bp
from routes.analytics import analytics_bp
from routes.watermark import watermark_bp

app.register_blueprint(films_bp)
app.register_blueprint(fingerprints_bp)
app.register_blueprint(piracy_bp)
app.register_blueprint(distribution_bp)
app.register_blueprint(blockchain_bp)
app.register_blueprint(analytics_bp)
app.register_blueprint(watermark_bp)


@app.route('/api/health')
def health():
    return {"status": "ok", "service": "CineShield API"}


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path and os.path.exists(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, 'index.html')


with app.app_context():
    init_db()
    seed_database()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)
