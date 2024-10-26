from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Attendance, db
from datetime import datetime

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/clock-in', methods=['POST'])
@jwt_required()
def clock_in():
    employee_id = get_jwt_identity()
    today = datetime.utcnow().date()
    
    # Check if already clocked in
    existing = Attendance.query.filter_by(
        employee_id=employee_id,
        date=today
    ).first()
    
    if existing and existing.time_in:
        return jsonify({'message': 'Already clocked in today'}), 400
    
    if existing:
        existing.time_in = datetime.utcnow()
        existing.status = 'present'
    else:
        attendance = Attendance(
            employee_id=employee_id,
            date=today,
            time_in=datetime.utcnow(),
            status='present'
        )
        db.session.add(attendance)
    
    db.session.commit()
    return jsonify({'message': 'Clock in successful'})

@attendance_bp.route('/clock-out', methods=['POST'])
@jwt_required()
def clock_out():
    employee_id = get_jwt_identity()
    today = datetime.utcnow().date()
    
    attendance = Attendance.query.filter_by(
        employee_id=employee_id,
        date=today
    ).first()
    
    if not attendance or not attendance.time_in:
        return jsonify({'message': 'No clock-in record found'}), 400
    
    attendance.time_out = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Clock out successful'})