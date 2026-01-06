# Frontend Context: Ticketland Website

## Project Overview
This is a mobile-first event ticketing website built with vanilla HTML, CSS, and JavaScript. The project focuses on pixel-perfect implementation of Figma designs for the 320-540px mobile breakpoint.

## Tech Stack
- **HTML5**: Semantic markup
- **CSS3**: Custom properties (CSS variables), Flexbox, responsive design
- **JavaScript (ES6+)**: Vanilla JS, no frameworks
- **Fonts**: MTS Compact, MTS Text (custom fonts)
- **Development Server**: Python HTTP server (`python3 -m http.server 8000`)
- **Version Control**: Git, GitHub (https://github.com/klimsergeev/ticketland-website.ru)

## Project Structure

```
/
├── index.html                  # Main event page
├── styles.css                  # Global styles and CSS variables
├── script.js                   # Main application logic
├── assets/
│   ├── icons/                  # Centralized SVG icons (monochrome)
│   │   └── [name]-[size]-[type].svg  # Naming convention
│   ├── events/
│   │   └── mamma-mimo/         # Event-specific images
│   └── fonts/                  # Custom MTS fonts
├── components/
│   ├── header/
│   │   ├── header.html
│   │   └── header.css
│   ├── footer/
│   │   ├── footer.html
│   │   └── footer.css
│   ├── map/
│   │   ├── map.html
│   │   ├── map.css
│   │   ├── map.js
│   │   └── assets/             # Map placeholder image
│   └── loader.js               # Component loader utility
└── data/
    ├── persons.json            # Normalized person data (actors, directors)
    └── events/
        └── mamma-mimo.json     # Event data with references to persons

```

## Key Design Principles

### 1. Pixel-Perfect Implementation
- All measurements, colors, and spacing must match Figma designs exactly
- Mobile breakpoint: 320px - 540px
- Use `clamp()` for responsive padding: `clamp(16px, 4vw, 24px)`
- Aspect ratio technique for images: `padding-bottom: calc(height/width * 100%)`

### 2. CSS Variables (Design Tokens)
Located in `styles.css`:

**Text Colors:**
```css
--text-primary: #1D2023;
--text-secondary: #8D969F;
--text-tertiary: #BBC1C7;
--text-primary-link: #0070e5;
```

**Background Colors:**
```css
--background-primary: #FFFFFF;
--background-secondary: #F2F3F7;
```

**Icon Colors:**
```css
--icons-primary: #1D2023;      /* Black - default icons */
--icons-secondary: #8D969F;    /* Grey - header icons */
--icons-tertiary: #BBC1C7;     /* Light grey - geo icon */
--constant-greyscale-0: #FFFFFF; /* White - on dark backgrounds */
```

**Controls:**
```css
--controls-primary: #E30611;
--controls-tertiary-active: #F2F3F7;
```

**Constants:**
```css
--constant-light-apple: #D7F2E5;   /* Green badge background */
--constant-dark-banana: #FFF4CC;   /* Yellow badge background */
```

### 3. Icon System
All icons are stored centrally in `assets/icons/` with naming convention: `[name]-[size]-[type].svg`

**Examples:**
- `chevron-left-24-outline.svg`
- `star-16-fill.svg`
- `bookmark-24-outline.svg`

**Implementation:**
Icons use CSS `mask-image` for recoloring:
```html
<i class="icon icon-star-16-fill"></i>
```

```css
.icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-color: var(--icons-primary);
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
}

.icon-star-16-fill {
    mask-image: url('assets/icons/star-16-fill.svg');
}
```

**Icon Colors by Context:**
- Header user buttons (search, cart, profile): `--icons-secondary`
- Geo icon: `--icons-tertiary`
- Links (chevrons): `--text-primary-link`
- Map buttons: `--icons-primary`
- Gallery buttons: `--icons-primary`

### 4. Component Architecture
Components are self-contained with their own HTML, CSS, and assets:

**Loading Components:**
```javascript
// components/loader.js
async function loadComponent(name, targetId) {
    const response = await fetch(`components/${name}/${name}.html`);
    const html = await response.text();
    document.getElementById(targetId).innerHTML = html;
}
```

**Usage in index.html:**
```html
<div id="header-placeholder"></div>
<div id="footer-placeholder"></div>
<div id="map-placeholder"></div>
```

### 5. Data Structure

**Normalized Data Model:**
- Persons are stored separately in `data/persons.json`
- Events reference persons by ID to avoid duplication

**data/persons.json:**
```json
{
  "nikolay-fomenko": {
    "id": "nikolay-fomenko",
    "firstName": "Николай",
    "lastName": "Фоменко",
    "avatar": "assets/persons/nikolay-fomenko.jpg"
  }
}
```

**data/events/mamma-mimo.json:**
```json
{
  "id": "mamma-mimo",
  "title": "«МАММА МИМО! или Мюзикл пошёл не так»",
  "images": [
    "assets/events/mamma-mimo/gallery-1.jpg",
    "assets/events/mamma-mimo/gallery-2.jpg"
  ],
  "cast": [
    {
      "personId": "nikolay-fomenko",
      "role": "Автор"
    }
  ]
}
```

**Important:** The data model should NOT contain business logic. Use generic field names like `images` instead of `gallery` to keep data storage separate from presentation logic.

## Key Features Implementation

### 1. Image Gallery with Slide Animation
**Location:** Main event page
**Requirements:**
- Slide animation (300ms ease-in-out)
- Cyclic navigation (last → first, first → last)
- Chevron buttons (24x24px, no background, 12px offset from edges)
- Action buttons: Bookmark and Share (bottom-right, 16px offset)

**Implementation:**
```javascript
// Gallery state
let galleryImages = [];
let currentImageIndex = 0;
let isAnimating = false;

function updateGalleryImage(direction) {
    // direction: 0=init, 1=next, -1=prev
    // Uses CSS transform for sliding
    // Manages two image elements for smooth transition
}
```

**CSS:**
```css
.gallery {
    position: relative;
    width: 100%;
    padding-bottom: 66.94%; /* 241/360 aspect ratio */
    overflow: hidden;
}

.gallery-images {
    position: absolute;
    display: flex;
    width: 300%; /* For 3 images */
    transition: transform 300ms ease-in-out;
}
```

### 2. Header Component
**Features:**
- Top bar: Logo, Search, Help, Cart (with notification badge), Profile
- Navigation: Geo icon + catalog links
- Shadow under top bar: `box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.08)`
- Cart notification badge: min-width 16px, height 16px, adapts for 2-digit numbers

**Cart Badge Logic:**
```css
.header-user-btn .badge::after {
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 8px;
}
```

### 3. Map Component
**Features:**
- "Как добраться" title and address
- Map placeholder image (aspect ratio preserved)
- Control buttons: Zoom in, Zoom out, Fullscreen
- Buttons: 32x32px, white background (`--controls-tertiary-active`), 6px border-radius

**Button Styling:**
```css
.map-btn {
    width: 32px;
    height: 32px;
    background: var(--controls-tertiary-active);
    border-radius: 6px;
}
```

### 4. Person Cards (Actors)
**Requirements:**
- Avatar: 80x80px (fixed size)
- Card width: 80px (fixed, prevents layout shift)
- Gap between cards: 16px
- Text wraps if name is too long
- Text alignment: center

**CSS:**
```css
.person-card {
    width: 80px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}

.person-info {
    width: 80px;
    text-align: center;
}
```

### 5. Review System
**Badge Colors:**
- Green (`--constant-light-apple`): "Великолепно"
- Yellow (`--constant-dark-banana`): "Хорошо"

**Data-Driven Rendering:**
```javascript
// Use badge and badgeColor directly from JSON
const ratingClass = review.badgeColor === 'green' 
    ? 'constant-light-apple' 
    : 'constant-dark-banana';
const ratingText = review.badge;
```

**Date Formatting:**
```javascript
// Format: "12 август 2024" (no "г.")
const day = dateObj.getDate();
const month = dateObj.toLocaleDateString('ru-RU', { month: 'long' });
const year = dateObj.getFullYear();
const dateFormatted = `${day} ${month} ${year}`;
```

### 6. Footer Component
**Features:**
- Simplified design (no payment icons)
- Dynamic copyright year: `© ООО «МТС Лайв», ${currentYear}`
- Background: `--background-secondary`

**Dynamic Year:**
```javascript
document.getElementById('currentYear').textContent = new Date().getFullYear();
```

## Responsive Design Strategy

### Mobile-First Approach
- Base styles for 320px width
- Scale up to 540px using `clamp()` and percentage-based sizing
- Body constraints:
```css
body {
    min-width: 320px;
    max-width: 540px;
    margin: 0 auto;
}
```

### Fluid Spacing
```css
.section {
    padding: clamp(16px, 4vw, 24px);
}
```

### Aspect Ratio Technique
```css
.image-container {
    width: 100%;
    height: 0;
    padding-bottom: 66.94%; /* height/width * 100% */
    position: relative;
}

.image-container img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
```

## Common Patterns

### 1. Loading Event Data
```javascript
async function loadEventData() {
    const [personsResponse, eventResponse] = await Promise.all([
        fetch('data/persons.json'),
        fetch('data/events/mamma-mimo.json')
    ]);
    
    const personsData = await personsResponse.json();
    const eventData = await eventResponse.json();
    
    renderEvent(eventData, personsData);
}
```

### 2. Rendering Persons with Role
```javascript
function renderPersons(cast, personsData) {
    cast.forEach(({ personId, role }) => {
        const person = personsData[personId];
        // Render person card with role
    });
}
```

### 3. Icon Usage
```html
<!-- Always use <i> tags for icons -->
<i class="icon icon-chevron-left-24-outline"></i>
```

## Git Workflow

### Branch Strategy
- `main`: Production-ready code
- Feature branches: Named descriptively (e.g., "Footer update", "event-layout-refining")

### Deployment
- GitHub Pages: https://klimsergeev.github.io/ticketland-website.ru/
- **Important:** Use relative paths for assets (not absolute paths starting with `/`)

**Correct:**
```html
<img src="assets/events/mamma-mimo/gallery-1.jpg">
```

**Incorrect:**
```html
<img src="/assets/events/mamma-mimo/gallery-1.jpg">
```

## Development Server

### Starting Server
```bash
cd "/Users/sergeiklimenko/Cursor Projects/Ticketland Website"
python3 -m http.server 8000
```

### Stopping Server
```bash
# Find process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Testing
- Local: http://localhost:8000
- Always test in browser after changes
- Clear cache (Cmd+Shift+R on Mac) if images don't update

## Critical Rules

### 1. Path Management
- **Always use relative paths** for assets
- Never use absolute paths starting with `/` (breaks GitHub Pages)

### 2. Data Model Purity
- JSON should store data, not business logic
- Use generic field names (`images`, not `gallery`)
- Keep presentation logic in JavaScript/CSS

### 3. Icon System
- All icons in `assets/icons/`
- Use `<i>` tags with `mask-image` for recoloring
- Never use inline SVG or `<img>` tags for icons

### 4. Pixel-Perfect Implementation
- Always reference Figma designs
- Match exact colors, sizes, spacing
- Use browser DevTools to verify measurements

### 5. Component Independence
- Each component has its own folder
- Components are self-contained (HTML, CSS, assets)
- Load via `loader.js`

### 6. Responsive Behavior
- Test at 320px and 540px
- Use `clamp()` for fluid spacing
- Maintain aspect ratios for images

## Known Issues & Solutions

### Issue: Images not loading on GitHub Pages
**Solution:** Use relative paths instead of absolute paths

### Issue: Browser caching old images
**Solution:** Hard refresh (Cmd+Shift+R) or disable cache in DevTools

### Issue: Icon colors not changing
**Solution:** Use `mask-image` with `background-color`, not `fill` or `currentColor`

### Issue: Layout shifts with variable content
**Solution:** Set fixed widths/heights where needed (e.g., person cards: 80px)

### Issue: Gallery animation not smooth
**Solution:** Use CSS `transform` with two image elements for slide effect

## Figma Design Reference
Main design file: https://www.figma.com/design/8NcpQulUXiKLm4f2EvTffS/%F0%9F%8D%8E-Ticketland-Website

Key screens:
- Event page: node-id=4218-7281
- Gallery: node-id=4267-9581
- Map component: node-id=4218-6844
- Footer: node-id=4244-8262

## Future Considerations

### Planned Features
- Real map integration (API)
- Multiple event pages
- Search functionality
- User authentication
- Ticket purchase flow

### Scalability
- Component system ready for reuse across pages
- Normalized data model supports multiple events
- Icon system scales to any number of icons
- CSS variables make theming easy

## Testing Checklist

Before committing changes:
- [ ] Test at 320px width
- [ ] Test at 540px width
- [ ] Verify all images load
- [ ] Check icon colors in all contexts
- [ ] Test gallery navigation (including cyclic behavior)
- [ ] Verify responsive padding with `clamp()`
- [ ] Check layout doesn't shift with variable content
- [ ] Test in browser (not just code review)
- [ ] Clear cache if images were updated
- [ ] Verify relative paths for GitHub Pages compatibility

## Contact & Resources
- Repository: https://github.com/klimsergeev/ticketland-website.ru
- Figma: https://www.figma.com/design/8NcpQulUXiKLm4f2EvTffS/
- Local server: http://localhost:8000
- GitHub Pages: https://klimsergeev.github.io/ticketland-website.ru/

