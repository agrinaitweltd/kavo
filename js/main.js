// ========================================
// Kavo Tech - Main JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initHeroWordAnimation();
    initTextStaggerAnimations();
    initScrollAnimations();
    initMobileCardAnimations();
    initSmoothScroll();
    initCounterAnimations();
    initWhatsAppCtas();
    initFormHandling();
    initCookiePopup();
    initClientPreviews();
});

const WHATSAPP_NUMBER = '447913166329';

function openWhatsApp(message) {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener,noreferrer');
}

function initWhatsAppCtas() {
    const ctas = document.querySelectorAll('.whatsapp-cta');
    if (!ctas.length) return;

    ctas.forEach((cta) => {
        cta.addEventListener('click', (e) => {
            e.preventDefault();
            const service = cta.getAttribute('data-service') || 'Website service';
            const message = `Hi Kavo Tech, I would like to get started with: ${service}.`;
            openWhatsApp(message);
        });
    });
}

// ========================================
// Header Scroll Effect
// ========================================
function initHeader() {
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    }, { passive: true });
}

// ========================================
// Mobile Menu
// ========================================
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (!toggle || !mobileNav) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ========================================
// Hero Word-by-Word Animation
// ========================================
function initHeroWordAnimation() {
    const targets = document.querySelectorAll('.hero-title, .hero-subtitle');

    if (!targets.length) return;

    targets.forEach((target, targetIndex) => {
        if (target.classList.contains('word-animated')) return;

        let wordIndex = 0;
        wrapWords(target);

        target.classList.add('word-animated');
        target.style.setProperty('--word-base-delay', `${targetIndex * 120}ms`);

        function wrapWords(node) {
            const children = Array.from(node.childNodes);

            children.forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const fragment = createWordFragment(child.textContent || '');
                    if (fragment) {
                        child.replaceWith(fragment);
                    }
                    return;
                }

                if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
                    wrapWords(child);
                }
            });
        }

        function createWordFragment(text) {
            const normalized = text.replace(/\s+/g, ' ').trim();
            if (!normalized) return null;

            const words = normalized.split(' ');
            const fragment = document.createDocumentFragment();

            words.forEach((word, index) => {
                const span = document.createElement('span');
                span.className = 'word-unit';
                span.style.setProperty('--word-index', wordIndex++);
                span.textContent = word;
                fragment.appendChild(span);

                if (index < words.length - 1) {
                    fragment.appendChild(document.createTextNode(' '));
                }
            });

            return fragment;
        }
    });
}

// ========================================
// Section Text Stagger Animations
// ========================================
function initTextStaggerAnimations() {
    const blocks = document.querySelectorAll(
        '.section-header, .services-grid, .why-grid, .pricing-grid, .addon-grid, .contact-cards'
    );

    if (!blocks.length) return;

    blocks.forEach((block) => {
        let textIndex = 0;
        const targets = block.querySelectorAll(
            '.section-tag, .section-title, .section-subtitle, h3, h4, p, .pricing-tier, .pricing-price, .addon-title, .pricing-features li, .addon-row span'
        );

        targets.forEach((target) => {
            if (target.classList.contains('text-reveal') || target.classList.contains('text-pop')) return;

            const isHeading = /^H[1-4]$/.test(target.tagName) ||
                target.classList.contains('section-title') ||
                target.classList.contains('addon-title') ||
                target.classList.contains('pricing-price');

            target.classList.add(isHeading ? 'text-pop' : 'text-reveal');
            target.style.setProperty('--text-index', textIndex++);
        });
    });
}

// ========================================
// Scroll Animations (Intersection Observer)
// ========================================
function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');

    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// ========================================
// Counter Animations
// ========================================
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number, .client-stat-number');

    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const text = element.textContent.trim();
    const match = text.match(/^(\d+)/);

    if (!match) return;

    const target = parseInt(match[1]);
    const suffix = text.replace(match[1], '');
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        element.textContent = current + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ========================================
// Form Handling
// ========================================
function initFormHandling() {
    const form = document.querySelector('.quote-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const name = form.querySelector('#name')?.value.trim() || 'Not provided';
        const email = form.querySelector('#email')?.value.trim() || 'Not provided';
        const phone = form.querySelector('#phone')?.value.trim() || 'Not provided';
        const serviceSelect = form.querySelector('#service');
        const service = serviceSelect?.options[serviceSelect.selectedIndex]?.text || 'Not provided';
        const details = form.querySelector('#details')?.value.trim() || 'Not provided';

        const message = [
            'Hi Kavo Tech, I want to get started with this service request:',
            '',
            `Service: ${service}`,
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            `Project details: ${details}`
        ].join('\n');

        // Show contact method dialog
        showContactMethodDialog(message, email, name, service);
    });
}

function showContactMethodDialog(message, userEmail, userName, service) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    // Create modal dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = 'background: white; padding: 40px; border-radius: 8px; max-width: 400px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2);';
    
    dialog.innerHTML = `
        <h3 style="margin: 0 0 20px 0; font-size: 20px; color: #000;">How would you like to proceed?</h3>
        <p style="margin: 0 0 30px 0; color: #666; font-size: 14px;">Choose your preferred contact method</p>
        <div style="display: flex; gap: 10px;">
            <button class="contact-btn whatsapp-btn" style="flex: 1; padding: 12px; border: none; border-radius: 6px; background: #25D366; color: white; font-weight: 600; cursor: pointer; font-size: 14px;">WhatsApp</button>
            <button class="contact-btn email-btn" style="flex: 1; padding: 12px; border: none; border-radius: 6px; background: #000; color: white; font-weight: 600; cursor: pointer; font-size: 14px;">Email</button>
        </div>
    `;
    
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    
    // WhatsApp button handler
    dialog.querySelector('.whatsapp-btn').addEventListener('click', () => {
        document.body.removeChild(backdrop);
        openWhatsApp(message);
    });
    
    // Email button handler
    dialog.querySelector('.email-btn').addEventListener('click', () => {
        document.body.removeChild(backdrop);
        sendViaEmail(userEmail, userName, service, message);
    });
    
    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            document.body.removeChild(backdrop);
        }
    });
}

function sendViaEmail(userEmail, userName, service, message) {
    const supportEmail = 'info@kavotech.uk';
    const subject = encodeURIComponent(`Service Inquiry from ${userName} - ${service}`);
    const body = encodeURIComponent(message);
    
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
}

// ========================================
// Active Nav Link Highlighting
// ========================================
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
        const scrollPos = window.pageYOffset + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { passive: true });
})();

// ========================================
// Cookie Popup
// ========================================
function initCookiePopup() {
    try {
        const key = 'kavo_cookie_consent_v1';
        const accepted = localStorage.getItem(key);
        const popup = document.getElementById('cookiePopup');
        const acceptBtn = document.getElementById('cookieAccept');
        const closeBtn = document.getElementById('cookieClose');
        const prefsBtn = document.getElementById('cookiePrefs');
        const prefsPanel = document.getElementById('cookiePrefsPanel');
        const prefsSave = document.getElementById('prefsSave');
        const prefsCancel = document.getElementById('prefsCancel');

        if (!popup) return;

        if (accepted === 'accepted') return;

        // show after slight delay so it doesn't feel abrupt
        setTimeout(() => popup.classList.add('show'), 700);

        function closePopup() {
            popup.classList.remove('show');
            setTimeout(() => { popup.style.display = 'none'; }, 350);
        }

        acceptBtn && acceptBtn.addEventListener('click', () => {
            localStorage.setItem(key, 'accepted');
            closePopup();
        });

        closeBtn && closeBtn.addEventListener('click', () => {
            closePopup();
        });

        prefsBtn && prefsBtn.addEventListener('click', () => {
            if (!prefsPanel) return;
            prefsPanel.classList.toggle('show');
            prefsPanel.setAttribute('aria-hidden', prefsPanel.classList.contains('show') ? 'false' : 'true');
        });

        prefsSave && prefsSave.addEventListener('click', () => {
            // Save preferences (for demo we just store consent)
            localStorage.setItem(key, 'accepted');
            closePopup();
        });

        prefsCancel && prefsCancel.addEventListener('click', () => {
            if (prefsPanel) {
                prefsPanel.classList.remove('show');
                prefsPanel.setAttribute('aria-hidden', 'true');
            }
        });

    } catch (e) {
        console.warn('Cookie popup init failed', e);
    }
}

// ========================================
// Mobile Card Animations
// ========================================
function initMobileCardAnimations() {
    if (window.innerWidth > 768) return;

    // Make grid wrappers instantly visible so per-card animations drive the entrance
    document.querySelectorAll(
        '.services-grid[data-animate], .why-grid[data-animate], .pricing-grid[data-animate], ' +
        '.addon-grid[data-animate], .contact-cards[data-animate], .clients-stats[data-animate]'
    ).forEach(grid => {
        grid.style.opacity = '1';
        grid.style.transform = 'none';
        grid.style.transition = 'none';
    });

    const cards = document.querySelectorAll(
        '.service-card, .pricing-card, .addon-card, .why-card, .contact-card, .client-stat'
    );
    if (!cards.length) return;

    cards.forEach(card => card.classList.add('mob-card'));

    const observer = new IntersectionObserver((entries) => {
        // Group by parent to stagger siblings that enter the viewport together
        const byParent = new Map();
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const parent = entry.target.parentElement;
            if (!byParent.has(parent)) byParent.set(parent, []);
            byParent.get(parent).push(entry.target);
        });

        byParent.forEach(siblings => {
            siblings.forEach((card, i) => {
                setTimeout(() => card.classList.add('mob-in'), i * 90);
                observer.unobserve(card);
            });
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px'
    });

    cards.forEach(card => observer.observe(card));
}

// ========================================
// Client Logo Hover Previews
// ========================================
function initClientPreviews() {
    const logoItems = document.querySelectorAll('.logo-item[data-url]');
    if (!logoItems.length || window.innerWidth <= 768) return;

    // Create the floating preview element once
    const preview = document.createElement('div');
    preview.className = 'site-preview';
    preview.innerHTML = `
        <div class="site-preview-header">
            <span class="site-preview-dot"></span>
            <span class="site-preview-dot"></span>
            <span class="site-preview-dot"></span>
            <span class="site-preview-url"></span>
        </div>
        <div class="site-preview-body">
            <div class="site-preview-loader"></div>
            <iframe sandbox="allow-scripts allow-same-origin" loading="lazy" title="Site preview"></iframe>
        </div>`;
    document.body.appendChild(preview);

    const iframe = preview.querySelector('iframe');
    const urlLabel = preview.querySelector('.site-preview-url');
    const loader = preview.querySelector('.site-preview-loader');

    let hoverTimeout = null;
    let currentUrl = '';

    function positionPreview(item) {
        const rect = item.getBoundingClientRect();
        const pw = 420;
        const ph = 280;
        const gap = 14;

        // Place above the logo by default
        let top = rect.top - ph - gap;
        let left = rect.left + rect.width / 2 - pw / 2;

        // If it would go above viewport, place below
        if (top < 8) {
            top = rect.bottom + gap;
        }
        // Keep within horizontal bounds
        if (left < 8) left = 8;
        if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;

        preview.style.top = top + 'px';
        preview.style.left = left + 'px';
    }

    logoItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const url = item.getAttribute('data-url');
            if (!url) return;

            clearTimeout(hoverTimeout);

            hoverTimeout = setTimeout(() => {
                positionPreview(item);

                if (currentUrl !== url) {
                    currentUrl = url;
                    loader.style.display = 'block';
                    iframe.style.opacity = '0';
                    iframe.src = url;
                    urlLabel.textContent = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

                    iframe.onload = () => {
                        loader.style.display = 'none';
                        iframe.style.opacity = '1';
                    };
                }

                preview.classList.add('visible');
            }, 250);
        });

        item.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            preview.classList.remove('visible');
        });

        // Click takes user to the site
        item.addEventListener('click', () => {
            const url = item.getAttribute('data-url');
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
        });
    });
}
