window.onload = function() {
    // Get username from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Check if user is logged in
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Update username display in the header
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = user.username;
    }

    // Add logout functionality if needed
    document.querySelector('.logout-button')?.addEventListener('click', function() {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function startQuiz(category) {
    // Store the selected category and redirect to quiz page
    localStorage.setItem('selectedQuiz', category);
    window.location.href = 'quiz.html';
}

window.addEventListener('DOMContentLoaded', async () => {
    // Get logged in username
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Update username in the welcome banner
    const homeUsername = document.getElementById('home-username');
    if (homeUsername) {
        homeUsername.textContent = user.username;
    }

    // Fetch quizzes and assignments for stats and dashboard
    let quizzes = [];
    let assignments = [];
    let quizSubmissions = [];
    let assignmentSubmissions = [];
    try {
        // Fetch all quizzes
        const quizRes = await fetch('http://localhost:5000/api/quizzes');
        quizzes = await quizRes.json();
        // Fetch all assignments
        const assignmentRes = await fetch('http://localhost:5000/assignments', {
            headers: token ? { 'Authorization': 'Bearer ' + token } : {}
        });
        assignments = await assignmentRes.json();
        // Fetch all quiz submissions for this user (use correct endpoint)
        const quizSubmissionsRes = await fetch('http://localhost:5000/api/quizzes/my-submissions', {
            headers: token ? { 'Authorization': 'Bearer ' + token } : {}
        });
        quizSubmissions = await quizSubmissionsRes.json();
        // Fetch all assignment submissions for this user
        const assignmentSubRes = await fetch('http://localhost:5000/assignments/submissions', {
            headers: token ? { 'Authorization': 'Bearer ' + token } : {}
        });
        assignmentSubmissions = await assignmentSubRes.json();
    } catch (err) {
        // If any fetch fails, fallback to empty arrays
        quizzes = quizzes || [];
        assignments = assignments || [];
        quizSubmissions = quizSubmissions || [];
        assignmentSubmissions = assignmentSubmissions || [];
    }

    // Calculate quizzes available and completed (ensure ID types match)
    let availableQuizzes = [];
    let completedQuizzes = [];
    if (user.role === 'student') {
        const attemptedQuizIds = new Set(quizSubmissions.map(sub => String(sub.quizId)));
        availableQuizzes = quizzes.filter(q => !attemptedQuizIds.has(String(q._id)));
        completedQuizzes = quizzes.filter(q => attemptedQuizIds.has(String(q._id)));
    }

    // Calculate assignments due (not submitted, deadline in future)
    let assignmentsDueCount = 0;
    const now = new Date();
    if (assignments && assignments.length > 0 && user.role === 'student') {
        for (const assignment of assignments) {
            try {
                const res = await fetch(`http://localhost:5000/assignments/${assignment._id}/mysubmission`, {
                    headers: token ? { 'Authorization': 'Bearer ' + token } : {}
                });
                if (res.ok) {
                    const submission = await res.json();
                    if (!submission && new Date(assignment.deadline) > now) {
                        assignmentsDueCount++;
                    }
                }
            } catch (err) { /* ignore */ }
        }
    }

    // Update stats
    document.getElementById('stat-quizzes').textContent = availableQuizzes.length;
    document.getElementById('stat-completed').textContent = completedQuizzes.length;
    document.getElementById('stat-assignments').textContent = assignmentsDueCount;

    // Populate Recent Activity (last 3 submitted assignments)
    const recentActivity = document.getElementById('recent-activity');
    let recentAssignments = [];
    if (assignments && assignments.length > 0 && user.role === 'student') {
        for (const assignment of assignments) {
            try {
                const res = await fetch(`http://localhost:5000/assignments/${assignment._id}/mysubmission`, {
                    headers: token ? { 'Authorization': 'Bearer ' + token } : {}
                });
                if (res.ok) {
                    const submission = await res.json();
                    if (submission) {
                        recentAssignments.push({
                            title: assignment.title,
                            date: submission.submittedAt,
                            assignmentId: assignment._id
                        });
                    }
                }
            } catch (err) { /* ignore */ }
        }
    }
    recentAssignments = recentAssignments.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    recentActivity.innerHTML = recentAssignments.length === 0 ? '<div class="text-gray-500">No recent assignment submissions.</div>' : recentAssignments.map(item =>
        `<div class="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div class="font-semibold">Assignment Submitted: ${item.title}</div>
                <div class="text-sm text-gray-500">${new Date(item.date).toLocaleString()}</div>
            </div>
            <button class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600" onclick="window.location.href='assignments.html'">Edit Submission</button>
        </div>`
    ).join('');

    // Populate Upcoming Deadlines (next 3 assignments not yet submitted, deadline in future)
    const upcomingDeadlines = document.getElementById('upcoming-deadlines');
    let upcoming = [];
    if (assignments && assignments.length > 0 && user.role === 'student') {
        for (const assignment of assignments) {
            try {
                const res = await fetch(`http://localhost:5000/assignments/${assignment._id}/mysubmission`, {
                    headers: token ? { 'Authorization': 'Bearer ' + token } : {}
                });
                if (res.ok) {
                    const submission = await res.json();
                    if (!submission && new Date(assignment.deadline) > now) {
                        upcoming.push({
                            title: assignment.title,
                            deadline: assignment.deadline
                        });
                    }
                }
            } catch (err) { /* ignore */ }
        }
    }
    upcoming = upcoming.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 3);
    upcomingDeadlines.innerHTML = upcoming.length === 0 ? '<div class="text-gray-500">No upcoming deadlines.</div>' : upcoming.map(item =>
        `<div class="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div class="font-semibold">Assignment: ${item.title}</div>
                <div class="text-sm text-gray-500">Due: ${new Date(item.deadline).toLocaleString()}</div>
            </div>
        </div>`
    ).join('');

    // Render Available Quizzes (not yet attempted by the student)
    let availableQuizzesDiv = document.getElementById('available-quizzes');
    availableQuizzesDiv.innerHTML = availableQuizzes.length === 0
        ? '<div class="text-gray-500">No available quizzes.</div>'
        : availableQuizzes.map(q =>
            `<div class="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div class="font-semibold">${q.title}</div>
                    <div class="text-sm text-gray-500">${q.description || ''}</div>
                </div>
                <a href="quizzes.html" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mt-2 sm:mt-0">Attempt Quiz</a>
            </div>`
        ).join('');

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