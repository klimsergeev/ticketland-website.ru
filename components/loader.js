// Determine base path based on current URL depth
function getBasePath() {
    const path = window.location.pathname;
    // Count directory depth (number of slashes minus 1)
    const depth = (path.match(/\//g) || []).length - 1;
    return '../'.repeat(depth) || './';
}
const BASE_PATH = getBasePath();
window.TICKETLAND_BASE_PATH = BASE_PATH;

// Load CSS file dynamically
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE_PATH + href;
    document.head.appendChild(link);
}

// Load HTML components
async function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const response = await fetch(BASE_PATH + componentPath);
        const html = await response.text();
        element.innerHTML = html;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

// Fix relative paths in loaded component HTML
function fixComponentPaths(container) {
    if (!container) return;

    // Fix image src attributes
    const images = container.querySelectorAll('img[src^="components/"]');
    images.forEach(img => {
        img.src = BASE_PATH + img.getAttribute('src');
    });

    // Fix link href attributes for internal links
    const links = container.querySelectorAll('a[href^="components/"]');
    links.forEach(link => {
        link.href = BASE_PATH + link.getAttribute('href');
    });
}

// Load header and footer
async function loadComponents() {
    // Load core component styles (header, footer)
    loadCSS('components/header/header.css');
    loadCSS('components/footer/footer.css');

    // Load event card component styles if placeholders exist
    if (document.getElementById('gallery-placeholder')) {
        loadCSS('components/gallery/gallery.css');
    }
    if (document.getElementById('event-info-placeholder')) {
        loadCSS('components/event-info/event-info.css');
    }
    if (document.getElementById('timetable-placeholder')) {
        loadCSS('components/timetable/timetable.css');
    }
    if (document.getElementById('description-placeholder')) {
        loadCSS('components/description/description.css');
    }
    if (document.getElementById('persons-placeholder')) {
        loadCSS('components/persons/persons.css');
    }
    if (document.getElementById('organizer-placeholder')) {
        loadCSS('components/organizer/organizer.css');
    }

    // Load map component styles only if map placeholder exists
    if (document.getElementById('map-placeholder')) {
        loadCSS('components/map/map.css');
    }

    // Determine which components to load
    const componentsToLoad = [
        loadComponent('header-placeholder', 'components/header/header.html'),
        loadComponent('footer-placeholder', 'components/footer/footer.html')
    ];

    // Load event card components if placeholders exist
    if (document.getElementById('gallery-placeholder')) {
        componentsToLoad.push(loadComponent('gallery-placeholder', 'components/gallery/gallery.html'));
    }
    if (document.getElementById('event-info-placeholder')) {
        componentsToLoad.push(loadComponent('event-info-placeholder', 'components/event-info/event-info.html'));
    }
    if (document.getElementById('timetable-placeholder')) {
        componentsToLoad.push(loadComponent('timetable-placeholder', 'components/timetable/timetable.html'));
    }
    if (document.getElementById('description-placeholder')) {
        componentsToLoad.push(loadComponent('description-placeholder', 'components/description/description.html'));
    }
    if (document.getElementById('persons-placeholder')) {
        componentsToLoad.push(loadComponent('persons-placeholder', 'components/persons/persons.html'));
    }
    if (document.getElementById('organizer-placeholder')) {
        componentsToLoad.push(loadComponent('organizer-placeholder', 'components/organizer/organizer.html'));
    }

    // Load map component only if placeholder exists
    if (document.getElementById('map-placeholder')) {
        componentsToLoad.push(loadComponent('map-placeholder', 'components/map/map.html'));
    }

    // Load all components
    await Promise.all(componentsToLoad);

    // Fix paths in loaded components
    const placeholders = [
        'header-placeholder',
        'footer-placeholder',
        'gallery-placeholder',
        'event-info-placeholder',
        'timetable-placeholder',
        'description-placeholder',
        'persons-placeholder',
        'organizer-placeholder',
        'map-placeholder'
    ];

    placeholders.forEach(id => {
        const placeholder = document.getElementById(id);
        if (placeholder) {
            fixComponentPaths(placeholder);
        }
    });

    // Set current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Promise for tracking component loading
window.TICKETLAND_COMPONENTS_LOADED = new Promise((resolve) => {
    async function init() {
        await loadComponents();
        resolve();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
});
