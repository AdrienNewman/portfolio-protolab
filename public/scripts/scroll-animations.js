// Scroll Animations using Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections and cards
    const elementsToAnimate = document.querySelectorAll(
        '.skill-card, .project-card, .doc-category-card, .doc-stat-card, section'
    );

    elementsToAnimate.forEach(el => observer.observe(el));
}

// Navigation scroll effects
function initNavigation() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');

    if (navToggle && navMobile) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMobile.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu on link click
        const mobileLinks = navMobile.querySelectorAll('.nav-mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMobile.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Fermeture par touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMobile.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMobile.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        // Fermeture par clic sur le logo AM
        const navLogo = document.querySelector('.nav-logo');
        if (navLogo) {
            navLogo.addEventListener('click', () => {
                if (navMobile.classList.contains('active')) {
                    navToggle.classList.remove('active');
                    navMobile.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            });
        }

        // Scroll parallaxe des titres
        let scrollOffset = 0;
        const maxScroll = 400; // Scroll max avant fermeture
        const mobileMenu = navMobile.querySelector('.nav-mobile-menu');

        // Fonction pour fermer le menu et reset
        const closeMenuAndReset = () => {
            scrollOffset = 0;
            if (mobileMenu) mobileMenu.style.transform = '';
            navToggle.classList.remove('active');
            navMobile.classList.remove('active');
            document.body.classList.remove('menu-open');
        };

        // Scroll molette (desktop) - parallaxe
        navMobile.addEventListener('wheel', (e) => {
            if (!navMobile.classList.contains('active')) return;

            scrollOffset += e.deltaY * 0.5;
            scrollOffset = Math.max(0, scrollOffset); // Pas de scroll négatif

            // Appliquer le décalage aux titres
            if (mobileMenu) {
                mobileMenu.style.transform = `translateY(-${scrollOffset}px)`;
            }

            // Fermer si scroll suffisant
            if (scrollOffset > maxScroll) {
                closeMenuAndReset();
            }
        }, { passive: true });

        // Swipe sur mobile - parallaxe
        let touchStartY = 0;
        let touchCurrentY = 0;
        let isSwiping = false;

        navMobile.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
            touchCurrentY = touchStartY;
            isSwiping = true;
        }, { passive: true });

        navMobile.addEventListener('touchmove', (e) => {
            if (!isSwiping || !navMobile.classList.contains('active')) return;

            touchCurrentY = e.changedTouches[0].screenY;
            const deltaY = touchStartY - touchCurrentY;

            if (deltaY > 0) { // Swipe vers le haut
                scrollOffset = deltaY;
                if (mobileMenu) {
                    mobileMenu.style.transform = `translateY(-${scrollOffset}px)`;
                }
            }
        }, { passive: true });

        navMobile.addEventListener('touchend', () => {
            isSwiping = false;
            // Fermer si swipe suffisant
            if (scrollOffset > maxScroll / 2) {
                closeMenuAndReset();
            } else {
                // Revenir à la position initiale
                scrollOffset = 0;
                if (mobileMenu) {
                    mobileMenu.style.transition = 'transform 0.3s ease';
                    mobileMenu.style.transform = '';
                    setTimeout(() => {
                        if (mobileMenu) mobileMenu.style.transition = '';
                    }, 300);
                }
            }
        }, { passive: true });

        // Reset le scroll quand on ferme le menu par d'autres moyens
        const originalCloseMenu = () => {
            scrollOffset = 0;
            if (mobileMenu) mobileMenu.style.transform = '';
        };

        // Observer les changements de classe pour reset
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && !navMobile.classList.contains('active')) {
                    originalCloseMenu();
                }
            });
        });
        observer.observe(navMobile, { attributes: true });
    }

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
}

// Scroll progress bar
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
}

// Back to top button
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Initialize all - make it globally accessible
function initPortfolio() {
    initSmoothScroll();
    initNavigation();
    initScrollAnimations();
    initScrollProgress();
    initBackToTop();
}

// Initialize portfolio on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initPortfolio();
});
