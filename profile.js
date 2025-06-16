document.addEventListener('DOMContentLoaded', () => {
    const profileInfo = document.getElementById('profile-info');
    const toggleSidebarButton = document.getElementById('toggle-sidebar');
    const sidebar = document.querySelector('.w-64');
    const mainContent = document.querySelector('.ml-64');

    // Example profile data
    const profile = {
        name: 'User Name',
        role: 'Quiz Enthusiast',
        email: 'user@example.com',
        joinDate: 'January 1, 2023'
    };

    // Function to create profile information elements
    const createProfileElement = (profile) => {
        const profileElement = document.createElement('div');
        profileElement.innerHTML = `
            <h3 class="text-xl font-semibold mb-4">${profile.name}</h3>
            <p class="text-gray-600 mb-2">Role: ${profile.role}</p>
            <p class="text-gray-600 mb-2">Email: ${profile.email}</p>
            <p class="text-gray-600">Joined: ${profile.joinDate}</p>
        `;
        return profileElement;
    };

    // Load profile information into the page
    const profileElement = createProfileElement(profile);
    profileInfo.appendChild(profileElement);

    toggleSidebarButton.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        mainContent.classList.toggle('ml-64');
        localStorage.setItem('sidebarVisible', !sidebar.classList.contains('hidden'));
    });

    // Check sidebar state on page load
    const sidebarVisible = localStorage.getItem('sidebarVisible') === 'true';
    if (sidebarVisible) {
        sidebar.classList.remove('hidden');
        mainContent.classList.add('ml-64');
    } else {
        mainContent.classList.remove('ml-64');
    }
}); 