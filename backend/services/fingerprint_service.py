import imagehash
from PIL import Image
from database import get_db


def generate_fingerprints(image_path, film_id, frame_index=0, source_filename=""):
    img = Image.open(image_path)

    hashes = {
        "phash": str(imagehash.phash(img)),
        "dhash": str(imagehash.dhash(img)),
        "ahash": str(imagehash.average_hash(img)),
        "whash": str(imagehash.whash(img)),
    }

    conn = get_db()
    for hash_type, hash_value in hashes.items():
        conn.execute(
            """INSERT INTO fingerprints (film_id, hash_type, hash_value, frame_index, source_filename)
               VALUES (?, ?, ?, ?, ?)""",
            (film_id, hash_type, hash_value, frame_index, source_filename)
        )
    conn.commit()
    conn.close()

    return hashes


def compare_hashes(hash1_hex, hash2_hex):
    h1 = imagehash.hex_to_hash(hash1_hex)
    h2 = imagehash.hex_to_hash(hash2_hex)
    max_dist = len(h1.hash.flatten())
    hamming = h1 - h2
    similarity = 1 - (hamming / max_dist)
    return round(similarity, 4)


def find_matches(suspect_image_path, threshold=0.75):
    img = Image.open(suspect_image_path)
    suspect_phash = str(imagehash.phash(img))
    suspect_dhash = str(imagehash.dhash(img))
    suspect_ahash = str(imagehash.average_hash(img))
    suspect_whash = str(imagehash.whash(img))

    suspect_hashes = {
        "phash": suspect_phash,
        "dhash": suspect_dhash,
        "ahash": suspect_ahash,
        "whash": suspect_whash,
    }

    conn = get_db()
    stored = conn.execute(
        """SELECT f.id, f.film_id, f.hash_type, f.hash_value, fi.title
           FROM fingerprints f JOIN films fi ON f.film_id = fi.id"""
    ).fetchall()
    conn.close()

    film_scores = {}
    for row in stored:
        ht = row['hash_type']
        if ht not in suspect_hashes:
            continue
        sim = compare_hashes(suspect_hashes[ht], row['hash_value'])
        fid = row['film_id']
        if fid not in film_scores:
            film_scores[fid] = {"film_id": fid, "title": row['title'], "scores": {}, "avg_score": 0}
        film_scores[fid]["scores"][ht] = max(film_scores[fid]["scores"].get(ht, 0), sim)

    matches = []
    for fid, data in film_scores.items():
        if data["scores"]:
            data["avg_score"] = round(sum(data["scores"].values()) / len(data["scores"]), 4)
            if data["avg_score"] >= threshold:
                if data["avg_score"] >= 0.95:
                    data["match_type"] = "exact"
                elif data["avg_score"] >= 0.85:
                    data["match_type"] = "near"
                elif data["avg_score"] >= 0.75:
                    data["match_type"] = "partial"
                else:
                    data["match_type"] = "none"
                matches.append(data)

    matches.sort(key=lambda x: x["avg_score"], reverse=True)
    return matches, suspect_hashes


def get_fingerprints_for_film(film_id):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM fingerprints WHERE film_id = ? ORDER BY frame_index, hash_type",
        (film_id,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
