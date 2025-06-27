document.addEventListener('DOMContentLoaded', () => {
    const assignmentsList = document.getElementById('assignments-list');
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const isTeacher = user && user.role === 'teacher';

    // Add Create Assignment button for teachers
    if (isTeacher) {
        const createBtn = document.createElement('button');
        createBtn.textContent = 'Create Assignment';
        createBtn.className = 'mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700';
        createBtn.onclick = () => {
            // TODO: Show create assignment modal
            alert('Show create assignment modal');
        };
        assignmentsList.parentElement.insertBefore(createBtn, assignmentsList);
    }

    // Fetch assignments from backend
    fetch('http://localhost:5000/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(assignments => {
        const pendingSection = document.getElementById('pending-assignments-section');
        const submittedSection = document.getElementById('submitted-assignments-section');
        const assignmentsList = document.getElementById('assignments-list');
        const pendingList = document.getElementById('pending-assignments-list');
        const submittedList = document.getElementById('submitted-assignments-list');
        if (!isTeacher) {
            // Hide teacher section
            assignmentsList.style.display = 'none';
            // Show student sections
            pendingSection.style.display = '';
            submittedSection.style.display = '';
            pendingList.innerHTML = '';
            submittedList.innerHTML = '';
            (async () => {
                for (const assignment of assignments) {
                    const deadline = new Date(assignment.deadline);
                    const now = new Date();
                    const dueStr = deadline > now ? `Due: ${deadline.toLocaleString()}` : 'Deadline passed';
                    let hasSubmitted = false;
                    let submission = null;
                    try {
                        const res = await fetch(`http://localhost:5000/assignments/${assignment._id}/mysubmission`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (res.ok) {
                            submission = await res.json();
                            hasSubmitted = !!submission;
                        }
                    } catch (err) {
                        // Ignore error, fallback to allow submission
                    }
                    const card = document.createElement('div');
                    card.className = 'bg-white p-6 rounded-xl shadow-sm';
                    if (hasSubmitted) {
                        card.innerHTML = `
                            <h3 class="text-xl font-semibold mb-4">${assignment.title}</h3>
                            <p class="text-gray-600 mb-4">${assignment.description}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">${dueStr}</span>
                                <div class="flex gap-2">
                                    <button class='px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600' data-edit-submission='${assignment._id}'>Edit Submission</button>
                                </div>
                            </div>
                        `;
                    } else {
                        card.innerHTML = `
                            <h3 class="text-xl font-semibold mb-4">${assignment.title}</h3>
                            <p class="text-gray-600 mb-4">${assignment.description}</p>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">${dueStr}</span>
                                <div class="flex gap-2">
                                    <button class='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600' data-submit='${assignment._id}'>Submit Assignment</button>
                                </div>
                            </div>
                        `;
                    }
                    if (hasSubmitted) {
                        submittedList.appendChild(card);
                    } else {
                        pendingList.appendChild(card);
                    }
                }
            })();
        } else {
            // Show teacher section
            assignmentsList.style.display = '';
            // Hide student sections
            pendingSection.style.display = 'none';
            submittedSection.style.display = 'none';
            assignmentsList.innerHTML = '';
            assignments.forEach(assignment => {
                const deadline = new Date(assignment.deadline);
                const now = new Date();
                const dueStr = deadline > now ? `Due: ${deadline.toLocaleString()}` : 'Deadline passed';
                const card = document.createElement('div');
                card.className = 'bg-white p-6 rounded-xl shadow-sm';
                card.innerHTML = `
                    <h3 class="text-xl font-semibold mb-4">${assignment.title}</h3>
                    <p class="text-gray-600 mb-4">${assignment.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">${dueStr}</span>
                        <div class="flex gap-2">
                            <button class='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600' data-view-submissions='${assignment._id}'>View Submissions</button>
                            <button class='px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600' data-edit='${assignment._id}'>Edit</button>
                            <button class='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600' data-delete='${assignment._id}'>Delete</button>
                        </div>
                    </div>
                `;
                assignmentsList.appendChild(card);
            });
        }
        // Attach event listeners for buttons (after all cards are rendered)
        setTimeout(() => {
            assignmentsList.querySelectorAll('[data-submit]').forEach(btn => {
                btn.onclick = (e) => {
                    const id = btn.getAttribute('data-submit');
                    // TODO: Show submission modal/form
                    alert('Show submission modal for assignment ' + id);
                };
            });
            assignmentsList.querySelectorAll('[data-view-submissions]').forEach(btn => {
                btn.onclick = (e) => {
                    const id = btn.getAttribute('data-view-submissions');
                    // TODO: Show submissions modal/list for assignment
                    alert('Show submissions for assignment ' + id);
                };
            });
            assignmentsList.querySelectorAll('[data-edit]').forEach(btn => {
                btn.onclick = (e) => {
                    const id = btn.getAttribute('data-edit');
                    const assignment = assignments.find(a => a._id === id);
                    if (!assignment) return;
                    document.getElementById('edit-assignment-title').value = assignment.title;
                    document.getElementById('edit-assignment-description').value = assignment.description;
                    document.getElementById('edit-assignment-deadline').value = assignment.deadline.slice(0, 16);
                    window.currentEditAssignmentId = id;
                    showModal('edit-assignment-modal');
                };
            });
            assignmentsList.querySelectorAll('[data-delete]').forEach(btn => {
                btn.onclick = async (e) => {
                    const id = btn.getAttribute('data-delete');
                    if (confirm('Are you sure you want to delete this assignment? This will also delete all related submissions.')) {
                        try {
                            const res = await fetch(`http://localhost:5000/assignments/${id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (!res.ok) throw new Error('Failed to delete assignment');
                            location.reload();
                        } catch (err) {
                            alert(err.message);
                        }
                    }
                };
            });
            // Edit Submission button for students
            document.querySelectorAll('[data-edit-submission]').forEach(btn => {
                btn.onclick = (e) => {
                    const id = btn.getAttribute('data-edit-submission');
                    currentAssignmentId = id;
                    showModal('submit-assignment-modal');
                };
            });
        }, 100);
    })
    .catch(err => {
        assignmentsList.innerHTML = '<p class="text-red-500">Failed to load assignments.</p>';
    });

    // Modal logic and form handlers
    let currentAssignmentId = null;

    function showModal(id) {
        document.getElementById(id).classList.remove('hidden');
    }
    function hideModal(id) {
        document.getElementById(id).classList.add('hidden');
    }

    // Assignment Creation Modal (Teacher)
    const createModal = document.getElementById('create-assignment-modal');
    const createForm = document.getElementById('create-assignment-form');
    const cancelCreateBtn = document.getElementById('cancel-create-assignment');
    if (createForm && cancelCreateBtn) {
        cancelCreateBtn.onclick = () => hideModal('create-assignment-modal');
        createForm.onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('assignment-title').value;
            const description = document.getElementById('assignment-description').value;
            const deadline = document.getElementById('assignment-deadline').value;
            try {
                const res = await fetch('http://localhost:5000/assignments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description, deadline })
                });
                if (!res.ok) throw new Error('Failed to create assignment');
                hideModal('create-assignment-modal');
                location.reload();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    // Assignment Submission Modal (Student)
    const submitModal = document.getElementById('submit-assignment-modal');
    const submitForm = document.getElementById('submit-assignment-form');
    const cancelSubmitBtn = document.getElementById('cancel-submit-assignment');
    if (submitForm && cancelSubmitBtn) {
        cancelSubmitBtn.onclick = () => hideModal('submit-assignment-modal');
        submitForm.onsubmit = async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('assignment-file');
            if (!fileInput.files.length) {
                alert('Please select a file');
                return;
            }
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            try {
                const res = await fetch(`http://localhost:5000/assignments/${currentAssignmentId}/submit`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || 'Failed to submit assignment');
                }
                hideModal('submit-assignment-modal');
                location.reload();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    // View Submissions Modal (Teacher)
    const viewSubmissionsModal = document.getElementById('view-submissions-modal');
    const submissionsList = document.getElementById('submissions-list');
    const closeViewSubmissionsBtn = document.getElementById('close-view-submissions');
    if (closeViewSubmissionsBtn) {
        closeViewSubmissionsBtn.onclick = () => hideModal('view-submissions-modal');
    }

    async function loadSubmissions(assignmentId) {
        submissionsList.innerHTML = '<p>Loading...</p>';
        try {
            const res = await fetch(`http://localhost:5000/assignments/${assignmentId}/submissions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch submissions');
            const submissions = await res.json();
            if (submissions.length === 0) {
                submissionsList.innerHTML = '<p class="text-gray-500">No submissions yet.</p>';
                return;
            }
            submissionsList.innerHTML = '';
            submissions.forEach(sub => {
                const subDiv = document.createElement('div');
                subDiv.className = 'border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2';
                const fileUrl = `http://localhost:5000${sub.fileUrl}`;
                subDiv.innerHTML = `
                    <div>
                        <div class="font-semibold">${sub.student.username} (${sub.student.email})</div>
                        <div class="text-sm text-gray-500">Submitted: ${new Date(sub.submittedAt).toLocaleString()}</div>
                        <a href="${fileUrl}" target="_blank" class="text-blue-600 underline">Download File</a>
                    </div>
                    <div class="flex flex-col gap-2 md:items-end">
                        <div>
                            ${sub.feedback ? `<span class='text-green-600'>Feedback: ${sub.feedback}</span>` : `
                            <form data-feedback-form='${sub._id}' class='flex gap-2'>
                                <input type='text' name='feedback' placeholder='Feedback' class='border rounded px-2 py-1' required />
                                <button type='submit' class='px-3 py-1 bg-blue-500 text-white rounded'>Send</button>
                            </form>`}
                        </div>
                    </div>
                `;
                submissionsList.appendChild(subDiv);
            });
            // Attach feedback form handlers
            submissionsList.querySelectorAll('form[data-feedback-form]').forEach(form => {
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const submissionId = form.getAttribute('data-feedback-form');
                    const feedback = form.feedback.value;
                    try {
                        const res = await fetch(`http://localhost:5000/assignments/submission/${submissionId}/feedback`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ feedback })
                        });
                        if (!res.ok) throw new Error('Failed to send feedback');
                        await loadSubmissions(assignmentId); // Refresh list
                    } catch (err) {
                        alert(err.message);
                    }
                };
            });
        } catch (err) {
            submissionsList.innerHTML = `<p class='text-red-500'>${err.message}</p>`;
        }
    }

    // Edit Assignment Modal logic
    const editModal = document.getElementById('edit-assignment-modal');
    const editForm = document.getElementById('edit-assignment-form');
    const cancelEditBtn = document.getElementById('cancel-edit-assignment');
    if (editForm && cancelEditBtn) {
        cancelEditBtn.onclick = () => hideModal('edit-assignment-modal');
        editForm.onsubmit = async (e) => {
            e.preventDefault();
            const title = document.getElementById('edit-assignment-title').value;
            const description = document.getElementById('edit-assignment-description').value;
            const deadline = document.getElementById('edit-assignment-deadline').value;
            try {
                const res = await fetch(`http://localhost:5000/assignments/${window.currentEditAssignmentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description, deadline })
                });
                if (!res.ok) throw new Error('Failed to update assignment');
                hideModal('edit-assignment-modal');
                location.reload();
            } catch (err) {
                alert(err.message);
            }
        };
    }

    // Show modals on button click
    if (isTeacher) {
        document.addEventListener('click', function(e) {
            if (e.target && e.target.textContent === 'Create Assignment') {
                showModal('create-assignment-modal');
            }
        });
    }
    document.addEventListener('click', function(e) {
        if (e.target && e.target.hasAttribute('data-submit')) {
            currentAssignmentId = e.target.getAttribute('data-submit');
            showModal('submit-assignment-modal');
        }
    });

    if (isTeacher) {
        document.addEventListener('click', function(e) {
            if (e.target && e.target.hasAttribute('data-view-submissions')) {
                const assignmentId = e.target.getAttribute('data-view-submissions');
                showModal('view-submissions-modal');
                loadSubmissions(assignmentId);
            }
        });
    }
}); 