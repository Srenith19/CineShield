import sqlite3
import json
import hashlib
import random
from datetime import datetime, timedelta
from config import DB_PATH


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS films (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            director TEXT,
            release_year INTEGER,
            genre TEXT,
            studio TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS fingerprints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            film_id INTEGER NOT NULL,
            hash_type TEXT NOT NULL,
            hash_value TEXT NOT NULL,
            frame_index INTEGER,
            source_filename TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (film_id) REFERENCES films(id)
        );

        CREATE TABLE IF NOT EXISTS distributions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            film_id INTEGER NOT NULL,
            channel TEXT NOT NULL,
            region TEXT NOT NULL,
            distributor TEXT,
            revenue REAL DEFAULT 0,
            audience_count INTEGER DEFAULT 0,
            start_date DATE,
            end_date DATE,
            block_hash TEXT,
            watermark_code TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (film_id) REFERENCES films(id)
        );

        CREATE TABLE IF NOT EXISTS piracy_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            film_id INTEGER,
            suspect_hash TEXT NOT NULL,
            match_score REAL,
            match_type TEXT,
            source_url TEXT,
            suspect_filename TEXT,
            leaked_by TEXT,
            watermark_extracted TEXT,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'new'
        );

        CREATE TABLE IF NOT EXISTS blockchain (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            block_index INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            data TEXT NOT NULL,
            previous_hash TEXT NOT NULL,
            nonce INTEGER DEFAULT 0,
            hash TEXT NOT NULL UNIQUE
        );
    ''')
    conn.commit()
    conn.close()


def seed_database():
    conn = get_db()
    count = conn.execute("SELECT COUNT(*) FROM films").fetchone()[0]
    if count > 0:
        conn.close()
        return

    films = [
        ("The Last Horizon", "Aravind Menon", 2024, "Sci-Fi", "Horizon Studios"),
        ("Whispers in the Rain", "Priya Sharma", 2023, "Drama", "Monsoon Films"),
        ("Code Red: Cyber Heist", "Vikram Patel", 2024, "Thriller", "ByteWorks Entertainment"),
        ("Echoes of Tomorrow", "Sarah Chen", 2023, "Sci-Fi", "Nebula Pictures"),
        ("The Silent Valley", "Rajesh Kumar", 2024, "Mystery", "Valley Productions"),
        ("Neon Nights", "Maya Rodriguez", 2023, "Action", "Pulse Cinema"),
        ("Beyond the Waves", "James Okafor", 2024, "Adventure", "Oceanic Studios"),
        ("Fragmented Minds", "Ananya Das", 2023, "Psychological Thriller", "MindFrame Films"),
    ]

    for film in films:
        conn.execute(
            "INSERT INTO films (title, director, release_year, genre, studio) VALUES (?, ?, ?, ?, ?)",
            film
        )

    channels = ["Theatrical", "Streaming", "DVD/Blu-ray", "Broadcast", "Digital Download"]
    regions = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa"]
    distributors = ["CineMax Global", "StreamVault", "DigiReel", "FilmBridge", "NetCast Media", "PrimeScreen"]

    base_date = datetime(2024, 1, 1)
    for film_id in range(1, 9):
        for _ in range(random.randint(3, 6)):
            channel = random.choice(channels)
            region = random.choice(regions)
            distributor = random.choice(distributors)
            revenue = round(random.uniform(50000, 5000000), 2)
            audience = random.randint(10000, 2000000)
            start = base_date + timedelta(days=random.randint(0, 300))
            end = start + timedelta(days=random.randint(30, 180))
            # Generate unique watermark code: DISTRIBUTOR_SHORT-REGION_SHORT-YEAR-FILMID
            dist_short = distributor.replace(" ", "")[:6].upper()
            region_short = region.replace(" ", "")[:2].upper()
            watermark_code = f"{dist_short}-{region_short}-{start.year}-FILM{film_id}"

            conn.execute(
                """INSERT INTO distributions
                   (film_id, channel, region, distributor, revenue, audience_count, start_date, end_date, watermark_code)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (film_id, channel, region, distributor, revenue, audience, start.strftime('%Y-%m-%d'), end.strftime('%Y-%m-%d'), watermark_code)
            )

    # Piracy reports - some with identified leakers via watermark extraction
    piracy_data = [
        (1, "a1b2c3d4e5f6a7b8", 0.92, "near", "https://pirate-stream.example.com/movie123", "last_horizon_cam.mp4", "confirmed", "StreamVault", "STREAM-NO-2024-FILM1"),
        (3, "f8e7d6c5b4a39281", 0.88, "near", "https://illegal-downloads.example.com/cr456", "code_red_hdts.mkv", "investigating", "DigiReel", "DIGIRE-EU-2024-FILM3"),
        (None, "1234567890abcdef", 0.45, "none", "https://random-site.example.com/vid", "unknown_clip.mp4", "dismissed", None, None),
        (5, "abcdef1234567890", 0.95, "exact", "https://torrent-site.example.com/sv789", "silent_valley_full.mp4", "new", None, None),
        (2, "9876543210fedcba", 0.78, "partial", "https://stream-rip.example.com/witr", "rain_excerpt.mp4", "new", None, None),
        (6, "fedcba9876543210", 0.91, "near", "https://cam-uploads.example.com/nn", "neon_nights_tc.mp4", "investigating", "NetCast Media", "NETCAS-AS-2023-FILM6"),
    ]

    for report in piracy_data:
        days_ago = random.randint(1, 60)
        detected = datetime.now() - timedelta(days=days_ago)
        conn.execute(
            """INSERT INTO piracy_reports
               (film_id, suspect_hash, match_score, match_type, source_url, suspect_filename, status, leaked_by, watermark_extracted, detected_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (*report, detected.strftime('%Y-%m-%d %H:%M:%S'))
        )

    # Seed blockchain
    prev_hash = "0" * 64
    for i in range(15):
        data = json.dumps({
            "event": "distribution",
            "film_id": random.randint(1, 8),
            "channel": random.choice(channels),
            "region": random.choice(regions),
            "timestamp": (base_date + timedelta(days=i * 20)).isoformat()
        })
        nonce = 0
        while True:
            block_str = f"{i}{data}{prev_hash}{nonce}"
            block_hash = hashlib.sha256(block_str.encode()).hexdigest()
            if block_hash.startswith("00"):
                break
            nonce += 1
        ts = (base_date + timedelta(days=i * 20)).strftime('%Y-%m-%d %H:%M:%S')
        conn.execute(
            "INSERT INTO blockchain (block_index, timestamp, data, previous_hash, nonce, hash) VALUES (?, ?, ?, ?, ?, ?)",
            (i, ts, data, prev_hash, nonce, block_hash)
        )
        prev_hash = block_hash

    conn.commit()
    conn.close()
