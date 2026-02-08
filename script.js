// Main script - coordinates component functions and loads data
// Component functions are loaded from their respective JS files

// Get base path from loader.js or fallback to './'
const basePath = window.TICKETLAND_BASE_PATH || './';

// Load event data
async function loadEventData() {
    try {
        // Wait for components to be loaded first
        if (window.TICKETLAND_COMPONENTS_LOADED) {
            await window.TICKETLAND_COMPONENTS_LOADED;
        }

        // Load persons data (function from persons.js)
        if (typeof loadPersons === 'function') {
            await loadPersons();
        }

        // Load event data
        const response = await fetch(basePath + 'data/events/chelovek-kotoriy-prodal-svoyu-ten.json');
        const event = await response.json();
        renderEvent(event);
    } catch (error) {
        console.error('Error loading event data:', error);
    }
}

// Render event to page - coordinates all component render functions
function renderEvent(event) {
    // Gallery (functions from gallery.js)
    if (typeof setGalleryImages === 'function') {
        setGalleryImages(event.images);
    }
    if (typeof initGallery === 'function') {
        initGallery();
    }
    if (typeof initGalleryNavigation === 'function') {
        initGalleryNavigation();
    }

    // Event Title Section
    const ageRatingEl = document.getElementById('ageRating');
    if (ageRatingEl) ageRatingEl.textContent = `${event.ageRating}+`;

    const ratingEl = document.getElementById('rating');
    if (ratingEl) ratingEl.textContent = event.rating.toFixed(1);

    const reviewsCountEl = document.getElementById('reviewsCount');
    if (reviewsCountEl) reviewsCountEl.textContent = `${event.reviewsCount} отзывов`;

    const eventTitleEl = document.getElementById('eventTitle');
    if (eventTitleEl) eventTitleEl.textContent = event.title;

    // Venue subtitle from nearest session
    const nearestSession = event.sessions[0];
    const venueSubtitleEl = document.getElementById('venueSubtitle');
    if (venueSubtitleEl) venueSubtitleEl.textContent = nearestSession?.venue.name || '';

    // Timetable (functions from timetable.js)
    if (typeof renderMonthDropdown === 'function') {
        renderMonthDropdown(event.sessions);
    }
    if (typeof renderSessions === 'function') {
        renderSessions(event.sessions);
    }

    // Description (functions from description.js)
    const durationEl = document.getElementById('duration');
    if (durationEl && typeof formatDuration === 'function') {
        durationEl.textContent = formatDuration(event.duration);
    }
    if (typeof renderDescription === 'function') {
        renderDescription(event.description.short, event.description.full);
    }

    // Persons (function from persons.js)
    if (typeof renderPersons === 'function') {
        renderPersons(event.cast);
    }

    // Reviews
    renderReviews(event.reviews);

    // Map (function from map.js)
    const venue = nearestSession?.venue;
    if (venue && typeof initMap === 'function') {
        const address = `${venue.city}, ${venue.address}`;
        const coordinates = venue.coordinates || null;
        initMap(address, basePath + 'components/map/assets/placeholder-map.jpg', coordinates);
    }

    // Legal Info
    const organizerNameEl = document.getElementById('organizerName');
    if (organizerNameEl) organizerNameEl.textContent = event.organizer.name;

    const organizerInnEl = document.getElementById('organizerInn');
    if (organizerInnEl) organizerInnEl.textContent = event.organizer.inn;

    const organizerErirEl = document.getElementById('organizerErir');
    if (organizerErirEl) organizerErirEl.textContent = event.organizer.erir;
}

// Render reviews (stays in main script as it's not a separate component yet)
function renderReviews(reviews) {
    const container = document.getElementById('reviewsList');
    if (!container) return;

    container.innerHTML = '';

    // Show first 2 reviews
    reviews.slice(0, 2).forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';

        // Use badge data from JSON
        const badgeColorMap = {
            'green': 'constant-light-apple',
            'yellow': 'constant-dark-banana'
        };
        const ratingClass = badgeColorMap[review.badgeColor] || 'constant-dark-banana';
        const ratingText = review.badge;

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

// Initialize all functionality
function initApp() {
    // Load event data (this will initialize components after loading)
    loadEventData();

    // Initialize description scroll (function from description.js)
    if (typeof initScrollToDescription === 'function') {
        initScrollToDescription();
    }

    // Initialize timetable functionality (function from timetable.js)
    if (typeof initTimetable === 'function') {
        initTimetable();
    }
}

// Start the app
initApp();
