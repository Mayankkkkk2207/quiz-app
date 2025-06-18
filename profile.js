document.addEventListener('DOMContentLoaded', () => {
    const profileInfo = document.getElementById('profile-info');

    // Get username, email, role, and joinDate from localStorage, fallback to defaults
    const username = localStorage.getItem('loggedInUser') || 'User Name';
    const email = localStorage.getItem('loggedInEmail') || 'user@example.com';
    const role = localStorage.getItem('loggedInRole') || 'Quiz Enthusiast';
    const joinDate = localStorage.getItem('joinDate') || 'Unknown';

    // Example profile data
    const profile = {
        name: username,
        role: role.charAt(0).toUpperCase() + role.slice(1),
        email: email,
        joinDate: joinDate
    };

    // Function to create profile information elements
    const createProfileElement = (profile) => {
        const profileElement = document.createElement('div');
        profileElement.className = 'flex flex-col items-start w-full max-w-md mx-auto';
        profileElement.innerHTML = `
            <h3 class="text-2xl font-bold mb-2 text-gray-800">${profile.name}</h3>
            <span class="text-blue-500 font-semibold mb-4">${profile.role}</span>
            <div class="bg-gray-100 rounded-lg px-4 py-2 w-full mb-2 flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 01-8 0 4 4 0 018 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v7m0 0H9m3 0h3" /></svg>
                <span class="text-gray-700">${profile.email}</span>
            </div>
            <div class="bg-gray-100 rounded-lg px-4 py-2 w-full flex items-center">
                <svg class="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span class="text-gray-700">Joined: ${profile.joinDate}</span>
            </div>
        `;
        return profileElement;
    };

    // Load profile information into the page
    const profileElement = createProfileElement(profile);
    profileInfo.appendChild(profileElement);
}); 