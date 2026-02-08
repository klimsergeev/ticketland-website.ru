// Gallery component functions
// These are global functions that can be called from script.js

// Gallery state
var galleryImages = [];
var currentImageIndex = 0;
var isAnimating = false;

// Initialize gallery with images
function initGallery() {
    const track = document.getElementById('galleryTrack');
    if (!track || !galleryImages.length) return;

    const basePath = window.TICKETLAND_BASE_PATH || './';

    // Create three image elements: prev, current, next
    track.innerHTML = '';

    const prevIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    const nextIndex = (currentImageIndex + 1) % galleryImages.length;

    // Previous image (off-screen left)
    const prevImg = document.createElement('img');
    prevImg.src = basePath + galleryImages[prevIndex];
    prevImg.alt = 'Фото события';
    prevImg.className = 'gallery-image';
    prevImg.style.transform = 'translateX(-100%)';

    // Current image (visible)
    const currentImg = document.createElement('img');
    currentImg.src = basePath + galleryImages[currentImageIndex];
    currentImg.alt = 'Фото события';
    currentImg.className = 'gallery-image';
    currentImg.style.transform = 'translateX(0)';

    // Next image (off-screen right)
    const nextImg = document.createElement('img');
    nextImg.src = basePath + galleryImages[nextIndex];
    nextImg.alt = 'Фото события';
    nextImg.className = 'gallery-image';
    nextImg.style.transform = 'translateX(100%)';

    track.appendChild(prevImg);
    track.appendChild(currentImg);
    track.appendChild(nextImg);
}

// Slide gallery in specified direction
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

// Show previous image
function showPreviousImage() {
    slideGallery('prev');
}

// Show next image
function showNextImage() {
    slideGallery('next');
}

// Initialize gallery navigation buttons
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

// Set gallery images from external source
function setGalleryImages(images) {
    galleryImages = images || [];
    currentImageIndex = 0;
}
