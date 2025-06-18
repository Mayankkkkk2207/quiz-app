document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if(username && email && password) {
        // Store username and email in localStorage
        localStorage.setItem('loggedInUser', username);
        localStorage.setItem('loggedInEmail', email);
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