class ThemeManager {
    constructor() {
        const stored = localStorage.getItem('theme');
        if (stored && stored !== 'null') {
            this.theme = stored; // 'light' or 'dark'
        } else {
            // No stored preference: detect system and use it as initial theme
            this.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.setupEventListeners();
        this.setActiveButton();
        // When translations are loaded, update the toggle button title to localized value
        document.addEventListener('translationsLoaded', () => this.updateToggleButton());
    }

    applyTheme(theme) {
        // Only 'light' or 'dark' are accepted
        if (theme !== 'light' && theme !== 'dark') return;

        // Sauvegarder la préférence
        this.theme = theme;
        localStorage.setItem('theme', theme);

        // Appliquer le thème
        document.body.setAttribute('data-theme', theme);
        document.body.className = theme + '-theme';

        // Mettre à jour l'icône / état du bouton
        this.updateToggleButton();
    }

    setupEventListeners() {
        // Single toggle button
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const newTheme = this.theme === 'dark' ? 'light' : 'dark';
                this.applyTheme(newTheme);
            });
        }

        // Listen to system changes: if user has not explicitly changed theme (no stored), update current theme
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', (e) => {
            const stored = localStorage.getItem('theme');
            if (!stored || stored === 'null') {
                // If no explicit preference, follow system
                const systemTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(systemTheme);
            }
        });
    }

    setActiveButton() {
        // kept for backward compatibility: mark buttons if any
        document.querySelectorAll('.theme-btn').forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-theme') === this.theme) {
                button.classList.add('active');
            }
        });
    }

    updateToggleButton() {
        const icon = document.getElementById('themeIcon');
        const toggle = document.getElementById('themeToggle');
        if (!toggle || !icon) return;

        if (this.theme === 'dark') {
            icon.className = 'fas fa-moon';
            toggle.setAttribute('title', this.getLocalizedTitle('theme_dark_title') || 'Mode sombre');
            toggle.setAttribute('aria-pressed', 'true');
        } else {
            icon.className = 'fas fa-sun';
            toggle.setAttribute('title', this.getLocalizedTitle('theme_light_title') || 'Mode clair');
            toggle.setAttribute('aria-pressed', 'false');
        }
    }

    getLocalizedTitle(key) {
        try {
            const storedLang = localStorage.getItem('language') || 'fr';
            // Try to load translations synchronously from previously fetched JSON stored on window (if we stored them)
            // Fallback: look for translations applied to document via data-key attributes
            // The language-switcher already updates titles when translations are loaded.
            // Here, we simply try to read the attribute from an element that has that data-key.
            const el = document.querySelector(`[data-key-title="${key}"]`);
            if (el) return el.getAttribute('title');
        } catch (e) {
            // ignore
        }
        return null;
    }
}

// Menu mobile
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });
        
        // Fermer le menu en cliquant sur un lien
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                menuToggle.classList.remove('open');
            });
        });
    }
}

// Smooth scroll pour les ancres
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Mettre à jour l'année dans le footer
function updateCurrentYear() {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Initialiser tout quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    setupMobileMenu();
    setupSmoothScroll();
    updateCurrentYear();
});