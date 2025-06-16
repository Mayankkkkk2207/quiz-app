// Check if user is logged in
window.onload = function() {
    // Get username from localStorage
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    // Check if user is logged in
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    // Update username display in the header
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = loggedInUser;
    }

    // Add logout functionality if needed
    document.querySelector('.logout-button')?.addEventListener('click', function() {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });
}

function logout() {
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

function startQuiz(category) {
    // Store the selected category and redirect to quiz page
    localStorage.setItem('selectedQuiz', category);
    window.location.href = 'quiz.html';
}

// Mobile menu functionality
document.getElementById('mobile-menu-button').addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
        mobileMenu.classList.add('hidden');
    }
});

document.querySelector('button').addEventListener('click', function() {
    // Replace with your email
    const email = "your.email@example.com";
    navigator.clipboard.writeText(email).then(function() {
        alert('Email copied to clipboard!');
    }).catch(function(err) {
        console.error('Failed to copy email: ', err);
    });
});

window.addEventListener('DOMContentLoaded', () => {
    // Get logged in username
    const loggedInUser = localStorage.getItem('loggedInUser');
    
    // If no user is logged in, redirect to login
    if (!loggedInUser) {
        window.location.href = 'login.html';
        return;
    }

    // Update username in the profile section
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = loggedInUser;
    }
});