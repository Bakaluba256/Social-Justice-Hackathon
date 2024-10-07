// Selecting the burger icon and the navigation links container for the hamburger menu
const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');

// Toggle the display of the navigation links when the burger is clicked
burger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
});

// Register Form Submission (if applicable)
document.getElementById('registerForm')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    const registerData = { username, password };

    fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert('User registered successfully');
            // Redirect to login page
        } else {
            alert('Registration failed: ' + data.errors.map(e => e.msg).join(', '));
        }
    })
    .catch(error => alert('Error: ' + error.message));
});

// Login Form Submission
document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const loginData = { username, password };

    fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // Store the JWT token in localStorage for later use
            localStorage.setItem('token', data.token);
            alert('Login successful');
            // Redirect to a protected page
        } else {
            alert('Login failed: Invalid username or password');
        }
    })
    .catch(error => alert('Error: ' + error.message));
});

// Logout Functionality
function logout() {
    localStorage.removeItem('token');
    alert('Logged out successfully');
    window.location.href = '/login.html';  // Redirect to login page
}

// Issue Submission Form
document.getElementById('issueForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    // Get values from the form fields
    const issueTitle = document.getElementById('issueTitle').value;
    const issueDescription = document.getElementById('issueDescription').value;
    const anonymous = document.getElementById('anonymous').checked;

    const issueData = {
        title: issueTitle,
        description: issueDescription,
        anonymous: anonymous
    };

    // If the user has checked "anonymous", allow issue submission without login
    if (anonymous) {
        submitIssue(issueData); // Call the function to submit the issue
    } else {
        // For non-anonymous submissions, require login
        const token = localStorage.getItem('token');
        if (!token) {
            alert('You need to log in first');
            window.location.href = '/login.html';  // Redirect to login page
        } else {
            // Submit the issue with the token for authenticated requests
            submitIssue(issueData, token);
        }
    }
});

// Function to submit issue
function submitIssue(issueData, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // If a token is provided, add it to the Authorization header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:5000/api/issues', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(issueData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.crmNumber) {
            alert(`Issue submitted successfully! CRM Number: ${data.crmNumber}`);
            document.getElementById('issueForm').reset();
        } else {
            alert('Failed to submit issue: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => alert('Error: ' + error.message));
}

// Optionally, handle fetching all issues and displaying them on a page
document.getElementById('fetchIssues')?.addEventListener('click', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You need to log in first');
        window.location.href = '/login.html';  // Redirect to login page
        return;
    }

    fetch('http://localhost:5000/api/issues', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(issues => {
        // You can dynamically display issues on the page
        console.log(issues); // Example: just log the issues
    })
    .catch(error => alert('Error fetching issues: ' + error.message));
});

//From here

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = { username, password };

    fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // Store the token and username in local storage
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);

            // Redirect to the dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message || 'Login failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login error');
    });
});
