// Persons component functions
// These are global functions that can be called from script.js

// Global data storage for persons
var personsData = {};

// Load persons data from JSON
async function loadPersons() {
    const basePath = window.TICKETLAND_BASE_PATH || './';
    try {
        const response = await fetch(basePath + 'data/persons.json');
        personsData = await response.json();
    } catch (error) {
        console.error('Error loading persons data:', error);
    }
}

// Render persons
function renderPersons(cast) {
    const container = document.getElementById('personsList');
    if (!container) return;

    const basePath = window.TICKETLAND_BASE_PATH || './';
    container.innerHTML = '';

    // Show first 5 persons
    cast.slice(0, 5).forEach(castMember => {
        const person = personsData[castMember.personId];
        if (!person) return;

        const card = document.createElement('div');
        card.className = 'person-card';

        const photoUrl = person.photo ? basePath + person.photo : 'https://via.placeholder.com/80/e0e0e0/999999?text=?';

        card.innerHTML = `
            <img src="${photoUrl}" alt="${person.name}" class="person-avatar" width="80" height="80">
            <div class="person-info">
                <div class="person-name">${person.name}</div>
                <div class="person-role">${castMember.role}</div>
            </div>
        `;

        container.appendChild(card);
    });
}
