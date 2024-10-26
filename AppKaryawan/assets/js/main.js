$(document).ready(function() {
    // Toggle sidebar
    $('.sidebar-toggle').on('click', function() {
        $('.sidebar').toggleClass('collapsed');
        $('.main-content').toggleClass('expanded');
    });

    // Active menu handler
    $('.nav-link').on('click', function() {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
    });

    // Set active menu based on current page
    const currentPage = window.location.pathname.split('/').pop();
    $(`.nav-link[href="${currentPage}"]`).addClass('active');

    // Login form handler
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();

        // Simple validation
        if (username && password) {
            // Make an AJAX call to your backend login endpoint
            $.ajax({
                url: '/login', // Your Flask login endpoint
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username: username, password: password }),
                success: function(data) {
                    // If login is successful, save the token and redirect
                    localStorage.setItem('token', data.token); // Save JWT token
                    window.location.href = '/dashboard'; // Redirect to dashboard
                },
                error: function(jqXHR) {
                    // Handle login error
                    const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : 'Login failed';
                    showNotification(errorMessage, 'danger'); // Show error notification
                }
            });
        } else {
            alert('Please fill in all fields');
        }
    });

    // Datatable initialization (if you're using DataTables)
    if ($.fn.DataTable) {
        $('.table').DataTable({
            responsive: true,
            pageLength: 10,
            order: [[0, 'desc']],
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search..."
            }
        });
    }

    // Notification handler
    function showNotification(message, type = 'success') {
        const notification = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
        $('.notification-area').append(notification);
    }

    // Form validation
    function validateForm(formElement) {
        let isValid = true;
        $(formElement).find('input[required], select[required], textarea[required]').each(function() {
            if (!$(this).val()) {
                isValid = false;
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        });
        return isValid;
    }

    // Profile image preview
    $('#profileImage').on('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#imagePreview').attr('src', e.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    // Search functionality
    $('#searchInput').on('keyup', function() {
        const value = $(this).val().toLowerCase();
        $(".searchable tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });

    // Chart initialization (if using Chart.js)
    if (typeof Chart !== 'undefined') {
        // Example chart
        const ctx = document.getElementById('employeeChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Employee Performance',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Date picker initialization (if using bootstrap-datepicker)
    if ($.fn.datepicker) {
        $('.datepicker').datepicker({
            format: 'yyyy-mm-dd',
            autoclose: true,
            todayHighlight: true
        });
    }

    // Export to Excel functionality
    $('#exportExcel').on('click', function() {
        const table = document.querySelector('.table');
        const ws = XLSX.utils.table_to_sheet(table);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'export.xlsx');
    });

    // Print functionality
    $('#printButton').on('click', function() {
        window.print();
    });

    // Modal handlers
    $('.modal').on('show.bs.modal', function() {
        const button = $(event.relatedTarget);
        const id = button.data('id');
        const modal = $(this);
        
        // Here you would typically fetch data based on ID
        // and populate the modal
    });

    // Form submission handler with AJAX
    $('.ajax-form').on('submit', function(e) {
        e.preventDefault();
        if (validateForm(this)) {
            const formData = $(this).serialize();
            $.ajax({
                url: $(this).attr('action'),
                type: 'POST',
                data: formData,
                success: function(response) {
                    showNotification('Data saved successfully!');
                },
                error: function() {
                    showNotification('Error saving data!', 'danger');
                }
            });
        }
    });

    // Tooltip initialization
    $('[data-toggle="tooltip"]').tooltip();

    // Populate user profile
    function populateUserProfile() {
        // Here you would typically fetch user data from backend
        const userData = {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Administrator'
        };
        $('#userProfileName').text(userData.name);
        $('#userProfileEmail').text(userData.email);
        $('#userProfileRole').text(userData.role);
    }

    // Call necessary functions on page load
    populateUserProfile();
});
