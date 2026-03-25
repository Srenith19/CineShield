import hashlib
import json
from datetime import datetime
from database import get_db


def compute_hash(index, timestamp, data, previous_hash, nonce):
    block_str = f"{index}{data}{previous_hash}{nonce}"
    return hashlib.sha256(block_str.encode()).hexdigest()


def get_latest_block():
    conn = get_db()
    block = conn.execute(
        "SELECT * FROM blockchain ORDER BY block_index DESC LIMIT 1"
    ).fetchone()
    conn.close()
    return dict(block) if block else None


def add_block(data_dict):
    latest = get_latest_block()
    if latest is None:
        index = 0
        previous_hash = "0" * 64
    else:
        index = latest['block_index'] + 1
        previous_hash = latest['hash']

    data = json.dumps(data_dict)
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    nonce = 0
    while True:
        block_hash = compute_hash(index, timestamp, data, previous_hash, nonce)
        if block_hash.startswith("00"):
            break
        nonce += 1

    conn = get_db()
    conn.execute(
        "INSERT INTO blockchain (block_index, timestamp, data, previous_hash, nonce, hash) VALUES (?, ?, ?, ?, ?, ?)",
        (index, timestamp, data, previous_hash, nonce, block_hash)
    )
    conn.commit()
    conn.close()

    return {
        "block_index": index,
        "timestamp": timestamp,
        "data": data_dict,
        "previous_hash": previous_hash,
        "nonce": nonce,
        "hash": block_hash
    }


def get_chain():
    conn = get_db()
    blocks = conn.execute("SELECT * FROM blockchain ORDER BY block_index ASC").fetchall()
    conn.close()
    result = []
    for b in blocks:
        d = dict(b)
        try:
            d['data'] = json.loads(d['data'])
        except (json.JSONDecodeError, TypeError):
            pass
        result.append(d)
    return result


def validate_chain():
    chain = get_chain()
    if not chain:
        return {"valid": True, "message": "Empty chain", "blocks_checked": 0}

    for i in range(1, len(chain)):
        current = chain[i]
        previous = chain[i - 1]

        if current['previous_hash'] != previous['hash']:
            return {
                "valid": False,
                "message": f"Chain broken at block {current['block_index']}: previous_hash mismatch",
                "broken_at": current['block_index'],
                "blocks_checked": i
            }

    return {
        "valid": True,
        "message": f"Chain integrity verified across {len(chain)} blocks",
        "blocks_checked": len(chain)
    }
