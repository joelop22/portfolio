// Initial dummy data
const defaultWorks = [
    { id: 1, title: 'Sneaker Campaign', category: 'product-posters', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Perfume Launch', category: 'product-posters', image: 'https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'Energy Drink Ad', category: 'product-posters', image: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'Watch Display', category: 'product-posters', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80' },
    { id: 5, title: 'Tech Gadget', category: 'product-posters', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80' },
    
    { id: 6, title: 'Fantasy Landscape', category: 'image-manipulation', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
    { id: 7, title: 'Sci-Fi City', category: 'image-manipulation', image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80' },
    { id: 8, title: 'Surreal Portrait', category: 'image-manipulation', image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?auto=format&fit=crop&w=600&q=80' },
    { id: 9, title: 'Cyberpunk Character', category: 'image-manipulation', image: 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=600&q=80' },
    { id: 10, title: 'Nature Blend', category: 'image-manipulation', image: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=600&q=80' },
    
    { id: 11, title: 'Burger Promo', category: 'social-media-ads', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80' },
    { id: 12, title: 'Fitness App', category: 'social-media-ads', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80' },
    { id: 13, title: 'Fashion Sale', category: 'social-media-ads', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' },
    { id: 14, title: 'Travel Package', category: 'social-media-ads', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80' },
    { id: 15, title: 'Music Festival', category: 'social-media-ads', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80' },
    
    { id: 16, title: 'Action Thriller', category: 'movie-posters', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80' },
    { id: 17, title: 'Sci-Fi Epic', category: 'movie-posters', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80' }
];

let worksCache = null;

// Global observer for scroll animations
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target); // Run once
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

// Helper to compare two arrays of works
const areWorksEqual = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    
    const sortedA = [...a].sort((x, y) => String(x.id).localeCompare(String(y.id)));
    const sortedB = [...b].sort((x, y) => String(x.id).localeCompare(String(y.id)));
    
    for (let i = 0; i < sortedA.length; i++) {
        const itemA = sortedA[i];
        const itemB = sortedB[i];
        
        if (String(itemA.id) !== String(itemB.id) ||
            itemA.title !== itemB.title ||
            itemA.category !== itemB.category ||
            itemA.image !== itemB.image ||
            (itemA.size || '') !== (itemB.size || '') ||
            !!itemA.showOnIndex !== !!itemB.showOnIndex) {
            return false;
        }
    }
    return true;
};

// Helper to fetch from database and update cache
const fetchAndUpdateCache = async () => {
    try {
        if (typeof db === 'undefined' || !db) {
            throw new Error("Firebase DB is not initialized");
        }
        const snapshot = await db.collection('portfolioWorks').get();
        if (snapshot.empty) {
            console.log("Firestore empty, populating with default data...");
            for (let work of defaultWorks) {
                await db.collection('portfolioWorks').doc(work.id.toString()).set(work);
            }
            localStorage.setItem('portfolioWorksCache', JSON.stringify(defaultWorks));
            worksCache = defaultWorks;
            return defaultWorks;
        }
        const works = [];
        snapshot.forEach(doc => {
            works.push(doc.data());
        });
        localStorage.setItem('portfolioWorksCache', JSON.stringify(works));
        worksCache = works;
        return works;
    } catch (e) {
        console.error("Error fetching works from Firebase: ", e);
        const cached = localStorage.getItem('portfolioWorksCache');
        return cached ? JSON.parse(cached) : defaultWorks;
    }
};

// Helper for revalidation in background
const revalidateCacheInBackground = async () => {
    try {
        if (typeof db === 'undefined' || !db) return;
        const snapshot = await db.collection('portfolioWorks').get();
        if (!snapshot.empty) {
            const works = [];
            snapshot.forEach(doc => {
                works.push(doc.data());
            });
            
            const oldSerialized = localStorage.getItem('portfolioWorksCache');
            const oldWorks = oldSerialized ? JSON.parse(oldSerialized) : null;
            
            if (!areWorksEqual(oldWorks, works)) {
                console.log("Database update detected! Re-rendering view...");
                localStorage.setItem('portfolioWorksCache', JSON.stringify(works));
                worksCache = works;
                // Live re-render UI in place
                await renderIndexWorks();
                await renderCategoryPage();
            }
        }
    } catch (e) {
        console.warn("Background cache sync failed: ", e);
    }
};

// SWR getWorks function
const getWorks = async () => {
    // 1. Return in-memory cache if available (0ms)
    if (worksCache) return worksCache;

    // 2. Return localStorage cache if available (5ms)
    const cached = localStorage.getItem('portfolioWorksCache');
    if (cached) {
        try {
            worksCache = JSON.parse(cached);
            // Run background fetch to refresh cache asynchronously
            revalidateCacheInBackground();
            return worksCache;
        } catch (e) {
            console.error("Failed to parse cached data: ", e);
        }
    }

    // 3. Fallback: retrieve synchronously if no cache is available
    return await fetchAndUpdateCache();
};

// Render works on index page
const renderIndexWorks = async () => {
    const categories = [
        { id: 'product-posters', page: 'product-posters.html' },
        { id: 'image-manipulation', page: 'image-manipulation.html' },
        { id: 'social-media-ads', page: 'social-media-ads.html' },
        { id: 'movie-posters', page: 'movie-posters.html' }
    ];

    const works = await getWorks();

    categories.forEach(cat => {
        const grid = document.getElementById(`grid-${cat.id}`);
        if (!grid) return; // If not on index page

        grid.innerHTML = '';
        
        // Filter works for this category that are configured to show on the index page
        let catWorks = works.filter(w => w.category === cat.id && w.showOnIndex === true);
        
        // Fallback: If no works are explicitly flagged for the index in this category, display all category works
        if (catWorks.length === 0) {
            catWorks = works.filter(w => w.category === cat.id);
        }
        
        // Take up to 5 works
        const topWorks = catWorks.slice(0, 5);

        topWorks.forEach((work, index) => {
            const card = document.createElement('a');
            card.href = '#';
            card.className = 'work-card fade-up';
            card.style.transitionDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <img src="${work.image}" alt="${work.title}" class="work-img">
                <div class="work-info">
                    <h4>${work.title}</h4>
                </div>
            `;
            grid.appendChild(card);
            fadeObserver.observe(card);
        });

        // Add the 6th "View More" card
        const viewMore = document.createElement('a');
        viewMore.href = cat.page;
        viewMore.className = 'work-card view-more-card fade-up';
        viewMore.style.transitionDelay = '0.5s';
        viewMore.innerHTML = `
            <i class="fas fa-arrow-right" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <span>View All</span>
        `;
        grid.appendChild(viewMore);
        fadeObserver.observe(viewMore);
    });
};

// Smooth scrolling for navigation links
const setupSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
};

// Render full category page (for subpages)
const renderCategoryPage = async () => {
    const pageId = document.body.getAttribute('data-category');
    if (!pageId) return;

    const grid = document.getElementById('full-works-grid');
    if (!grid) return;

    const works = await getWorks();
    const categoryWorks = works.filter(w => w.category === pageId);

    grid.innerHTML = '';

    if (categoryWorks.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-muted);">No works found for this category.</p>';
        return;
    }

    categoryWorks.forEach(work => {
        const card = document.createElement('div');
        card.className = 'work-card fade-up';
        card.style.cursor = 'pointer';
        
        // Apply custom aspect ratio based on size for subpages
        if (work.size) {
            const [w, h] = work.size.split('x');
            card.style.aspectRatio = `${w} / ${h}`;
        } else {
            card.style.aspectRatio = '1080 / 1080'; // Default to square
        }
        card.style.alignSelf = 'start'; // Prevent vertical stretching in CSS grid rows

        card.innerHTML = `
            <img src="${work.image}" alt="${work.title}" class="work-img">
            <div class="work-info">
                <h4>${work.title}</h4>
            </div>
        `;

        // Open modal on click
        card.addEventListener('click', () => {
            openModal(work.image, work.title);
        });

        grid.appendChild(card);
        fadeObserver.observe(card);
    });
};

// --- Animations & Interactivity ---

const setupAnimations = () => {
    // 1. Intersection Observer for static Fade-Up elements
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => fadeObserver.observe(el));

    // 2. Dynamic Violet Hue Shift on Scroll
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const scrollPx = window.scrollY;
        const nav = document.querySelector('nav');
        
        // Navbar blur on scroll
        if (scrollPx > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Navbar fade out on scroll down, fade in on scroll up
        if (scrollPx > lastScrollY && scrollPx > 100) {
            nav.classList.add('nav-hidden');
        } else {
            nav.classList.remove('nav-hidden');
        }
        lastScrollY = scrollPx;

        const maxScroll = document.body.scrollHeight - window.innerHeight;
        // Avoid division by zero
        if (maxScroll <= 0) return;
        
        const scrollPercentage = scrollPx / maxScroll;
        
        // Base hue is 271 (violet). We will shift it up to 320 (pink/magenta) based on scroll
        const baseHue = 271;
        const targetHue = 320;
        const currentHue = baseHue + ((targetHue - baseHue) * scrollPercentage);
        
        document.documentElement.style.setProperty('--color-violet', `hsl(${currentHue}, 76%, 53%)`);
    });

    // 3. Mouse Glow Cursor
    const glowCursor = document.getElementById('glow-cursor');
    if (glowCursor) {
        window.addEventListener('mousemove', (e) => {
            glowCursor.style.left = e.clientX + 'px';
            glowCursor.style.top = e.clientY + 'px';
        });
    }
};

// --- Content Protection ---

const setupProtection = () => {
    // Disable Right-Click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Disable Shortcuts
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
            e.preventDefault();
        }

        // Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
        }

        // Ctrl+S (Save)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
        }
    });
};

// --- Image Modal / Popup ---

const setupModal = () => {
    // Create modal element if it doesn't exist
    if (document.getElementById('work-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'work-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close"><i class="fas fa-times"></i></span>
            <img src="" alt="" class="modal-img">
            <div class="modal-info"></div>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on click outside or close button
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.modal-close')) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Re-enable scroll
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
};

const openModal = (imgSrc, title) => {
    const modal = document.getElementById('work-modal');
    if (!modal) return;

    const modalImg = modal.querySelector('.modal-img');
    const modalInfo = modal.querySelector('.modal-info');

    modalImg.src = imgSrc;
    modalImg.alt = title;
    modalInfo.textContent = title;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Disable background scroll
};

// --- Clean URL (hide .html from address bar on all pages) ---
const cleanUrl = () => {
    try {
        if (window.location.protocol === 'file:') return; // Do not clean URL on local file system to avoid DOMExceptions
        const url = window.location.href;
        if (url.endsWith('index.html') || url.endsWith('index')) {
            // Show root / for index page
            const cleanedUrl = url.replace(/\/index(\.html)?$/, '/');
            history.replaceState(null, '', cleanedUrl);
        } else if (url.endsWith('.html')) {
            // Remove .html from subpages
            const cleanedUrl = url.slice(0, -5);
            history.replaceState(null, '', cleanedUrl);
        }
    } catch (e) {
        console.warn("Could not clean URL: ", e);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    cleanUrl(); // Hide .html from URL bar
    setupModal(); // Initialize modal first
    await renderIndexWorks();
    setupSmoothScroll();
    await renderCategoryPage();
    setupAnimations();
    setupProtection();
});
