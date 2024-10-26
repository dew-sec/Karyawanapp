from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Task, db

task_bp = Blueprint('task', __name__)

@task_bp.route('/', methods=['GET'])
@jwt_required()
def get_tasks():
    tasks = Task.query.all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'assigned_to': task.assigned_to
    } for task in tasks]), 200

@task_bp.route('/', methods=['POST'])
@jwt_required()
def create_task():
    data = request.get_json()
    
    new_task = Task(
        title=data['title'],
        description=data.get('description'),
        assigned_to=data.get('assigned_to')
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify({
        'message': 'Task created successfully',
        'task': {
            'id': new_task.id,
            'title': new_task.title,
            'description': new_task.description,
            'status': new_task.status,
            'assigned_to': new_task.assigned_to
        }
    }), 201