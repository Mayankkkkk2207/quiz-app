document.addEventListener('DOMContentLoaded', () => {
    const quizzesList = document.getElementById('quizzes-list');

    // Example quiz data
    const quizzes = [
        { title: 'Quiz 1', description: 'Description for Quiz 1' },
        { title: 'Quiz 2', description: 'Description for Quiz 2' },
        { title: 'Quiz 3', description: 'Description for Quiz 3' }
    ];

    // Function to create quiz elements
    const createQuizElement = (quiz) => {
        const quizElement = document.createElement('div');
        quizElement.className = 'bg-white p-6 rounded-xl shadow-sm';
        quizElement.innerHTML = `
            <h3 class="text-xl font-semibold mb-4">${quiz.title}</h3>
            <p class="text-gray-600 mb-4">${quiz.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">20 questions</span>
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Start Quiz
                </button>
            </div>
        `;
        return quizElement;
    };

    // Load quizzes into the page
    quizzes.forEach(quiz => {
        const quizElement = createQuizElement(quiz);
        quizzesList.appendChild(quizElement);
    });
}); 