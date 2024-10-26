function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Simulasi login (dalam implementasi nyata, gunakan database)
    if (username === "admin" && password === "admin123") {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('userRole', 'admin');
        window.location.href = 'home.html';
    } else if (username === "dewantoro" && password === "emp123") {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        localStorage.setItem('userRole', 'employee');
        window.location.href = 'home.html';
    } else {
        alert('Invalid username or password!');
    }
}

function isAdmin() {
    return localStorage.getItem('userRole') === 'admin';
}

function showHideAdminFeatures() {
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(element => {
        element.style.display = isAdmin() ? 'block' : 'none';
    });
}

function addAnnouncement() {
    if (!isAdmin()) {
        alert('Only admin can add announcements');
        return;
    }

    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    
    let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    announcements.push({
        title: title,
        content: content,
        date: new Date().toISOString(),
        createdBy: localStorage.getItem('username')
    });
    
    localStorage.setItem('announcements', JSON.stringify(announcements));
    updateAnnouncementsList();
    document.getElementById('announcementForm').reset();
}

function updateAnnouncementsList() {
    const container = document.getElementById('announcementsList');
    if (!container) return;

    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    container.innerHTML = announcements.map(ann => `
        <div class="announcement-item">
            <h5>${ann.title}</h5>
            <p class="text-muted">Posted on: ${new Date(ann.date).toLocaleDateString()}</p>
            <p>${ann.content}</p>
            ${isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="deleteAnnouncement('${ann.date}')">Delete</button>` : ''}
        </div>
        <hr>
    `).join('');
}

function updateAttendanceTable() {
    const tableBody = document.getElementById('attendanceTable');
    if (!tableBody) return;

    const attendance = JSON.parse(localStorage.getItem('attendance')) || [];
    
    if (isAdmin()) {
        // Admin melihat semua attendance
        tableBody.innerHTML = attendance.map(entry => `
            <tr>
                <td>${entry.username}</td>
                <td>${entry.date}</td>
                <td>${entry.clockIn}</td>
                <td>${entry.clockOut}</td>
                <td>${entry.status}</td>
            </tr>
        `).join('');
    } else {
        // Karyawan hanya melihat attendance-nya sendiri
        const username = localStorage.getItem('username');
        const filteredAttendance = attendance.filter(entry => entry.username === username);
        
        tableBody.innerHTML = filteredAttendance.map(entry => `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.clockIn}</td>
                <td>${entry.clockOut}</td>
                <td>${entry.status}</td>
            </tr>
        `).join('');
    }
}

function addTask() {
    if (!isAdmin()) {
        alert('Only admin can add tasks');
        return;
    }

    const taskTitle = document.getElementById('taskTitle').value;
    const taskDesc = document.getElementById('taskDescription').value;
    const assignedTo = document.getElementById('assignedTo').value;
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({
        title: taskTitle,
        description: taskDesc,
        status: 'Pending',
        assignedTo: assignedTo,
        createdAt: new Date().toISOString()
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskList();
    document.getElementById('taskForm').reset();
}

function updateTaskList() {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const username = localStorage.getItem('username');
    
    const filteredTasks = isAdmin() ? tasks : tasks.filter(task => task.assignedTo === username);

    taskList.innerHTML = filteredTasks.map((task, index) => `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${task.title}</h5>
                <p class="card-text">${task.description}</p>
                <p>Assigned to: ${task.assignedTo}</p>
                <span class="badge bg-${task.status === 'Completed' ? 'success' : 'warning'}">${task.status}</span>
                ${!isAdmin() ? `<button class="btn btn-success btn-sm" onclick="completeTask(${index})">Complete</button>` : ''}
                ${isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="deleteTask(${index})">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    showHideAdminFeatures();
    
    if (window.location.href.includes('attendance.html')) {
        updateAttendanceTable();
    }
    
    if (window.location.href.includes('tasks.html')) {
        updateTaskList();
    }
    
    if (window.location.href.includes('announcement.html')) {
        updateAnnouncementsList();
    }
});

// Implementasi pada fungsi login
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!validateInput(username, 'username')) {
        alert('Invalid username format!');
        return;
    }

    if (!validateInput(password, 'password')) {
        alert('Password must be at least 6 characters!');
        return;
    }

    // Sanitasi input
    const sanitizedUsername = sanitizeHTML(username);
    
    // Simulasi pengecekan kredensial
    // Dalam implementasi nyata, ini seharusnya menggunakan API call ke backend
    if ((sanitizedUsername === "admin" && password === "admin123") || 
        (sanitizedUsername === "dewantoro" && password === "emp123")) {
        
        // Set session data
        const userRole = sanitizedUsername === "admin" ? "admin" : "employee";
        const userData = {
            username: sanitizedUsername,
            role: userRole,
            name: sanitizedUsername === "admin" ? "Administrator" : "Dewantoro",
            timestamp: new Date().getTime(),
            expiresIn: 3600000 // 1 jam
        };

        // Simpan data session
        localStorage.setItem('session', JSON.stringify(userData));
        
        // Log aktivitas login
        logActivity('login', `User ${sanitizedUsername} logged in`);

        // Tambahkan notifikasi welcome
        addNotification(`Welcome back, ${userData.name}!`, 'success');

        // Redirect ke home page
        window.location.href = 'home.html';
    } else {
        // Tampilkan pesan error
        showAlert('Invalid username or password!', 'error');
        
        // Log percobaan login yang gagal
        logActivity('login_failed', `Failed login attempt for username: ${sanitizedUsername}`);
        
        // Reset form password
        document.getElementById('password').value = '';
    }
}

// Fungsi untuk menampilkan alert
function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Fungsi untuk mencatat aktivitas
function logActivity(action, details) {
    let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    activityLog.push({
        timestamp: new Date().toISOString(),
        action: action,
        details: details,
        userAgent: navigator.userAgent,
        ipAddress: 'client-side'
    });
}

// Fungsi untuk menambah notifikasi
function addNotification(message, type = 'info') {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.push({
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false
    });
    
    // Batasi notifikasi hingga 50 entri
    if (notifications.length > 50) {
        notifications = notifications.slice(-50);
    }
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    updateNotificationBadge();
}

// Fungsi untuk update badge notifikasi
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const unread = notifications.filter(n => !n.read).length;
    
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'block' : 'none';
}

// Fungsi untuk mengecek status login
function checkLoginStatus() {
    const session = JSON.parse(localStorage.getItem('session'));
    
    // Jika tidak ada session dan bukan di halaman login
    if (!session && !window.location.href.includes('index.html')) {
        showAlert('Please login to continue', 'error');
        window.location.href = 'index.html';
        return;
    }

    // Cek expired session
    if (session) {
        const now = new Date().getTime();
        if (now - session.timestamp > session.expiresIn) {
            logout();
            showAlert('Session expired. Please login again.', 'error');
            window.location.href = 'index.html';
            return;
        }

        // Update timestamp untuk extend session
        session.timestamp = now;
        localStorage.setItem('session', JSON.stringify(session));
    }
}

// Fungsi logout
function logout() {
    const session = JSON.parse(localStorage.getItem('session'));
    if (session) {
        logActivity('logout', `User ${session.username} logged out`);
    }
    
    localStorage.removeItem('session');
    window.location.href = 'index.html';
}

// Event listener saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Cek login status di setiap halaman kecuali halaman login
    if (!window.location.href.includes('index.html')) {
        checkLoginStatus();
    }
    
    // Update notification badge
    updateNotificationBadge();
    
    // Tambahkan event listener untuk form login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Tambahkan timeout untuk session
function setSession(username, role) {
    const session = {
        username: username,
        role: role,
        timestamp: new Date().getTime(),
        expiresIn: 3600000 // 1 jam dalam milliseconds
    };
    localStorage.setItem('session', JSON.stringify(session));
}

function checkSession() {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session) return false;

    const now = new Date().getTime();
    if (now - session.timestamp > session.expiresIn) {
        logout();
        return false;
    }
    return true;
}

// Update checkLoginStatus
function checkLoginStatus() {
    if (!checkSession() && !window.location.href.includes('index.html')) {
        alert('Session expired. Please login again.');
        window.location.href = 'index.html';
    }
}

// Sistem notifikasi
function addNotification(message, type = 'info') {
    let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.push({
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false
    });
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const unread = notifications.filter(n => !n.read).length;
    
    badge.textContent = unread;
    badge.style.display = unread > 0 ? 'block' : 'none';
}

// Fungsi untuk menampilkan pesan error/success
function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.container').prepend(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Penggunaan
try {
    // kode yang mungkin error
} catch (error) {
    showAlert(error.message);
    console.error(error);
}

function logActivity(action, details) {
    let activityLog = JSON.parse(localStorage.getItem('activityLog')) || [];
    activityLog.push({
        timestamp: new Date().toISOString(),
        user: localStorage.getItem('username'),
        action: action,
        details: details
    });
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
}

// Penggunaan dalam fungsi-fungsi yang ada
function clockIn() {
    // ... kode yang sudah ada
    logActivity('clock_in', 'User clocked in');
}

function exportToCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," 
        + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
}

function filterTasks(status) {

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    return tasks.filter(task => task.status === status);

}


function searchTasks(keyword) {

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    return tasks.filter(task => 

        task.title.toLowerCase().includes(keyword.toLowerCase()) ||

        task.description.toLowerCase().includes(keyword.toLowerCase())

    );

}

function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Penggunaan
function deleteTask(index) {
    confirmAction('Are you sure you want to delete this task?', () => {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskList();
    });
}

// config/config.js
const config = {
    apiUrl: 'http://localhost:5000/api',  // Python Flask server URL
};