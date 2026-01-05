// Load persons data
let personsData = {};

async function loadPersons() {
    try {
        const response = await fetch('data/persons.json');
        personsData = await response.json();
    } catch (error) {
        console.error('Error loading persons data:', error);
    }
}

// Load event data
async function loadEventData() {
    try {
        await loadPersons(); // Load persons first
        const response = await fetch('data/events/mamma-mimo.json');
        const event = await response.json();
        renderEvent(event);
    } catch (error) {
        console.error('Error loading event data:', error);
    }
}

// Render event to page
function renderEvent(event) {
    // Carousel
    document.getElementById('carouselImage').src = event.coverImage || 'https://via.placeholder.com/360x241/e0e0e0/999999?text=Cover';
    
    // Event Title Section
    document.getElementById('ageRating').textContent = `${event.ageRating}+`;
    document.getElementById('rating').textContent = event.rating.toFixed(1);
    document.getElementById('reviewsCount').textContent = `${event.reviewsCount} отзывов`;
    document.getElementById('eventTitle').textContent = event.title;
    
    // Venue subtitle from nearest session
    const nearestSession = event.sessions[0];
    document.getElementById('venueSubtitle').textContent = nearestSession?.venue.name || '';
    
    // Timetable
    renderSessions(event.sessions);
    
    // Description
    document.getElementById('duration').textContent = formatDuration(event.duration);
    renderDescription(event.description.full);
    
    // Persons
    renderPersons(event.cast);
    
    // Reviews
    renderReviews(event.reviews);
    
    // Map
    const venue = nearestSession?.venue;
    if (venue && typeof initMap === 'function') {
        const address = `${venue.city}, ${venue.address}`;
        const coordinates = venue.coordinates || null;
        initMap(address, 'components/map/assets/placeholder-map.jpg', coordinates);
    }
    
    // Legal Info
    document.getElementById('organizerName').textContent = event.organizer.name;
    document.getElementById('organizerInn').textContent = event.organizer.inn;
    document.getElementById('organizerErir').textContent = event.organizer.erir;
}

// Format duration
function formatDuration(duration) {
    const [hours, minutes] = duration.split(':');
    return `${parseInt(hours)} час ${parseInt(minutes)} минут`;
}

// Render description
function renderDescription(text) {
    const container = document.getElementById('descriptionText');
    const paragraphs = text.split('\n\n');
    container.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
}

// Render sessions
function renderSessions(sessions) {
    const container = document.getElementById('sessionsList');
    container.innerHTML = '';
    
    // Group sessions by date
    const sessionsByDate = {};
    sessions.forEach(session => {
        if (!sessionsByDate[session.date]) {
            sessionsByDate[session.date] = [];
        }
        sessionsByDate[session.date].push(session);
    });
    
    // Render each date group
    Object.entries(sessionsByDate).forEach(([date, dateSessions]) => {
        const firstSession = dateSessions[0];
        const dayDiv = document.createElement('div');
        dayDiv.className = 'session-day';
        
        // Date column
        const dateDiv = document.createElement('div');
        dateDiv.className = 'session-date';
        
        const dayNumber = new Date(date).getDate().toString().padStart(2, '0');
        dateDiv.innerHTML = `
            <div class="session-date-number">${dayNumber}</div>
            <div class="session-date-info">
                <div class="session-date-month">${firstSession.dateLabel}</div>
                <div class="session-date-day">${firstSession.dayOfWeek}</div>
                ${firstSession.venue.region !== 'Москва' ? `<div class="session-date-region">другой регион</div>` : ''}
            </div>
        `;
        
        // Times column
        const timesDiv = document.createElement('div');
        timesDiv.className = 'session-times';
        
        dateSessions.forEach(session => {
            const timeCard = document.createElement('div');
            timeCard.className = 'session-time-card';
            
            const hasRush = session.hasTickets && session.ticketsLeft && session.ticketsLeft <= 5;
            
            timeCard.innerHTML = `
                <div class="session-time-info">
                    <div class="session-time">${session.time}</div>
                    <div class="session-venue-name">${session.venue.name}</div>
                    <div class="session-hall">${session.hall}</div>
                </div>
                <button class="session-cta-btn" ${!session.hasTickets ? 'disabled' : ''}>
                    ${session.hasTickets ? `От ${session.priceFrom.toLocaleString('ru-RU')} ₽` : 'Билеты распроданы'}
                </button>
                ${hasRush ? `
                    <div class="session-rush">
                        <i class="icon icon-star-16-fill" style="background-color: #FF5500;"></i>
                        <span>Осталось всего ${session.ticketsLeft} билета!</span>
                    </div>
                ` : ''}
            `;
            
            timesDiv.appendChild(timeCard);
        });
        
        dayDiv.appendChild(dateDiv);
        dayDiv.appendChild(timesDiv);
        container.appendChild(dayDiv);
    });
}

// Render persons
function renderPersons(cast) {
    const container = document.getElementById('personsList');
    container.innerHTML = '';
    
    // Show first 5 persons
    cast.slice(0, 5).forEach(castMember => {
        const person = personsData[castMember.personId];
        if (!person) return;
        
        const card = document.createElement('div');
        card.className = 'person-card';
        
        const photoUrl = person.photo || 'https://via.placeholder.com/80/e0e0e0/999999?text=?';
        
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

// Render reviews
function renderReviews(reviews) {
    const container = document.getElementById('reviewsList');
    container.innerHTML = '';
    
    // Show first 2 reviews
    reviews.slice(0, 2).forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';
        
        const ratingClass = review.rating >= 8 ? 'constant-light-apple' : 'constant-dark-banana';
        const ratingText = review.rating >= 8 ? 'Великолепно' : 'Хорошо';
        
        // Format author name
        const authorName = `${review.author.firstName} ${review.author.lastName}`;
        
        // Format date
        const dateObj = new Date(review.date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('ru-RU', { month: 'long' });
        const year = dateObj.getFullYear();
        const dateFormatted = `${day} ${month} ${year}`;
        
        card.innerHTML = `
            <div class="review-header">
                <span class="review-author">${authorName}</span>
                <div class="review-rating" style="background: var(--${ratingClass})">
                    <i class="icon icon-star-16-fill"></i>
                    <span>${ratingText}</span>
                </div>
            </div>
            <div class="review-date">${dateFormatted}</div>
            <div class="review-text">${review.text}</div>
        `;
        
        container.appendChild(card);
    });
}

// Initialize
loadEventData();
