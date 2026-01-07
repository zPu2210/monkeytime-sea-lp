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
            // Handle cases where href might already have query params?
            // Assuming simple URL or one that doesn't conflict yet.

            try {
                const telegramUrl = new URL(baseUrl);
                // Telegram startapp param usually takes one string, underscores preferred for separation if multiple
                // original code: telegramUrl.searchParams.set('startapp', `utm_${utm.utm_source}_${utm.utm_content}`);
                telegramUrl.searchParams.set('startapp', `utm_${utm.utm_source}_${utm.utm_content}`);

                // Small delay to ensure tracking fires
                e.preventDefault();
                setTimeout(() => {
                    window.location.href = telegramUrl.toString();
                }, 150);
            } catch (err) {
                console.error("Error constructing Telegram URL", err);
                // Fallback to default behavior if URL construction fails
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
                // Hero is visible, hide sticky CTA (move it down)
                stickyCTA.classList.add('translate-y-full');
            } else {
                // Hero is not visible, show sticky CTA
                stickyCTA.classList.remove('translate-y-full');
            }
        });
    }, { threshold: 0.1 }); // Adjusted threshold for better sensitivity

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
});
