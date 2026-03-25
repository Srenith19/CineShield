from flask import Blueprint, jsonify
from services.blockchain_service import get_chain, validate_chain

blockchain_bp = Blueprint('blockchain', __name__)


@blockchain_bp.route('/api/blockchain/chain', methods=['GET'])
def chain():
    return jsonify(get_chain())


@blockchain_bp.route('/api/blockchain/validate', methods=['GET'])
def validate():
    return jsonify(validate_chain())
