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

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('-translate-x-full');
        });
    }
    if (closeMobileMenuBtn && mobileMenu) {
        closeMobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.add('-translate-x-full');
        });
    }
    document.addEventListener('click', function(event) {
        if (mobileMenu && mobileMenuBtn && !mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
            mobileMenu.classList.add('-translate-x-full');
        }
    });
});