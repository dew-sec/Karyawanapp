from app import app, db
from models import Employee

def init_db():
    with app.app_context():
        # Create all tables
        db.create_all()

        # Check if admin user exists
        admin = Employee.query.filter_by(username='admin').first()
        if not admin:
            # Create admin user
            admin = Employee(
                username='admin',
                name='Administrator',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()

if __name__ == '__main__':
    init_db()