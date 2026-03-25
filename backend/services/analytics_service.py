from database import get_db


def get_dashboard_stats():
    conn = get_db()
    films = conn.execute("SELECT COUNT(*) as c FROM films").fetchone()['c']
    threats = conn.execute("SELECT COUNT(*) as c FROM piracy_reports WHERE status IN ('new', 'investigating')").fetchone()['c']
    revenue = conn.execute("SELECT COALESCE(SUM(revenue), 0) as r FROM distributions").fetchone()['r']
    distributions = conn.execute("SELECT COUNT(*) as c FROM distributions").fetchone()['c']
    blocks = conn.execute("SELECT COUNT(*) as c FROM blockchain").fetchone()['c']
    confirmed_piracy = conn.execute("SELECT COUNT(*) as c FROM piracy_reports WHERE status = 'confirmed'").fetchone()['c']
    conn.close()

    return {
        "total_films": films,
        "active_threats": threats,
        "total_revenue": round(revenue, 2),
        "total_distributions": distributions,
        "blockchain_blocks": blocks,
        "confirmed_piracy": confirmed_piracy
    }


def get_revenue_by_channel():
    conn = get_db()
    rows = conn.execute(
        "SELECT channel, SUM(revenue) as total_revenue, SUM(audience_count) as total_audience FROM distributions GROUP BY channel ORDER BY total_revenue DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_revenue_by_region():
    conn = get_db()
    rows = conn.execute(
        "SELECT region, SUM(revenue) as total_revenue, SUM(audience_count) as total_audience FROM distributions GROUP BY region ORDER BY total_revenue DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_audience_by_region():
    conn = get_db()
    rows = conn.execute(
        "SELECT region, SUM(audience_count) as total_audience FROM distributions GROUP BY region ORDER BY total_audience DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_piracy_trends():
    conn = get_db()
    rows = conn.execute(
        """SELECT DATE(detected_at) as date, COUNT(*) as count,
           SUM(CASE WHEN match_type = 'exact' THEN 1 ELSE 0 END) as exact_matches,
           SUM(CASE WHEN match_type = 'near' THEN 1 ELSE 0 END) as near_matches,
           SUM(CASE WHEN match_type = 'partial' THEN 1 ELSE 0 END) as partial_matches
           FROM piracy_reports GROUP BY DATE(detected_at) ORDER BY date"""
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_threat_summary():
    conn = get_db()
    by_status = conn.execute(
        "SELECT status, COUNT(*) as count FROM piracy_reports GROUP BY status"
    ).fetchall()
    by_type = conn.execute(
        "SELECT match_type, COUNT(*) as count FROM piracy_reports WHERE match_type IS NOT NULL GROUP BY match_type"
    ).fetchall()
    conn.close()
    return {
        "by_status": [dict(r) for r in by_status],
        "by_type": [dict(r) for r in by_type]
    }


def get_film_revenue():
    conn = get_db()
    rows = conn.execute(
        """SELECT f.title, SUM(d.revenue) as total_revenue, SUM(d.audience_count) as total_audience,
           COUNT(d.id) as distribution_count
           FROM films f LEFT JOIN distributions d ON f.id = d.film_id
           GROUP BY f.id ORDER BY total_revenue DESC"""
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
