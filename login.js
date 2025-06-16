document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if(username && password) {
        // Store username in localStorage
        localStorage.setItem('loggedInUser', username);
        window.location.href = 'home.html';
    } else {
        alert('Please fill in all fields');
    }
});