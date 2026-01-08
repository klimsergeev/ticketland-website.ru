// Global data storage for persons
let personsData = {};

// Gallery state
let galleryImages = [];
let currentImageIndex = 0;

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
    // Gallery
    galleryImages = event.images || [];
    currentImageIndex = 0;
    initGallery();
    initGalleryNavigation();
    
    // Event Title Section
    document.getElementById('ageRating').textContent = `${event.ageRating}+`;
    document.getElementById('rating').textContent = event.rating.toFixed(1);
    document.getElementById('reviewsCount').textContent = `${event.reviewsCount} отзывов`;
    document.getElementById('eventTitle').textContent = event.title;
    
    // Venue subtitle from nearest session
    const nearestSession = event.sessions[0];
    document.getElementById('venueSubtitle').textContent = nearestSession?.venue.name || '';
    
    // Timetable
    renderMonthDropdown(event.sessions);
    renderSessions(event.sessions);
    
    // Description
    document.getElementById('duration').textContent = formatDuration(event.duration);
    renderDescription(event.description.short, event.description.full);
    
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
function renderDescription(shortText, fullText) {
    const container = document.getElementById('descriptionText');
    const showMoreLink = document.querySelector('.show-more-link');

    // Initially show short description
    const paragraphs = shortText.split('\n\n');
    container.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');

    // Add click handler to "Показать полностью"
    if (showMoreLink) {
        showMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            const fullParagraphs = fullText.split('\n\n');
            container.innerHTML = fullParagraphs.map(p => `<p>${p}</p>`).join('');
            showMoreLink.style.display = 'none';
        });
    }
}

// Get day of week display (today/tomorrow/day name)
function getDayOfWeekDisplay(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessionDate = new Date(dateString);
    sessionDate.setHours(0, 0, 0, 0);

    if (sessionDate.getTime() === today.getTime()) {
        return 'сегодня';
    } else if (sessionDate.getTime() === tomorrow.getTime()) {
        return 'завтра';
    } else {
        const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
        return days[sessionDate.getDay()];
    }
}

// Get formatted month name (genitive case)
function getMonthName(dateString) {
    const date = new Date(dateString);
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return months[date.getMonth()];
}

// Store all sessions globally
let allSessions = [];
let isShowingAllSessions = false;
let showOnlyWithTickets = true; // By default show only sessions with tickets
let selectedMonth = null; // Currently selected month filter (null = all months)
let selectedWeekday = 'all'; // Currently selected weekday filter ('all', 'weekdays', 'weekends')

// Render sessions
function renderSessions(sessions, showAll = false) {
    const container = document.getElementById('sessionsList');
    container.innerHTML = '';

    // Store sessions globally
    allSessions = sessions;

    // Filter sessions by tickets availability if needed
    let filteredSessions = sessions;
    if (showOnlyWithTickets) {
        filteredSessions = sessions.filter(session => session.hasTickets);
    }

    // Filter sessions by selected month
    if (selectedMonth) {
        const [year, month] = selectedMonth.split('-').map(Number);
        filteredSessions = filteredSessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate.getFullYear() === year && sessionDate.getMonth() === month;
        });
    }

    // Filter sessions by weekday
    if (selectedWeekday !== 'all') {
        filteredSessions = filteredSessions.filter(session => {
            const sessionDate = new Date(session.date);
            const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 6 = Saturday
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            return selectedWeekday === 'weekends' ? isWeekend : !isWeekend;
        });
    }

    // Group sessions by date
    const sessionsByDate = {};
    filteredSessions.forEach(session => {
        if (!sessionsByDate[session.date]) {
            sessionsByDate[session.date] = [];
        }
        sessionsByDate[session.date].push(session);
    });

    // Get dates sorted by date
    const sortedDates = Object.keys(sessionsByDate).sort();

    // Show only first 5 dates by default
    const datesToShow = showAll ? sortedDates : sortedDates.slice(0, 5);

    // Render each date group
    datesToShow.forEach(date => {
        const dateSessions = sessionsByDate[date];
        const firstSession = dateSessions[0];
        const dayDiv = document.createElement('div');
        dayDiv.className = 'session-day';

        // Date column
        const dateDiv = document.createElement('div');
        dateDiv.className = 'session-date';

        const dayNumber = new Date(date).getDate().toString().padStart(2, '0');
        const monthName = getMonthName(date);
        const dayOfWeek = getDayOfWeekDisplay(date);

        dateDiv.innerHTML = `
            <div class="session-date-number">${dayNumber}</div>
            <div class="session-date-info">
                <div class="session-date-month">${monthName}</div>
                <div class="session-date-day">${dayOfWeek}</div>
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

    // Update "Load More" button visibility
    updateLoadMoreButton(showAll, sortedDates.length);
}

// Update load more button visibility
function updateLoadMoreButton(showingAll, totalDates) {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        if (showingAll || totalDates <= 5) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}

// Initialize load more button
function initLoadMoreButton() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            isShowingAllSessions = true;
            renderSessions(allSessions, true);
        });
    }
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

// Gallery functions
let isAnimating = false;

function initGallery() {
    const track = document.getElementById('galleryTrack');
    if (!track || !galleryImages.length) return;
    
    // Create three image elements: prev, current, next
    track.innerHTML = '';
    
    const prevIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    const nextIndex = (currentImageIndex + 1) % galleryImages.length;
    
    // Previous image (off-screen left)
    const prevImg = document.createElement('img');
    prevImg.src = galleryImages[prevIndex];
    prevImg.alt = 'Фото события';
    prevImg.className = 'gallery-image';
    prevImg.style.transform = 'translateX(-100%)';
    
    // Current image (visible)
    const currentImg = document.createElement('img');
    currentImg.src = galleryImages[currentImageIndex];
    currentImg.alt = 'Фото события';
    currentImg.className = 'gallery-image';
    currentImg.style.transform = 'translateX(0)';
    
    // Next image (off-screen right)
    const nextImg = document.createElement('img');
    nextImg.src = galleryImages[nextIndex];
    nextImg.alt = 'Фото события';
    nextImg.className = 'gallery-image';
    nextImg.style.transform = 'translateX(100%)';
    
    track.appendChild(prevImg);
    track.appendChild(currentImg);
    track.appendChild(nextImg);
}

function slideGallery(direction) {
    if (isAnimating || !galleryImages.length) return;
    
    isAnimating = true;
    const track = document.getElementById('galleryTrack');
    const images = track.querySelectorAll('.gallery-image');
    
    if (direction === 'next') {
        // Slide all images to the left
        images.forEach(img => {
            const currentTransform = parseFloat(img.style.transform.match(/-?\d+/)?.[0] || 0);
            img.style.transform = `translateX(${currentTransform - 100}%)`;
        });
        
        // After animation, update structure
        setTimeout(() => {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            initGallery();
            isAnimating = false;
        }, 300);
    } else {
        // Slide all images to the right
        images.forEach(img => {
            const currentTransform = parseFloat(img.style.transform.match(/-?\d+/)?.[0] || 0);
            img.style.transform = `translateX(${currentTransform + 100}%)`;
        });
        
        // After animation, update structure
        setTimeout(() => {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            initGallery();
            isAnimating = false;
        }, 300);
    }
}

function showPreviousImage() {
    slideGallery('prev');
}

function showNextImage() {
    slideGallery('next');
}

function initGalleryNavigation() {
    const prevBtn = document.querySelector('.gallery-nav-prev');
    const nextBtn = document.querySelector('.gallery-nav-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', showPreviousImage);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', showNextImage);
    }

    // Initialize swipe support for mobile
    initGallerySwipe();
}

// Touch swipe support for gallery
function initGallerySwipe() {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;

    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    const minSwipeDistance = 50; // minimum distance for swipe

    gallery.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    gallery.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Check if horizontal swipe is more significant than vertical
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Swipe left (next image)
            if (diffX > minSwipeDistance) {
                showNextImage();
            }
            // Swipe right (previous image)
            else if (diffX < -minSwipeDistance) {
                showPreviousImage();
            }
        }
    }
}

// Smooth scroll to description
function initScrollToDescription() {
    const link = document.querySelector('.event-details-link');
    if (link) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('description').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
}

// Initialize tickets switch
function initTicketsSwitch() {
    const ticketsSwitch = document.querySelector('.tickets-switch');
    const switchElement = document.querySelector('.switch');

    if (ticketsSwitch && switchElement) {
        ticketsSwitch.addEventListener('click', () => {
            // Toggle switch state
            switchElement.classList.toggle('active');

            // Update filter state
            showOnlyWithTickets = switchElement.classList.contains('active');

            // Re-render sessions with current filter
            renderSessions(allSessions, isShowingAllSessions);
        });
    }
}

// Get unique months from sessions
function getMonthsFromSessions(sessions) {
    const monthsMap = new Map();
    const currentYear = new Date().getFullYear();

    // Month names in nominative case for display
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    sessions.forEach(session => {
        const date = new Date(session.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;

        if (!monthsMap.has(key)) {
            const monthName = monthNames[month];
            // Add year only if it differs from current year
            const displayName = year !== currentYear ? `${monthName} ${year}` : monthName;

            monthsMap.set(key, {
                key: key,
                year: year,
                month: month,
                displayName: displayName
            });
        }
    });

    // Sort by year and month
    return Array.from(monthsMap.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
    });
}

// Render month dropdown options
function renderMonthDropdown(sessions) {
    const dropdownMenu = document.getElementById('monthDropdownMenu');
    if (!dropdownMenu) return;

    const months = getMonthsFromSessions(sessions);
    dropdownMenu.innerHTML = '';

    // Set initial button text to "Месяц"
    const btn = document.getElementById('monthFilterBtn');
    if (btn) {
        btn.querySelector('span').textContent = 'Месяц';
    }
    // Reset selected month to null (all events)
    selectedMonth = null;

    // Add "Все события" option first
    const allEventsOption = document.createElement('div');
    allEventsOption.className = 'filter-dropdown-option selected';
    allEventsOption.textContent = 'Все события';
    allEventsOption.dataset.monthKey = 'all';

    allEventsOption.addEventListener('click', () => {
        // Update selected state
        dropdownMenu.querySelectorAll('.filter-dropdown-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        allEventsOption.classList.add('selected');

        // Reset to show all months
        selectedMonth = null;

        // Reset button text to "Месяц"
        if (btn) {
            btn.querySelector('span').textContent = 'Месяц';
        }

        // Update button visual state
        updateMonthFilterButtonState();

        // Close dropdown
        closeMonthDropdown();

        // Re-render sessions with current filter
        renderSessions(allSessions, isShowingAllSessions);
    });

    dropdownMenu.appendChild(allEventsOption);

    // Add month options
    months.forEach((monthData) => {
        const option = document.createElement('div');
        option.className = 'filter-dropdown-option';
        option.textContent = monthData.displayName;
        option.dataset.monthKey = monthData.key;

        option.addEventListener('click', () => {
            // Update selected state
            dropdownMenu.querySelectorAll('.filter-dropdown-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');

            // Update selected month
            selectedMonth = monthData.key;

            // Update button text to selected month name
            if (btn) {
                btn.querySelector('span').textContent = monthData.displayName;
            }

            // Update button visual state
            updateMonthFilterButtonState();

            // Close dropdown
            closeMonthDropdown();

            // Re-render sessions with current filter
            renderSessions(allSessions, isShowingAllSessions);
        });

        dropdownMenu.appendChild(option);
    });
}

// Toggle month dropdown
function toggleMonthDropdown() {
    const btn = document.getElementById('monthFilterBtn');
    const menu = document.getElementById('monthDropdownMenu');

    if (menu && btn) {
        const isOpen = menu.classList.contains('open');

        if (isOpen) {
            closeMonthDropdown();
        } else {
            menu.classList.add('open');
            btn.classList.add('active');
        }
    }
}

// Close month dropdown
function closeMonthDropdown() {
    const btn = document.getElementById('monthFilterBtn');
    const menu = document.getElementById('monthDropdownMenu');

    if (menu) {
        menu.classList.remove('open');
    }
    if (btn) {
        btn.classList.remove('active');
    }
}

// Initialize month filter dropdown
function initMonthFilter() {
    const btn = document.getElementById('monthFilterBtn');

    if (btn) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeWeekdayDropdown(); // Close weekday dropdown when opening month
            toggleMonthDropdown();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('monthFilterDropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            closeMonthDropdown();
        }
    });
}

// Toggle weekday dropdown
function toggleWeekdayDropdown() {
    const btn = document.getElementById('weekdayFilterBtn');
    const menu = document.getElementById('weekdayDropdownMenu');

    if (menu && btn) {
        const isOpen = menu.classList.contains('open');

        if (isOpen) {
            closeWeekdayDropdown();
        } else {
            menu.classList.add('open');
            btn.classList.add('active');
        }
    }
}

// Close weekday dropdown
function closeWeekdayDropdown() {
    const btn = document.getElementById('weekdayFilterBtn');
    const menu = document.getElementById('weekdayDropdownMenu');

    if (menu) {
        menu.classList.remove('open');
    }
    if (btn) {
        btn.classList.remove('active');
    }
}

// Initialize weekday filter dropdown
function initWeekdayFilter() {
    const btn = document.getElementById('weekdayFilterBtn');
    const dropdownMenu = document.getElementById('weekdayDropdownMenu');

    if (btn) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMonthDropdown(); // Close month dropdown when opening weekday
            toggleWeekdayDropdown();
        });
    }

    // Add click handlers to weekday options
    if (dropdownMenu) {
        const options = dropdownMenu.querySelectorAll('.filter-dropdown-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const weekdayKey = option.dataset.weekdayKey;

                // Update selected state
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                // Update selected weekday
                selectedWeekday = weekdayKey;

                // Update button text
                if (btn) {
                    if (weekdayKey === 'all') {
                        btn.querySelector('span').textContent = 'Дни недели';
                    } else {
                        btn.querySelector('span').textContent = option.textContent;
                    }
                }

                // Update button visual state
                updateWeekdayFilterButtonState();

                // Close dropdown
                closeWeekdayDropdown();

                // Re-render sessions with current filter
                renderSessions(allSessions, isShowingAllSessions);
            });
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('weekdayFilterDropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            closeWeekdayDropdown();
        }
    });
}

// Update month filter button state
function updateMonthFilterButtonState() {
    const btn = document.getElementById('monthFilterBtn');
    if (!btn) return;

    const isActive = selectedMonth !== null;

    if (isActive) {
        btn.classList.add('filter-active');
    } else {
        btn.classList.remove('filter-active');
    }
}

// Update weekday filter button state
function updateWeekdayFilterButtonState() {
    const btn = document.getElementById('weekdayFilterBtn');
    if (!btn) return;

    const isActive = selectedWeekday !== 'all';

    if (isActive) {
        btn.classList.add('filter-active');
    } else {
        btn.classList.remove('filter-active');
    }
}

// Reset month filter to default
function resetMonthFilter() {
    selectedMonth = null;

    // Update button text
    const btn = document.getElementById('monthFilterBtn');
    if (btn) {
        btn.querySelector('span').textContent = 'Месяц';
    }

    // Update dropdown selected state
    const dropdownMenu = document.getElementById('monthDropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.querySelectorAll('.filter-dropdown-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.monthKey === 'all') {
                opt.classList.add('selected');
            }
        });
    }

    // Update button visual state
    updateMonthFilterButtonState();

    // Re-render sessions
    renderSessions(allSessions, isShowingAllSessions);
}

// Reset weekday filter to default
function resetWeekdayFilter() {
    selectedWeekday = 'all';

    // Update button text
    const btn = document.getElementById('weekdayFilterBtn');
    if (btn) {
        btn.querySelector('span').textContent = 'Дни недели';
    }

    // Update dropdown selected state
    const dropdownMenu = document.getElementById('weekdayDropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.querySelectorAll('.filter-dropdown-option').forEach(opt => {
            opt.classList.remove('selected');
            if (opt.dataset.weekdayKey === 'all') {
                opt.classList.add('selected');
            }
        });
    }

    // Update button visual state
    updateWeekdayFilterButtonState();

    // Re-render sessions
    renderSessions(allSessions, isShowingAllSessions);
}

// Initialize filter close buttons
function initFilterCloseButtons() {
    // Month filter close button
    const monthBtn = document.getElementById('monthFilterBtn');
    if (monthBtn) {
        const closeIcon = monthBtn.querySelector('.filter-close');
        if (closeIcon) {
            closeIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                resetMonthFilter();
            });
        }
    }

    // Weekday filter close button
    const weekdayBtn = document.getElementById('weekdayFilterBtn');
    if (weekdayBtn) {
        const closeIcon = weekdayBtn.querySelector('.filter-close');
        if (closeIcon) {
            closeIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                resetWeekdayFilter();
            });
        }
    }
}

// Initialize
loadEventData();
initScrollToDescription();
initLoadMoreButton();
initTicketsSwitch();
initMonthFilter();
initWeekdayFilter();
initFilterCloseButtons();
