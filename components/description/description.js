// Description component functions
// These are global functions that can be called from script.js

// Format duration ("1 час", "2-4 часа", "5-20 часов")
function getHourWord(hours) {
    hours = Number(hours);
    if (hours % 10 === 1 && hours % 100 !== 11) return 'час';
    if ([2,3,4].includes(hours % 10) && ![12,13,14].includes(hours % 100)) return 'часа';
    return 'часов';
}

function getMinuteWord(minutes) {
    minutes = Number(minutes);
    if (minutes % 10 === 1 && minutes % 100 !== 11) return 'минута';
    if ([2,3,4].includes(minutes % 10) && ![12,13,14].includes(minutes % 100)) return 'минуты';
    return 'минут';
}

function formatDuration(duration) {
    const [h, m] = duration.split(':').map(Number);
    let result = '';
    if (h > 0) {
        result += `${h} ${getHourWord(h)}`;
    }
    if (m > 0) {
        if (result) result += ' ';
        result += `${m} ${getMinuteWord(m)}`;
    }
    return result.trim();
}

// Render description
function renderDescription(shortText, fullText) {
    const container = document.getElementById('descriptionText');
    const showMoreLink = document.querySelector('.show-more-link');

    if (!container) return;

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

// Smooth scroll to description
function initScrollToDescription() {
    const link = document.querySelector('.event-details-link');
    if (link) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const descriptionSection = document.getElementById('description');
            if (descriptionSection) {
                descriptionSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}
