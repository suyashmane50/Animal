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
            
            // Report action buttons
            const viewBtns = document.querySelectorAll('.btn-view');
            viewBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const reportName = this.closest('tr').querySelector('td').textContent;
                    alert(`Viewing report: ${reportName}`);
                });
            });
            
            const downloadBtns = document.querySelectorAll('.btn-download');
            downloadBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const reportName = this.closest('tr').querySelector('td').textContent;
                    alert(`Downloading report: ${reportName}`);
                });
            });
            
            // Quick action buttons
            const quickActionBtns = document.querySelectorAll('.d-grid .btn');
            quickActionBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const action = this.textContent.trim();
                    alert(`Initiating: ${action}`);
                });
            });
        });