from flask import Blueprint, jsonify
from services.analytics_service import (
    get_dashboard_stats, get_revenue_by_channel, get_revenue_by_region,
    get_audience_by_region, get_piracy_trends, get_threat_summary, get_film_revenue
)

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/api/analytics/dashboard', methods=['GET'])
def dashboard():
    return jsonify(get_dashboard_stats())


@analytics_bp.route('/api/analytics/revenue', methods=['GET'])
def revenue():
    return jsonify({
        "by_channel": get_revenue_by_channel(),
        "by_region": get_revenue_by_region(),
        "by_film": get_film_revenue()
    })


@analytics_bp.route('/api/analytics/audience', methods=['GET'])
def audience():
    return jsonify(get_audience_by_region())


@analytics_bp.route('/api/analytics/piracy-trends', methods=['GET'])
def piracy_trends():
    return jsonify(get_piracy_trends())


@analytics_bp.route('/api/analytics/threats', methods=['GET'])
def threats():
    return jsonify(get_threat_summary())
