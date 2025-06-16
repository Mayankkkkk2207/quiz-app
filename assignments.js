document.addEventListener('DOMContentLoaded', () => {
    const assignmentsList = document.getElementById('assignments-list');

    // Example assignment data
    const assignments = [
        { title: 'Assignment 1', description: 'Description for Assignment 1' },
        { title: 'Assignment 2', description: 'Description for Assignment 2' },
        { title: 'Assignment 3', description: 'Description for Assignment 3' }
    ];

    // Function to create assignment elements
    const createAssignmentElement = (assignment) => {
        const assignmentElement = document.createElement('div');
        assignmentElement.className = 'bg-white p-6 rounded-xl shadow-sm';
        assignmentElement.innerHTML = `
            <h3 class="text-xl font-semibold mb-4">${assignment.title}</h3>
            <p class="text-gray-600 mb-4">${assignment.description}</p>
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">Due: 1 week</span>
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