from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import Employee, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = Employee.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        return jsonify({'token': access_token, 'role': user.role}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if Employee.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
        
    new_user = Employee(
        username=data['username'],
        name=data['name'],
        role='employee'
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201