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
    const role = localStorage.getItem('loggedInRole');
    if (role === 'teacher') {
        quizForm.classList.remove('hidden');
    } else {
        quizForm.classList.add('hidden');
    }

    // Dynamic question fields
    let questions = [createEmptyQuestion()];
    renderQuestionFields();

    function createEmptyQuestion() {
        return { text: '', options: ['', '', '', ''], correctAnswer: 0 };
    }

    function renderQuestionFields() {
        questionsContainer.innerHTML = '';
        questions.forEach((q, idx) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'mb-6 p-4 bg-gray-50 rounded border';
            qDiv.innerHTML = `
                <label class="block text-gray-700 mb-2">Question ${idx + 1}</label>
                <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded mb-2" placeholder="Question text" value="${q.text}" data-qidx="${idx}" data-type="text" required />
                <div class="grid grid-cols-2 gap-2 mb-2">
                    ${q.options.map((opt, oidx) => `
                        <input type="text" class="px-3 py-2 border border-gray-300 rounded" placeholder="Option ${oidx + 1}" value="${opt}" data-qidx="${idx}" data-oidx="${oidx}" data-type="option" required />
                    `).join('')}
                </div>
                <label class="block text-gray-600 mb-1">Correct Answer</label>
                <select class="mb-2 px-2 py-1 border rounded" data-qidx="${idx}" data-type="correct">
                    ${q.options.map((_, oidx) => `<option value="${oidx}" ${q.correctAnswer === oidx ? 'selected' : ''}>Option ${oidx + 1}</option>`).join('')}
                </select>
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
        // Validate questions
        if (!questions.every(q => q.text && q.options.every(opt => opt))) {
            alert('Please fill all question fields and options.');
            return;
        }
        const quizData = { title, description, questions };
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
                        <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" data-quizid="${quiz._id}">
                            Start Quiz
                        </button>
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
        }
    });

    function showQuizModal(quiz) {
        currentQuiz = quiz;
        currentQuestionIdx = 0;
        studentAnswers = Array(quiz.questions.length).fill(null);
        inReviewMode = false;
        modalQuizTitle.textContent = quiz.title;
        quizResult.classList.add('hidden');
        quizResult.textContent = '';
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
        quizQuestionCard.innerHTML = `
            <div class="bg-white rounded-xl shadow-lg p-6 mb-2 border border-blue-100 mx-auto max-w-md">
                <div class="font-semibold text-lg mb-4 text-blue-700">${currentQuestionIdx + 1}. ${q.text}</div>
                <div>
                    ${q.options.map((opt, oidx) => `
                        <label class="block mb-2 cursor-pointer">
                            <input type="radio" name="q${currentQuestionIdx}" value="${oidx}" class="mr-2 hidden" ${studentAnswers[currentQuestionIdx] === oidx ? 'checked' : ''} required />
                            <span class="inline-block w-full px-4 py-2 rounded transition-colors duration-200 ${studentAnswers[currentQuestionIdx] === oidx ? 'bg-blue-100 border border-blue-500 text-blue-700 font-semibold' : 'bg-gray-100 hover:bg-blue-50'}">${opt}</span>
                        </label>
                    `).join('')}
                </div>
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
        const answered = studentAnswers[currentQuestionIdx] !== null;
        nextBtn.disabled = !answered;
        submitBtn.disabled = !answered;
    }

    // Handle answer selection
    quizQuestionCard.addEventListener('change', (e) => {
        if (e.target.name && e.target.name.startsWith('q')) {
            const idx = currentQuestionIdx;
            studentAnswers[idx] = parseInt(e.target.value);
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
            if (studentAnswers.some(a => a === null)) {
                alert('Please answer all questions.');
                return;
            }
            showReviewSection();
            return;
        }
        // Final submit
        try {
            const res = await fetch(`http://localhost:5000/api/quizzes/${currentQuiz._id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: studentAnswers })
            });
            const result = await res.json();
            quizReviewSection.innerHTML = '';
            quizResult.textContent = `Your Score: ${result.score} / ${result.total}`;
            quizResult.classList.remove('hidden');
        } catch (err) {
            quizResult.textContent = 'Failed to submit answers.';
            quizResult.classList.remove('hidden');
            console.error('Failed to submit answers:', err);
        }
    };

    // Close modal
    closeQuizModalBtn && closeQuizModalBtn.addEventListener('click', () => {
        quizModalOverlay.classList.add('hidden');
    });
    // Close modal on overlay click (not modal itself)
    quizModalOverlay && quizModalOverlay.addEventListener('click', (e) => {
        if (e.target === quizModalOverlay) quizModalOverlay.classList.add('hidden');
    });
}); 