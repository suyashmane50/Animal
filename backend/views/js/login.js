// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const dashboard = document.getElementById('dashboard');
const showSignupBtn = document.getElementById('showSignupBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const logoutBtn = document.getElementById('logoutBtn');
const passwordToggle = document.getElementById('passwordToggle');
const signupPasswordToggle = document.getElementById('signupPasswordToggle');
const userTypeBtns = document.querySelectorAll('.user-type-btn');
const villageField = document.getElementById('villageField');

// User type data
const userTypes = {
    'pet-owner': {
        title: 'Pet Owner Dashboard',
        subtitle: 'Manage your pets and view their health records',
        icon: 'fas fa-users',
        showVillage: true
    },
    'doctor': {
        title: 'Veterinary Doctor Dashboard',
        subtitle: 'Manage pet checkups and health records in your assigned village',
        icon: 'fas fa-user-md',
        showVillage: true
    },
    'district-head': {
        title: 'District Animal Head Dashboard',
        subtitle: 'Oversee district-wide pet healthcare and doctor assignments',
        icon: 'fas fa-user-tie',
        showVillage: false
    },
    'collector': {
        title: 'District Collector Dashboard',
        subtitle: 'Administrative oversight and reporting for the pet care system',
        icon: 'fas fa-user-shield',
        showVillage: false
    }
};

let currentUserType = 'pet-owner';

// Event Listeners
showSignupBtn.addEventListener('click', showSignupForm);
showLoginBtn.addEventListener('click', showLoginForm);

loginFormElement.addEventListener('submit', function (e) {
    e.preventDefault();
    loginUser();
});

signupFormElement.addEventListener('submit', function (e) {
    e.preventDefault();
    signupUser();
});

logoutBtn.addEventListener('click', logoutUser);

passwordToggle.addEventListener('click', function () {
    togglePasswordVisibility('password', passwordToggle);
});

signupPasswordToggle.addEventListener('click', function () {
    togglePasswordVisibility('signupPassword', signupPasswordToggle);
});

userTypeBtns.forEach(btn => {
    btn.addEventListener('click', function () {
        // Remove active class from all buttons
        userTypeBtns.forEach(b => b.classList.remove('active'));

        // Add active class to clicked button
        this.classList.add('active');

        // Update current user type
        currentUserType = this.getAttribute('data-user-type');

        // Show/hide village field based on user type
        if (userTypes[currentUserType].showVillage) {
            villageField.classList.remove('hidden');
        } else {
            villageField.classList.add('hidden');
        }
    });
});

// Functions
function showSignupForm() {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signupForm.classList.add('fade-in');
}

function showLoginForm() {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    loginForm.classList.add('fade-in');
}

function togglePasswordVisibility(passwordFieldId, toggleButton) {
    const passwordField = document.getElementById(passwordFieldId);
    const icon = toggleButton.querySelector('i');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function loginUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // In a real application, this would validate against a backend
    // For demo purposes, we'll just show the dashboard
    if (username && password) {
        loginForm.classList.add('hidden');
        signupForm.classList.add('hidden');
        dashboard.classList.remove('hidden');

        // Update dashboard with user info
        document.getElementById('dashboardTitle').textContent = userTypes[currentUserType].title;
        document.getElementById('dashboardSubtitle').textContent = userTypes[currentUserType].subtitle;
        document.getElementById('dashboardUserType').textContent =
            document.querySelector(`[data-user-type="${currentUserType}"] .user-type-name`).textContent;
        document.getElementById('dashboardUsername').textContent = username;

        // Update login time
        const now = new Date();
        document.getElementById('loginTime').textContent = now.toLocaleString();

        // Update dashboard icon
        const dashboardIcon = document.querySelector('.dashboard-icon i');
        dashboardIcon.className = userTypes[currentUserType].icon;
    } else {
        alert('Please enter both username and password');
    }
}

function signupUser() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const fullName = document.getElementById('fullName').value;

    // Basic validation
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (!document.getElementById('agreeTerms').checked) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return;
    }

    // In a real application, this would send data to a backend
    // For demo purposes, we'll just show a success message and redirect to login
    alert('Account created successfully! You can now log in with your credentials.');
    showLoginForm();

    // Pre-fill the login form with the new credentials
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
}

function logoutUser() {
    dashboard.classList.add('hidden');
    loginForm.classList.remove('hidden');
    loginForm.classList.add('fade-in');

    // Clear form fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('signupUsername').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('fullName').value = '';
}