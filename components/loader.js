// Load CSS file dynamically
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

// Load HTML components
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
    }
}

// Load header and footer
async function loadComponents() {
    // Load component styles
    loadCSS('components/header/header.css');
    loadCSS('components/footer/footer.css');
    loadCSS('components/map/map.css');
    
    // Load component HTML
    await Promise.all([
        loadComponent('header-placeholder', 'components/header/header.html'),
        loadComponent('footer-placeholder', 'components/footer/footer.html'),
        loadComponent('map-placeholder', 'components/map/map.html')
    ]);
    
    // Set current year in footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialize components on page load
loadComponents();

