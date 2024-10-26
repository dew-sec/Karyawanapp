import os
from datetime import timedelta

class Config:
    # MySQL configuration without password
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root@localhost/employee_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'your-secret-key'