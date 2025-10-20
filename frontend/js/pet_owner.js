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
                    // In a real application, this would redirect to login page
                    alert('You have been logged out successfully.');
                    // window.location.href = 'login.html';
                }
            });
            
            // Add new pet button
            const addPetBtn = document.querySelector('.btn-primary');
            addPetBtn.addEventListener('click', function() {
                alert('Redirecting to add new pet form...');
                // In a real application, this would open a modal or redirect
            });
        });