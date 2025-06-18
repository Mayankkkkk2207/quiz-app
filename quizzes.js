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
            const res = await fetch('http://localhost:5000/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        modalQuizTitle.textContent = quiz.title;
        quizResult.classList.add('hidden');
        quizResult.textContent = '';
        // Render questions
        modalQuizQuestions.innerHTML = quiz.questions.map((q, idx) => `
            <div class="mb-6">
                <div class="font-semibold mb-2">${idx + 1}. ${q.text}</div>
                <div>
                    ${q.options.map((opt, oidx) => `
                        <label class="block mb-1">
                            <input type="radio" name="q${idx}" value="${oidx}" class="mr-2" required />
                            ${opt}
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
        quizModalOverlay.classList.remove('hidden');
        quizAttemptForm.onsubmit = async (e) => {
            e.preventDefault();
            // Collect answers
            const answers = quiz.questions.map((_, idx) => {
                const selected = quizAttemptForm.querySelector(`input[name="q${idx}"]:checked`);
                return selected ? parseInt(selected.value) : null;
            });
            if (answers.some(a => a === null)) {
                alert('Please answer all questions.');
                return;
            }
            // Submit answers
            try {
                const res = await fetch(`http://localhost:5000/api/quizzes/${quiz._id}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers })
                });
                const result = await res.json();
                quizResult.textContent = `Your Score: ${result.score} / ${result.total}`;
                quizResult.classList.remove('hidden');
            } catch (err) {
                quizResult.textContent = 'Failed to submit answers.';
                quizResult.classList.remove('hidden');
                console.error('Failed to submit answers:', err);
            }
        };
    }

    // Close modal
    closeQuizModalBtn && closeQuizModalBtn.addEventListener('click', () => {
        quizModalOverlay.classList.add('hidden');
    });
    // Close modal on overlay click (not modal itself)
    quizModalOverlay && quizModalOverlay.addEventListener('click', (e) => {
        if (e.target === quizModalOverlay) quizModalOverlay.classList.add('hidden');
    });
}); 