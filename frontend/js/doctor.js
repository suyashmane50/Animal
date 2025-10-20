// Simple JavaScript for interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Add active class to clicked nav items
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                });
            });
            
            // Logout button functionality
            const logoutBtn = document.querySelector('.btn-logout');
            logoutBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to logout?')) {
                    alert('You have been logged out successfully.');
                    // window.location.href = 'login.html';
                }
            });
            
            // Start appointment buttons
            const startBtns = document.querySelectorAll('.btn-start');
            startBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const petName = this.closest('.appointment-item').querySelector('.appointment-pet').textContent;
                    alert(`Starting appointment for ${petName}`);
                    // In a real application, this would open a health record form
                });
            });
            
            // Reschedule buttons
            const rescheduleBtns = document.querySelectorAll('.btn-reschedule');
            rescheduleBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const petName = this.closest('.appointment-item').querySelector('.appointment-pet').textContent;
                    alert(`Opening reschedule form for ${petName}`);
                });
            });
        });