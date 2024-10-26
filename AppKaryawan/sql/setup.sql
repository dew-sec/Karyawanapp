CREATE DATABASE employee_db;

USE employee_db;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(100),
    role ENUM('admin', 'employee')
);

CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200),
    description TEXT,
    status ENUM('pending', 'completed'),
    assigned_to INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    date DATE,
    time_in TIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users
INSERT INTO users (username, password, name, role) VALUES
('admin', '$2y$10$your_hashed_password', 'Administrator', 'admin'),
('dewantoro', '$2y$10$your_hashed_password', 'Dewantoro', 'employee');