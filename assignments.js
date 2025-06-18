document.addEventListener('DOMContentLoaded', () => {
    const assignmentsList = document.getElementById('assignments-list');

    // Example assignment data
    const assignments = [
        { title: 'Math Homework', description: 'Complete exercises 1-10 on page 23', due: 'Due: 2 days' },
        { title: 'Science Project', description: 'Build a model volcano', due: 'Due: 1 week' },
        { title: 'History Essay', description: 'Write about the Industrial Revolution', due: 'Due: 5 days' },
        { title: 'English Reading', description: 'Read chapters 4-6 of the novel', due: 'Due: 3 days' }
    ];

    // Function to create assignment elements
    const createAssignmentElement = (assignment) => {
        const assignmentElement = document.createElement('div');
        assignmentElement.className = 'bg-white p-6 rounded-xl shadow-sm';
        assignmentElement.innerHTML = `
            <h3 class="text-xl font-semibold mb-4">${assignment.title}</h3>
            <p class="text-gray-600 mb-4">${assignment.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">${assignment.due}</span>
                <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    View Assignment
                </button>
            </div>
        `;
        return assignmentElement;
    };

    // Load assignments into the page
    assignments.forEach(assignment => {
        const assignmentElement = createAssignmentElement(assignment);
        assignmentsList.appendChild(assignmentElement);
    });
}); 