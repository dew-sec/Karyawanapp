from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pymysql

# Initialize Flask app
app = Flask(__name__, static_folder='../assets')
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/employee_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = '395dd797494a99a9453e1627a7dfafa14c346bfea228dd17705842926b811ec9'

# Initialize database and JWT manager
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Models based on your existing tables
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(255))
    name = db.Column(db.String(100))
    role = db.Column(db.Enum('admin', 'employee'))

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    status = db.Column(db.Enum('pending', 'completed'))
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    date = db.Column(db.Date)
    time_in = db.Column(db.Time)

class Announcement(db.Model):
    __tablename__ = 'announcements'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    content = db.Column(db.Text)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/assets/<path:path>')
def send_assets(path):
    return send_from_directory('../assets', path)

@app.route('/login', methods=['POST'])
def login_post():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()

    if user is None:
        return jsonify({'message': 'User not found'}), 404

    if not bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = create_access_token(identity=user.id)
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'role': user.role
        }
    })

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/employee')
def employee():
    return render_template('employee.html')

@app.route('/task')
def task():
    return render_template('task.html')

@app.route('/attendance')
def attendance():
    return render_template('attendance.html')

@app.route('/routes', methods=['GET'])
def show_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append((rule.endpoint, rule.rule, rule.methods))
    return jsonify(routes)

# Route to fetch users' usernames and passwords from MySQL and return as JSON
@app.route('/get_users', methods=['GET'])
def get_users():
    users = User.query.with_entities(User.username, User.password).all()
    user_data = [{'username': user.username, 'password': user.password} for user in users]
    return jsonify(user_data)

# User registration route
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    required_fields = ['username', 'password', 'name', 'role']

    # Check for missing required fields
    if any(field not in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    new_user = User(
        username=data['username'],
        password=hashed_pw.decode('utf-8'),
        name=data['name'],
        role=data['role']
    )

    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully!'})

# Task routes
@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role == 'admin':
        tasks = Task.query.all()
    else:
        tasks = Task.query.filter_by(assigned_to=user_id).all()

    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'assigned_to': task.assigned_to,
        'created_at': task.created_at
    } for task in tasks])

# Attendance route
@app.route('/attendance', methods=['POST'])
@jwt_required()
def mark_attendance():
    user_id = get_jwt_identity()
    new_attendance = Attendance(
        user_id=user_id,
        date=datetime.now().date(),
        time_in=datetime.now().time()
    )

    db.session.add(new_attendance)
    db.session.commit()
    return jsonify({'message': 'Attendance marked successfully'})

# Announcements route
@app.route('/announcements', methods=['GET'])
@jwt_required()
def get_announcements():
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify([{
        'id': ann.id,
        'title': ann.title,
        'content': ann.content,
        'created_at': ann.created_at
    } for ann in announcements])

# Admin routes for creating announcements and tasks
@app.route('/announcements', methods=['POST'])
@jwt_required()
def create_announcement():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    new_announcement = Announcement(
        title=data['title'],
        content=data['content']
    )

    db.session.add(new_announcement)
    db.session.commit()
    return jsonify({'message': 'Announcement created successfully'})

@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    new_task = Task(
        title=data['title'],
        description=data['description'],
        status='pending',
        assigned_to=data['assigned_to']
    )

    db.session.add(new_task)
    db.session.commit()
    return jsonify({'message': 'Task created successfully'})

if __name__ == '__main__':
    app.run(debug=True)
