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
    initStatsSection();
    initWhatsAppCtas();
    initFormHandling();
    initCookiePopup();
    initClientPreviews();
});

const WHATSAPP_NUMBER = '447451267226';
const CONTACT_API_ENDPOINT = '/api/contact';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    const submitButton = form.querySelector('button[type="submit"]');
    const submitLabel = form.querySelector('.quote-submit-label');
    const statusElement = form.querySelector('.form-status');
    const startedAtField = form.querySelector('#formStartedAt');
    const syncServiceFields = initServiceAdaptiveFields(form);

    if (startedAtField) {
        startedAtField.value = String(Date.now());
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        syncServiceFields();

        if (!form.checkValidity()) {
            form.reportValidity();
            updateFormStatus(statusElement, 'Please complete all required fields.', 'error');
            return;
        }

        const payload = getFormPayload(form);
        const validationError = validateFormPayload(payload);

        if (validationError) {
            updateFormStatus(statusElement, validationError, 'error');
            return;
        }

        setFormPending(submitButton, submitLabel, true);
        updateFormStatus(statusElement, 'Sending your message...', 'pending');

        try {
            // Get reCAPTCHA v3 token before sending
            if (typeof grecaptcha !== 'undefined') {
                payload.recaptchaToken = await grecaptcha.execute('6LcnRtcsAAAAAJ8Sm0iJJPBS5oGn9PLNYQYIvT59', { action: 'contact_form' });
            }

            const response = await fetch(CONTACT_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.success) {
                throw new Error(getContactErrorMessage(response.status, result.error));
            }

            form.reset();
            if (startedAtField) {
                startedAtField.value = String(Date.now());
            }

            // Show thank-you screen
            const successScreen = document.getElementById('formSuccessScreen');
            const successBody = document.getElementById('formSuccessBody');
            if (successScreen) {
                if (successBody && payload.name) {
                    successBody.textContent = `Thanks ${payload.name}, we\u2019ll be in touch within 24 hours.`;
                }
                form.hidden = true;
                successScreen.hidden = false;
                successScreen.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                updateFormStatus(statusElement, result.message || 'Thanks. Your message has been sent successfully.', 'success');
            }
        } catch (error) {
            console.error('Contact form submission failed:', error);

            const fallbackMessage = error instanceof TypeError
                ? 'Network error while sending your message. Please check your connection and try again.'
                : 'We could not send your message right now. Please try again shortly.';

            updateFormStatus(
                statusElement,
                error instanceof Error ? error.message : fallbackMessage,
                'error'
            );
        } finally {
            setFormPending(submitButton, submitLabel, false);
        }
    });
}

function getContactErrorMessage(statusCode, fallback) {
    if (statusCode === 400) {
        return fallback || 'Please complete all required form fields and try again.';
    }

    if (statusCode === 404) {
        return 'Contact endpoint is unavailable on this deployment. Please redeploy serverless functions or contact support.';
    }

    if (statusCode === 405) {
        return 'Invalid request method for contact form submission.';
    }

    if (statusCode === 429) {
        return 'Submission blocked. Please wait a moment and try again.';
    }

    if (statusCode >= 500) {
        return fallback || 'Email service is currently unavailable. Please try again shortly.';
    }

    return fallback || 'We could not send your message right now. Please try again shortly.';
}

function initStatsSection() {
    const section = document.querySelector('.stats-section');
    if (!section) return;

    const rings = section.querySelectorAll('.stat-ring');
    if (!rings.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    rings.forEach((ring) => {
        const rawValue = Number(ring.style.getPropertyValue('--stat-value')) || 0;
        const target = Math.max(0, Math.min(rawValue, 100));
        const valueElement = ring.querySelector('.stat-ring-value');

        ring.dataset.targetValue = String(target);
        ring.style.setProperty('--stat-progress', '0');
        ring.classList.add('is-loading');
        ring.classList.remove('is-loaded');

        if (valueElement) {
            valueElement.textContent = '0%';
        }
    });

    if (prefersReducedMotion) {
        rings.forEach((ring) => {
            const target = Number(ring.dataset.targetValue || 0);
            const valueElement = ring.querySelector('.stat-ring-value');
            ring.style.setProperty('--stat-progress', String(target));
            ring.classList.remove('is-loading');
            ring.classList.add('is-loaded');
            if (valueElement) {
                valueElement.textContent = `${target}%`;
            }
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            rings.forEach((ring, index) => {
                const target = Number(ring.dataset.targetValue || 0);
                setTimeout(() => animateStatRing(ring, target, 1500), index * 130);
            });

            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.35
    });

    observer.observe(section);
}

function animateStatRing(ring, target, duration) {
    const valueElement = ring.querySelector('.stat-ring-value');
    const startTime = performance.now();

    ring.classList.add('is-loading');
    ring.classList.remove('is-loaded');

    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;

        ring.style.setProperty('--stat-progress', value.toFixed(2));
        if (valueElement) {
            valueElement.textContent = `${Math.round(value)}%`;
        }

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            ring.classList.remove('is-loading');
            ring.classList.add('is-loaded');
            ring.style.setProperty('--stat-progress', String(target));
            if (valueElement) {
                valueElement.textContent = `${target}%`;
            }
        }
    }

    requestAnimationFrame(tick);
}

function getFormPayload(form) {
    const serviceSelect = form.querySelector('#service');
    const budgetSelect = form.querySelector('#budget');
    const timelineSelect = form.querySelector('#timeline');
    const referralSelect = form.querySelector('#referralSource');
    const serviceOption = serviceSelect?.options[serviceSelect.selectedIndex];

    return {
        name: form.querySelector('#name')?.value.trim() || '',
        email: form.querySelector('#email')?.value.trim() || '',
        phone: form.querySelector('#phone')?.value.trim() || '',
        companyName: form.querySelector('#companyName')?.value.trim() || '',
        serviceKey: serviceOption?.value || '',
        service: serviceOption?.text?.trim() || '',
        serviceAnswers: getActiveServiceAnswers(form),
        budget: budgetSelect?.options[budgetSelect.selectedIndex]?.text?.trim() || '',
        timeline: timelineSelect?.options[timelineSelect.selectedIndex]?.text?.trim() || '',
        referralSource: referralSelect?.options[referralSelect.selectedIndex]?.text?.trim() || '',
        message: form.querySelector('#details')?.value.trim() || '',
        consent: form.querySelector('#consent')?.checked || false,
        honeypot: form.querySelector('#websiteTrap')?.value.trim() || '',
        formStartedAt: form.querySelector('#formStartedAt')?.value || '',
        recaptchaToken: ''
    };
}

function getActiveServiceAnswers(form) {
    const activeGroup = form.querySelector('.service-fields:not([hidden])');
    if (!activeGroup) return [];

    const fields = Array.from(activeGroup.querySelectorAll('input, select, textarea'));

    return fields
        .map((field) => {
            const labelElement = field.closest('.form-group')?.querySelector('label');
            let value = '';

            if (field.tagName === 'SELECT') {
                value = field.options[field.selectedIndex]?.text?.trim() || '';
            } else if (field.type === 'checkbox') {
                value = field.checked ? 'Yes' : 'No';
            } else {
                value = field.value.trim();
            }

            const label = (labelElement?.textContent || '')
                .replace('*', '')
                .trim();

            return {
                label,
                value
            };
        })
        .filter((entry) => entry.label && entry.value);
}

function initServiceAdaptiveFields(form) {
    const serviceSelect = form.querySelector('#service');
    const groups = Array.from(form.querySelectorAll('.service-fields'));

    function sync() {
        const selectedService = serviceSelect?.value || '';

        groups.forEach((group) => {
            const isActive = group.getAttribute('data-service-fields') === selectedService;
            group.hidden = !isActive;

            const fields = group.querySelectorAll('input, select, textarea');
            fields.forEach((field) => {
                const isRequired = field.dataset.required === 'true';
                field.disabled = !isActive;
                field.required = isActive && isRequired;
            });
        });
    }

    if (serviceSelect) {
        serviceSelect.addEventListener('change', sync);
    }

    sync();
    return sync;
}

function validateFormPayload(payload) {
    if (!payload.name || !payload.email || !payload.service || !payload.budget || !payload.timeline || !payload.message) {
        return 'Please complete all required fields.';
    }

    if (!payload.serviceAnswers.length) {
        return 'Please answer the service-specific questions.';
    }

    if (!EMAIL_PATTERN.test(payload.email)) {
        return 'Please enter a valid email address.';
    }

    if (payload.message.length < 10) {
        return 'Please provide a bit more detail about your project.';
    }

    if (!payload.consent) {
        return 'Please confirm consent so we can respond to your enquiry.';
    }

    return '';
}

function setFormPending(button, label, isPending) {
    if (!button) return;

    button.disabled = isPending;
    button.setAttribute('aria-busy', String(isPending));

    if (label) {
        label.textContent = isPending ? 'SENDING...' : 'SEND MESSAGE';
    }
}

function updateFormStatus(element, message, state) {
    if (!element) return;

    element.textContent = message;
    element.dataset.state = state;
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
                setTimeout(() => card.classList.add('mob-in'), i * 70);
                observer.unobserve(card);
            });
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
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
            <img src="" alt="Site preview" style="opacity:0">
        </div>
        <div class="site-preview-visit">
            Click to visit
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
        </div>`;
    document.body.appendChild(preview);

    const thumb = preview.querySelector('.site-preview-body img');
    const urlLabel = preview.querySelector('.site-preview-url');
    const loader = preview.querySelector('.site-preview-loader');

    let hoverTimeout = null;
    let currentUrl = '';

    // Pre-cache screenshot URLs so hover feels instant
    const cache = {};

    function getScreenshotUrl(url) {
        return `https://image.thum.io/get/width/760/crop/480/noanimate/${url}`;
    }

    function positionPreview(item) {
        const rect = item.getBoundingClientRect();
        const pw = 380;
        const gap = 14;

        // Estimate height (header ~34 + image ~200 + footer ~36)
        const ph = 280;

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
        const url = item.getAttribute('data-url');

        // Preload screenshot on first intersection
        const preloadObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && url && !cache[url]) {
                    const img = new Image();
                    img.src = getScreenshotUrl(url);
                    cache[url] = img;
                    preloadObserver.unobserve(item);
                }
            });
        }, { rootMargin: '200px' });
        preloadObserver.observe(item);

        item.addEventListener('mouseenter', () => {
            if (!url) return;
            clearTimeout(hoverTimeout);

            hoverTimeout = setTimeout(() => {
                positionPreview(item);
                urlLabel.textContent = url.replace(/^https?:\/\//, '').replace(/\/$/, '');

                if (currentUrl !== url) {
                    currentUrl = url;
                    loader.style.display = 'block';
                    thumb.style.opacity = '0';

                    const src = getScreenshotUrl(url);
                    thumb.src = src;
                    thumb.onload = () => {
                        loader.style.display = 'none';
                        thumb.style.opacity = '1';
                    };
                    thumb.onerror = () => {
                        loader.style.display = 'none';
                        thumb.style.opacity = '0';
                    };
                }

                preview.classList.add('visible');
            }, 200);
        });

        item.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            preview.classList.remove('visible');
        });

        // Click takes user to the site
        item.addEventListener('click', () => {
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
        });
    });
}
