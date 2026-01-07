// ===========================================
// UTM Parameter Extraction
// ===========================================
function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source') || 'direct',
        utm_medium: params.get('utm_medium') || 'none',
        utm_campaign: params.get('utm_campaign') || 'none',
        utm_content: params.get('utm_content') || 'none',
        utm_term: params.get('utm_term') || 'none'
    };
}

// ===========================================
// DataLayer Push Helper
// ===========================================
function pushToDataLayer(event, data = {}) {
    // GTM compatibility
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: event,
        ...data
    });

    // Direct GA4 compatibility (gtag.js)
    if (typeof gtag === 'function') {
        gtag('event', event, data);
    }
}

// ===========================================
// CTA Click Tracking
// ===========================================
function initCTATracking() {
    const ctaButtons = document.querySelectorAll('[data-cta]');
    const utm = getUTMParams();

    ctaButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const location = this.getAttribute('data-cta');

            // Push to dataLayer for GTM
            pushToDataLayer('cta_click', {
                cta_location: location,
                cta_text: this.textContent.trim(),
                ...utm
            });

            // Push telegram_redirect event (primary conversion)
            pushToDataLayer('telegram_redirect', {
                cta_location: location,
                ...utm
            });

            // Add UTM params to Telegram link
            const baseUrl = this.getAttribute('href');

            try {
                const telegramUrl = new URL(baseUrl);
                telegramUrl.searchParams.set('startapp', `utm_${utm.utm_source}_${utm.utm_content}`);

                // Small delay to ensure tracking fires
                e.preventDefault();
                setTimeout(() => {
                    window.location.href = telegramUrl.toString();
                }, 150);
            } catch (err) {
                console.error("Error constructing Telegram URL", err);
            }
        });
    });
}

// ===========================================
// Sticky CTA (Mobile)
// ===========================================
function initStickyCTA() {
    const stickyCTA = document.getElementById('sticky-cta');
    const hero = document.getElementById('hero');

    if (!stickyCTA || !hero) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                stickyCTA.classList.add('translate-y-full');
            } else {
                stickyCTA.classList.remove('translate-y-full');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(hero);
}

// ===========================================
// Scroll Depth Tracking
// ===========================================
function initScrollTracking() {
    const scrollMilestones = [25, 50, 75, 100];
    const trackedMilestones = new Set();

    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        scrollMilestones.forEach(milestone => {
            if (scrollPercent >= milestone && !trackedMilestones.has(milestone)) {
                trackedMilestones.add(milestone);
                pushToDataLayer('scroll_depth', {
                    depth_percent: milestone
                });
            }
        });
    }, { passive: true });
}

// ===========================================
// Time on Page Tracking
// ===========================================
function initTimeTracking() {
    const timeThresholds = [10, 30, 60, 120]; // seconds

    timeThresholds.forEach(seconds => {
        setTimeout(() => {
            pushToDataLayer('time_on_page', {
                time_seconds: seconds
            });
        }, seconds * 1000);
    });
}

// ===========================================
// Modal Logic
// ===========================================
function initModals() {
    window.openModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const content = modal.querySelector('div[class*="transform"]');
            if (content) content.classList.remove('scale-95', 'opacity-0');
        }, 10);
        document.body.style.overflow = 'hidden';
    };

    window.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('opacity-0');
        const content = modal.querySelector('div[class*="transform"]');
        if (content) content.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
        document.body.style.overflow = '';
    };

    // Close on clicking outside
    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal-overlay')) {
            const modalId = event.target.id;
            window.closeModal(modalId);
        }
    });

    // Close on Escape key
    window.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
            openModals.forEach(modal => window.closeModal(modal.id));
        }
    });
}

// ===========================================
// Initialize on DOM Ready
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // Push page_view with UTM data
    const utm = getUTMParams();
    pushToDataLayer('page_view_custom', {
        page_title: document.title,
        page_location: window.location.href,
        market: 'sea',
        language: 'en',
        ...utm
    });

    // Initialize all tracking
    initCTATracking();
    initStickyCTA();
    initScrollTracking();
    initTimeTracking();

    // Initialize Modals
    initModals();
});
