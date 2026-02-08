// Timetable component functions
// These are global functions that can be called from script.js

// Store all sessions globally
var allSessions = [];
var isShowingAllSessions = false;
var showOnlyWithTickets = true; // By default show only sessions with tickets
var selectedMonth = null; // Currently selected month filter (null = all months)
var selectedWeekday = 'all'; // Currently selected weekday filter ('all', 'weekdays', 'weekends')

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

// Render sessions
function renderSessions(sessions, showAll = false) {
    const container = document.getElementById('sessionsList');
    if (!container) return;
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

// Initialize all timetable functionality
function initTimetable() {
    initLoadMoreButton();
    initTicketsSwitch();
    initMonthFilter();
    initWeekdayFilter();
    initFilterCloseButtons();
}
