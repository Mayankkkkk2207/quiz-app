document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    
    if(username && email && role && password) {
        // Store username, email, and role in localStorage
        localStorage.setItem('loggedInUser', username);
        localStorage.setItem('loggedInEmail', email);
        localStorage.setItem('loggedInRole', role);
        // Store login date/time as joinDate
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
        const joinDate = now.toLocaleString('en-US', options);
        localStorage.setItem('joinDate', joinDate);
        window.location.href = 'home.html';
    } else {
        alert('Please fill in all fields');
    }
});