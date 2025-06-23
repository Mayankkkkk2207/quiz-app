document.addEventListener('DOMContentLoaded', () => {
    const quizzesList = document.getElementById('quizzes-list');
    const quizForm = document.getElementById('quiz-create-form');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');

    // Modal elements
    const quizModalOverlay = document.getElementById('quiz-modal-overlay');
    const quizModal = document.getElementById('quiz-modal');
    const closeQuizModalBtn = document.getElementById('close-quiz-modal');
    const modalQuizTitle = document.getElementById('modal-quiz-title');
    const modalQuizQuestions = document.getElementById('modal-quiz-questions');
    const quizAttemptForm = document.getElementById('quiz-attempt-form');
    const quizResult = document.getElementById('quiz-result');

    // Check user role
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user ? user.role : null;
    if (role === 'teacher') {
        quizForm.classList.remove('hidden');
    } else {
        quizForm.classList.add('hidden');
    }

    // Dynamic question fields
    let questions = [createEmptyQuestion()];
    renderQuestionFields();

    function createEmptyQuestion() {
        return { type: 'mcq-single', text: '', options: ['', '', '', ''], correctAnswer: 0, correctAnswers: [] };
    }

    function renderQuestionFields() {
        questionsContainer.innerHTML = '';
        questions.forEach((q, idx) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'mb-6 p-4 bg-gray-50 rounded border';
            qDiv.innerHTML = `
                <div class="flex items-center mb-2">
                    <label class="block text-gray-700 mr-2">Type:</label>
                    <select class="question-type-select border rounded px-2 py-1" data-qidx="${idx}">
                        <option value="mcq-single" ${q.type === 'mcq-single' ? 'selected' : ''}>MCQ (Single Correct)</option>
                        <option value="mcq-multi" ${q.type === 'mcq-multi' ? 'selected' : ''}>MCQ (Multiple Correct)</option>
                        <option value="fill-blank" ${q.type === 'fill-blank' ? 'selected' : ''}>Fill in the Blank</option>
                    </select>
                </div>
                <label class="block text-gray-700 mb-2">Question ${idx + 1}</label>
                <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded mb-2" placeholder="Question text" value="${q.text}" data-qidx="${idx}" data-type="text" required />
                <div class="mb-2">
                    ${q.type === 'fill-blank' ? `
                        <label class="block text-gray-600 mb-1">Correct Answer</label>
                        <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Correct answer" value="${q.correctAnswer || ''}" data-qidx="${idx}" data-type="fill-blank-answer" required />
                    ` : `
                        <div class="grid grid-cols-2 gap-2 mb-2">
                            ${q.options.map((opt, oidx) => `
                                <input type="text" class="px-3 py-2 border border-gray-300 rounded" placeholder="Option ${oidx + 1}" value="${opt}" data-qidx="${idx}" data-oidx="${oidx}" data-type="option" required />
                            `).join('')}
                        </div>
                        ${q.type === 'mcq-single' ? `
                            <label class="block text-gray-600 mb-1">Correct Answer</label>
                            <select class="mb-2 px-2 py-1 border rounded" data-qidx="${idx}" data-type="correct">
                                ${q.options.map((_, oidx) => `<option value="${oidx}" ${q.correctAnswer === oidx ? 'selected' : ''}>Option ${oidx + 1}</option>`).join('')}
                            </select>
                        ` : `
                            <label class="block text-gray-600 mb-1">Correct Answers (select all that apply)</label>
                            <div class="flex gap-2 mb-2">
                                ${q.options.map((_, oidx) => `
                                    <label class="flex items-center">
                                        <input type="checkbox" data-qidx="${idx}" data-oidx="${oidx}" data-type="multi-correct" ${q.correctAnswers && q.correctAnswers.includes(oidx) ? 'checked' : ''} />
                                        <span class="ml-1">Option ${oidx + 1}</span>
                                    </label>
                                `).join('')}
                            </div>
                        `}
                    `}
                </div>
                <button type="button" class="text-red-500 mt-2 remove-question-btn" data-remove="${idx}">Remove</button>
            `;
            questionsContainer.appendChild(qDiv);
        });
    }

    // Handle input changes
    questionsContainer.addEventListener('input', (e) => {
        const qidx = +e.target.getAttribute('data-qidx');
        const type = e.target.getAttribute('data-type');
        if (type === 'text') {
            questions[qidx].text = e.target.value;
        } else if (type === 'option') {
            const oidx = +e.target.getAttribute('data-oidx');
            questions[qidx].options[oidx] = e.target.value;
        } else if (type === 'correct') {
            questions[qidx].correctAnswer = +e.target.value;
        } else if (type === 'fill-blank-answer') {
            questions[qidx].correctAnswer = e.target.value;
        }
    });

    // Handle type change and multi-correct checkboxes
    questionsContainer.addEventListener('change', (e) => {
        const qidx = +e.target.getAttribute('data-qidx');
        const type = e.target.getAttribute('data-type');
        if (e.target.classList.contains('question-type-select')) {
            questions[qidx].type = e.target.value;
            // Reset answers/options for new type
            if (e.target.value === 'fill-blank') {
                questions[qidx].options = ['', '', '', ''];
                questions[qidx].correctAnswer = '';
                questions[qidx].correctAnswers = [];
            } else if (e.target.value === 'mcq-single') {
                questions[qidx].options = ['', '', '', ''];
                questions[qidx].correctAnswer = 0;
                questions[qidx].correctAnswers = [];
            } else if (e.target.value === 'mcq-multi') {
                questions[qidx].options = ['', '', '', ''];
                questions[qidx].correctAnswer = 0;
                questions[qidx].correctAnswers = [];
            }
            renderQuestionFields();
        } else if (type === 'multi-correct') {
            const oidx = +e.target.getAttribute('data-oidx');
            if (!questions[qidx].correctAnswers) questions[qidx].correctAnswers = [];
            if (e.target.checked) {
                if (!questions[qidx].correctAnswers.includes(oidx)) questions[qidx].correctAnswers.push(oidx);
            } else {
                questions[qidx].correctAnswers = questions[qidx].correctAnswers.filter(i => i !== oidx);
            }
        }
    });

    // Remove question
    questionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-question-btn')) {
            const idx = +e.target.getAttribute('data-remove');
            questions.splice(idx, 1);
            if (questions.length === 0) questions.push(createEmptyQuestion());
            renderQuestionFields();
        }
    });

    // Add question
    addQuestionBtn && addQuestionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        questions.push(createEmptyQuestion());
        renderQuestionFields();
        console.log('Added question. Total:', questions.length);
    });

    // Submit quiz
    quizForm && quizForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('quiz-title').value;
        const description = document.getElementById('quiz-description').value;
        const timeLimit = parseInt(document.getElementById('quiz-timelimit').value, 10);
        // Validate questions
        for (const q of questions) {
            if (!q.text) {
                alert('Please fill all question fields.');
                return;
            }
            if (q.type === 'fill-blank' && !q.correctAnswer) {
                alert('Please provide the correct answer for fill in the blank questions.');
                return;
            }
            if ((q.type === 'mcq-single' || q.type === 'mcq-multi') && !q.options.every(opt => opt)) {
                alert('Please fill all options for MCQ questions.');
                return;
            }
            if (q.type === 'mcq-single' && (typeof q.correctAnswer !== 'number' || isNaN(q.correctAnswer))) {
                alert('Please select the correct answer for all MCQ (single) questions.');
                return;
            }
            if (q.type === 'mcq-multi' && (!q.correctAnswers || q.correctAnswers.length === 0)) {
                alert('Please select at least one correct answer for all MCQ (multiple) questions.');
                return;
            }
        }
        // Prepare questions for backend
        const questionsForBackend = questions.map(q => {
            if (q.type === 'mcq-single') {
                return {
                    type: q.type,
                    text: q.text,
                    options: q.options,
                    correctAnswer: q.correctAnswer
                };
            } else if (q.type === 'mcq-multi') {
                return {
                    type: q.type,
                    text: q.text,
                    options: q.options,
                    correctAnswers: q.correctAnswers
                };
            } else if (q.type === 'fill-blank') {
                return {
                    type: q.type,
                    text: q.text,
                    correctAnswer: q.correctAnswer
                };
            }
        });
        const quizData = { title, description, questions: questionsForBackend };
        if (!isNaN(timeLimit) && timeLimit > 0) quizData.timeLimit = timeLimit;
        try {
            console.log('Submitting quiz:', quizData);
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': 'Bearer ' + token } : {})
                },
                body: JSON.stringify(quizData)
            });
            if (res.ok) {
                alert('Quiz created!');
                questions = [createEmptyQuestion()];
                quizForm.reset();
                renderQuestionFields();
                await loadQuizzes();
            } else {
                const err = await res.json();
                alert('Error: ' + err.error);
                console.error('Quiz creation error:', err);
            }
        } catch (err) {
            alert('Network error');
            console.error('Network error:', err);
        }
    });

    // Fetch and display quizzes for all users
    async function loadQuizzes() {
        quizzesList.innerHTML = '';
        try {
            const res = await fetch('http://localhost:5000/api/quizzes');
            const quizzes = await res.json();
            if (!Array.isArray(quizzes)) {
                quizzesList.innerHTML = '<p class="text-red-500">Failed to load quizzes (bad response).</p>';
                console.error('Bad quizzes response:', quizzes);
                return;
            }
            quizzes.forEach(quiz => {
                const quizElement = document.createElement('div');
                quizElement.className = 'bg-white p-6 rounded-xl shadow-sm';
                quizElement.innerHTML = `
                    <h3 class="text-xl font-semibold mb-4">${quiz.title}</h3>
                    <p class="text-gray-600 mb-4">${quiz.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">${quiz.questions.length} questions</span>
                        <div class="flex gap-2">
                            <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" data-quizid="${quiz._id}">
                                Start Quiz
                            </button>
                            ${role === 'teacher' ? `<button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600" data-viewsubmissions="${quiz._id}">View Submissions</button>` : ''}
                            ${role === 'teacher' ? `<button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" data-deletequiz="${quiz._id}">Delete</button>` : ''}
                        </div>
                    </div>
                `;
                quizzesList.appendChild(quizElement);
            });
            console.log('Loaded quizzes:', quizzes);
        } catch (err) {
            quizzesList.innerHTML = '<p class="text-red-500">Failed to load quizzes.</p>';
            console.error('Failed to load quizzes:', err);
        }
    }

    loadQuizzes();

    // Quiz attempt modal logic
    let currentQuiz = null;
    let currentQuestionIdx = 0;
    let studentAnswers = [];
    let inReviewMode = false;

    // Elements for new UI
    const quizProgress = document.getElementById('quiz-progress');
    const quizStepper = document.getElementById('quiz-stepper');
    const quizProgressBar = document.getElementById('quiz-progress-bar');
    const quizQuestionCard = document.getElementById('quiz-question-card');
    const quizReviewSection = document.getElementById('quiz-review-section');
    const prevBtn = document.getElementById('prev-question-btn');
    const nextBtn = document.getElementById('next-question-btn');
    const submitBtn = document.getElementById('submit-test-btn');
    // Submissions modal elements
    const submissionsModalOverlay = document.getElementById('submissions-modal-overlay');
    const submissionsModal = document.getElementById('submissions-modal');
    const closeSubmissionsModalBtn = document.getElementById('close-submissions-modal');
    const submissionsModalTitle = document.getElementById('submissions-modal-title');
    const submissionsList = document.getElementById('submissions-list');
    // Timer
    let timerInterval = null;
    let timeLeft = 0;
    let timerDisplay = null;
    let timerInitialized = false;

    quizzesList.addEventListener('click', async (e) => {
        if (e.target.matches('button[data-quizid]')) {
            const quizId = e.target.getAttribute('data-quizid');
            // Fetch quiz details
            try {
                const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}`);
                if (!res.ok) throw new Error('Quiz not found');
                const quiz = await res.json();
                showQuizModal(quiz);
            } catch (err) {
                alert('Failed to load quiz.');
                console.error('Failed to load quiz:', err);
            }
        } else if (e.target.matches('button[data-viewsubmissions]')) {
            const quizId = e.target.getAttribute('data-viewsubmissions');
            submissionsModalTitle.textContent = 'Quiz Submissions';
            submissionsList.innerHTML = '<div class="text-gray-500">Loading...</div>';
            submissionsModalOverlay.classList.remove('hidden');
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}/submissions`, {
                    headers: token ? { 'Authorization': 'Bearer ' + token } : {}
                });
                const submissions = await res.json();
                if (!Array.isArray(submissions)) {
                    submissionsList.innerHTML = '<div class="text-red-500">Failed to load submissions.</div>';
                    return;
                }
                if (submissions.length === 0) {
                    submissionsList.innerHTML = '<div class="text-gray-500">No submissions yet.</div>';
                    return;
                }
                submissionsList.innerHTML = `
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b">
                                <th class="py-2 px-3">Student</th>
                                <th class="py-2 px-3">Email</th>
                                <th class="py-2 px-3">Score</th>
                                <th class="py-2 px-3">Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${submissions.map(sub => `
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="py-2 px-3">${sub.student.username}</td>
                                    <td class="py-2 px-3">${sub.student.email}</td>
                                    <td class="py-2 px-3">${sub.score} / ${sub.total}</td>
                                    <td class="py-2 px-3">${new Date(sub.submittedAt).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            } catch (err) {
                submissionsList.innerHTML = '<div class="text-red-500">Failed to load submissions.</div>';
            }
        } else if (e.target.matches('button[data-deletequiz]')) {
            const quizId = e.target.getAttribute('data-deletequiz');
            if (confirm('Are you sure you want to delete this quiz? This will also delete all related submissions.')) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
                        method: 'DELETE',
                        headers: token ? { 'Authorization': 'Bearer ' + token } : {}
                    });
                    const result = await res.json();
                    if (res.ok) {
                        alert('Quiz deleted successfully.');
                        await loadQuizzes();
                    } else {
                        alert(result.error || 'Failed to delete quiz.');
                    }
                } catch (err) {
                    alert('Network error');
                }
            }
        }
    });

    function showQuizModal(quiz) {
        currentQuiz = quiz;
        currentQuestionIdx = 0;
        studentAnswers = Array(quiz.questions.length).fill(null);
        inReviewMode = false;
        modalQuizTitle.textContent = quiz.title;
        // Always reset UI elements when starting a quiz
        quizProgress.style.display = '';
        if (timerDisplay) timerDisplay.style.display = '';
        prevBtn.style.display = 'none';
        nextBtn.style.display = quiz.questions.length > 1 ? 'inline-flex' : 'none';
        submitBtn.style.display = 'inline-flex';
        submitBtn.classList.remove('hidden');
        quizResult.classList.add('hidden');
        quizResult.textContent = '';
        // Timer logic
        if (!timerInitialized) {
            timerDisplay = document.createElement('div');
            timerDisplay.id = 'quiz-timer';
            timerDisplay.className = 'text-lg font-bold text-red-600 mb-2 text-center';
            quizProgress.parentNode.insertBefore(timerDisplay, quizProgress);
            timerInitialized = true;
        }
        if (timerInterval) clearInterval(timerInterval);
        if (quiz.timeLimit && quiz.timeLimit > 0) {
            timeLeft = quiz.timeLimit * 60;
            updateTimerDisplay();
            timerDisplay.style.display = '';
            timerInterval = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    autoSubmitQuiz();
                }
            }, 1000);
        } else {
            timerDisplay.style.display = 'none';
        }
        renderCurrentQuestion(true);
        quizModalOverlay.classList.remove('hidden');
    }

    function renderCurrentQuestion(fade = false) {
        if (!currentQuiz) return;
        quizReviewSection.classList.add('hidden');
        quizQuestionCard.classList.remove('opacity-0');
        // Progress bar and stepper
        quizStepper.textContent = `Question ${currentQuestionIdx + 1} of ${currentQuiz.questions.length}`;
        quizProgressBar.style.width = `${((currentQuestionIdx + 1) / currentQuiz.questions.length) * 100}%`;
        // Card layout
        const q = currentQuiz.questions[currentQuestionIdx];
        let optionsHtml = '';
        if (q.type === 'mcq-single') {
            optionsHtml = q.options.map((opt, oidx) => `
                <label class="block mb-2 cursor-pointer">
                    <input type="radio" name="q${currentQuestionIdx}" value="${oidx}" class="mr-2 hidden" ${studentAnswers[currentQuestionIdx] === oidx ? 'checked' : ''} required />
                    <span class="inline-block w-full px-4 py-2 rounded transition-colors duration-200 ${studentAnswers[currentQuestionIdx] === oidx ? 'bg-blue-100 border border-blue-500 text-blue-700 font-semibold' : 'bg-gray-100 hover:bg-blue-50'}">${opt}</span>
                </label>
            `).join('');
        } else if (q.type === 'mcq-multi') {
            // studentAnswers[currentQuestionIdx] is an array of selected indices
            if (!Array.isArray(studentAnswers[currentQuestionIdx])) studentAnswers[currentQuestionIdx] = [];
            optionsHtml = q.options.map((opt, oidx) => `
                <label class="block mb-2 cursor-pointer">
                    <input type="checkbox" name="q${currentQuestionIdx}" value="${oidx}" class="mr-2" ${studentAnswers[currentQuestionIdx].includes(oidx) ? 'checked' : ''} />
                    <span class="inline-block w-full px-4 py-2 rounded transition-colors duration-200 ${studentAnswers[currentQuestionIdx].includes(oidx) ? 'bg-blue-100 border border-blue-500 text-blue-700 font-semibold' : 'bg-gray-100 hover:bg-blue-50'}">${opt}</span>
                </label>
            `).join('');
        } else if (q.type === 'fill-blank') {
            optionsHtml = `
                <input type="text" name="q${currentQuestionIdx}" class="w-full px-4 py-2 border rounded bg-gray-100 focus:bg-white" value="${studentAnswers[currentQuestionIdx] || ''}" placeholder="Your answer..." required />
            `;
        }
        quizQuestionCard.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-6 mb-2 border border-blue-100 mx-auto max-w-md">
                <div class="font-semibold text-lg mb-4 text-blue-700">${currentQuestionIdx + 1}. ${q.text}</div>
                <div>${optionsHtml}</div>
            </div>
        `;
        // Fade transition
        if (fade) {
            quizQuestionCard.classList.add('opacity-0');
            setTimeout(() => quizQuestionCard.classList.remove('opacity-0'), 50);
        }
        // Update button visibility and state
        prevBtn.style.display = currentQuestionIdx === 0 ? 'none' : 'inline-flex';
        nextBtn.style.display = currentQuestionIdx === currentQuiz.questions.length - 1 ? 'none' : 'inline-flex';
        submitBtn.classList.toggle('hidden', currentQuestionIdx !== currentQuiz.questions.length - 1);
        // Disable next/submit if not answered
        let answered = false;
        if (q.type === 'mcq-single') {
            answered = studentAnswers[currentQuestionIdx] !== null && studentAnswers[currentQuestionIdx] !== undefined;
        } else if (q.type === 'mcq-multi') {
            answered = Array.isArray(studentAnswers[currentQuestionIdx]) && studentAnswers[currentQuestionIdx].length > 0;
        } else if (q.type === 'fill-blank') {
            answered = !!studentAnswers[currentQuestionIdx];
        }
        nextBtn.disabled = !answered;
        submitBtn.disabled = !answered;
        // Only update timer text, do not re-create timer
        if (timerDisplay && currentQuiz.timeLimit && currentQuiz.timeLimit > 0) {
            updateTimerDisplay();
        }
    }

    // Handle answer selection
    quizQuestionCard.addEventListener('change', (e) => {
        const q = currentQuiz.questions[currentQuestionIdx];
        const idx = currentQuestionIdx;
        if (q.type === 'mcq-single' && e.target.name && e.target.name.startsWith('q')) {
            studentAnswers[idx] = parseInt(e.target.value);
            renderCurrentQuestion();
        } else if (q.type === 'mcq-multi' && e.target.type === 'checkbox') {
            if (!Array.isArray(studentAnswers[idx])) studentAnswers[idx] = [];
            const val = parseInt(e.target.value);
            if (e.target.checked) {
                if (!studentAnswers[idx].includes(val)) studentAnswers[idx].push(val);
            } else {
                studentAnswers[idx] = studentAnswers[idx].filter(i => i !== val);
            }
            renderCurrentQuestion();
        } else if (q.type === 'fill-blank' && e.target.name && e.target.name.startsWith('q')) {
            studentAnswers[idx] = e.target.value;
            renderCurrentQuestion();
        }
    });

    // For fill-in-the-blank, update on input (not just change)
    quizQuestionCard.addEventListener('input', (e) => {
        const q = currentQuiz.questions[currentQuestionIdx];
        const idx = currentQuestionIdx;
        if (q.type === 'fill-blank' && e.target.name && e.target.name.startsWith('q')) {
            studentAnswers[idx] = e.target.value;
            renderCurrentQuestion();
        }
    });

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        if (currentQuestionIdx > 0) {
            currentQuestionIdx--;
            renderCurrentQuestion(true);
        }
    });
    nextBtn.addEventListener('click', () => {
        if (currentQuestionIdx < currentQuiz.questions.length - 1) {
            currentQuestionIdx++;
            renderCurrentQuestion(true);
        }
    });

    // Review before submit
    function showReviewSection() {
        inReviewMode = true;
        quizQuestionCard.innerHTML = '';
        quizReviewSection.classList.remove('hidden');
        quizReviewSection.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-6 border border-blue-100 mx-auto max-w-md">
                <div class="font-bold text-lg mb-4 text-blue-700">Review Your Answers</div>
                <ol class="list-decimal ml-6">
                    ${currentQuiz.questions.map((q, idx) => `
                        <li class="mb-2">
                            <div class="font-semibold">${q.text}</div>
                            <div class="ml-2 text-gray-700">${q.options[studentAnswers[idx]] !== undefined ? q.options[studentAnswers[idx]] : '<span class=\'text-red-500\'>No answer</span>'}</div>
                        </li>
                    `).join('')}
                </ol>
                <button type="submit" class="mt-6 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 flex items-center justify-center"><span class="material-icons mr-1">check_circle</span>Submit Test</button>
            </div>
        `;
    }

    // Submit test
    quizAttemptForm.onsubmit = async (e) => {
        e.preventDefault();
        if (!inReviewMode && currentQuestionIdx === currentQuiz.questions.length - 1) {
            // Show review section before final submit
            for (let i = 0; i < currentQuiz.questions.length; i++) {
                const q = currentQuiz.questions[i];
                if (q.type === 'mcq-single' && (studentAnswers[i] === null || studentAnswers[i] === undefined)) {
                    alert('Please answer all questions.');
                    return;
                }
                if (q.type === 'mcq-multi' && (!Array.isArray(studentAnswers[i]) || studentAnswers[i].length === 0)) {
                    alert('Please answer all questions.');
                    return;
                }
                if (q.type === 'fill-blank' && !studentAnswers[i]) {
                    alert('Please answer all questions.');
                    return;
                }
            }
            showReviewSection();
            return;
        }
        // Final submit
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        try {
            // Prepare answers for backend
            const answersForBackend = currentQuiz.questions.map((q, idx) => {
                if (q.type === 'mcq-single') {
                    return studentAnswers[idx];
                } else if (q.type === 'mcq-multi') {
                    return studentAnswers[idx];
                } else if (q.type === 'fill-blank') {
                    return studentAnswers[idx];
                }
            });
            const res = await fetch(`http://localhost:5000/api/quizzes/${currentQuiz._id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: answersForBackend })
            });
            const result = await res.json();
            quizReviewSection.innerHTML = '';
            // Hide all quiz UI and show thank you message
            quizQuestionCard.innerHTML = '';
            quizProgress.style.display = 'none';
            if (timerDisplay) timerDisplay.style.display = 'none';
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'none';
            if (res.ok && typeof result.score === 'number' && typeof result.total === 'number') {
                quizResult.innerHTML = `<div class="text-3xl font-bold text-green-600 mb-4">Thank you for attempting the quiz!</div><div class="text-xl text-gray-700">Your Score: ${result.score} / ${result.total}</div>`;
            } else {
                let errorMsg = 'Failed to submit answers.';
                if (result && result.error) {
                    errorMsg = result.error;
                }
                quizResult.innerHTML = `<div class="text-3xl font-bold text-red-600 mb-4">${errorMsg}</div>`;
                console.error('Quiz submit error:', res.status, result);
            }
            quizResult.classList.remove('hidden');
        } catch (err) {
            let errorMsg = 'Failed to submit answers.';
            if (err && err.response) {
                errorMsg = err.response.error || errorMsg;
            }
            quizResult.innerHTML = `<div class="text-3xl font-bold text-red-600 mb-4">${errorMsg}</div>`;
            quizResult.classList.remove('hidden');
            console.error('Failed to submit answers:', err);
        }
    };

    // Close modal
    closeQuizModalBtn && closeQuizModalBtn.addEventListener('click', () => {
        quizModalOverlay.classList.add('hidden');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    });
    // Close modal on overlay click (not modal itself)
    quizModalOverlay && quizModalOverlay.addEventListener('click', (e) => {
        if (e.target === quizModalOverlay) {
            quizModalOverlay.classList.add('hidden');
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
        }
    });
    closeSubmissionsModalBtn && closeSubmissionsModalBtn.addEventListener('click', () => {
        submissionsModalOverlay.classList.add('hidden');
    });
    submissionsModalOverlay && submissionsModalOverlay.addEventListener('click', (e) => {
        if (e.target === submissionsModalOverlay) submissionsModalOverlay.classList.add('hidden');
    });

    function updateTimerDisplay() {
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        timerDisplay.textContent = `Time Left: ${min}:${sec.toString().padStart(2, '0')}`;
    }

    function autoSubmitQuiz() {
        // If in review mode, do nothing
        if (inReviewMode) return;
        // If not all answered, fill unanswered with null
        for (let i = 0; i < studentAnswers.length; i++) {
            if (studentAnswers[i] === null) studentAnswers[i] = null;
        }
        // Submit as if form was submitted
        quizAttemptForm.requestSubmit();
    }
}); 