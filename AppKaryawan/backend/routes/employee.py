from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models import Employee

employee_bp = Blueprint('employee', __name__)

@employee_bp.route('/', methods=['GET'])
@jwt_required()
def get_employees():
    employees = Employee.query.all()
    return jsonify([{
        'id': emp.id,
        'username': emp.username,
        'name': emp.name,
        'role': emp.role
    } for emp in employees]), 200

@employee_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_employee(id):
    employee = Employee.query.get_or_404(id)
    return jsonify({
        'id': employee.id,
        'username': employee.username,
        'name': employee.name,
        'role': employee.role
    }), 200