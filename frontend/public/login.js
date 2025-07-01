const loginForm = document.getElementById('loginForm');
const toggleFormMode = document.getElementById('toggle-form-mode');
const formTitle = document.getElementById('form-title');
const formSubmitBtn = document.getElementById('form-submit-btn');

let isLoginMode = true;

function setFormMode(loginMode) {
    isLoginMode = loginMode;
    if (loginMode) {
        formTitle.textContent = 'Quiz App Login';
        formSubmitBtn.textContent = 'Login';
        toggleFormMode.textContent = "Don't have an account? Register";
        document.getElementById('email').parentElement.style.display = 'block';
        document.getElementById('role').parentElement.style.display = 'block';
        document.getElementById('email').required = false;
        document.getElementById('role').required = false;
    } else {
        formTitle.textContent = 'Quiz App Register';
        formSubmitBtn.textContent = 'Register';
        toggleFormMode.textContent = 'Already have an account? Login';
        document.getElementById('email').parentElement.style.display = 'block';
        document.getElementById('role').parentElement.style.display = 'block';
        document.getElementById('email').required = true;
        document.getElementById('role').required = true;
    }
}

setFormMode(true);

toggleFormMode.addEventListener('click', () => {
    setFormMode(!isLoginMode);
});

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;

    if (isLoginMode) {
        // LOGIN
        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }
        try {
            const res = await fetch('https://quizsite-vxle.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                // Store JWT and user info as a single object
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Store login date/time as joinDate
                const now = new Date();
                const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
                const joinDate = now.toLocaleString('en-US', options);
                localStorage.setItem('joinDate', joinDate);
                window.location.href = 'home.html';
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            alert('Network error');
        }
    } else {
        // REGISTER
        if (!username || !email || !role || !password) {
            alert('Please fill in all fields');
            return;
        }
        try {
            const res = await fetch('https://quizsite-vxle.onrender.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Registration successful! You can now log in.');
                setFormMode(true);
                loginForm.reset();
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (err) {
            alert('Network error');
        }
    }
});