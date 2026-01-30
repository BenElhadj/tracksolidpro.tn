class LanguageSwitcher {
    constructor() {
        const stored = localStorage.getItem('language');
        if (stored && stored !== 'null') {
            this.currentLang = stored;
        } else {
            // Détecter la langue du navigateur et mapper sur fr/en/ar
            const nav = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
            if (nav.startsWith('ar')) this.currentLang = 'ar';
            else if (nav.startsWith('en')) this.currentLang = 'en';
            else if (nav.startsWith('fr')) this.currentLang = 'fr';
            else this.currentLang = 'fr';
        }
        this.init();
    }

    async init() {
        await this.loadLanguage(this.currentLang);
        this.setupEventListeners();
        this.setActiveButton();
        this.setDocumentDirection();
    }

    async loadLanguage(lang) {
        try {
            if (!lang) throw new Error('Langue invalide');
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) throw new Error('Fichier de traduction non trouvé');
            
            const translations = await response.json();
            this.applyTranslations(translations);
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            
            // Mettre à jour l'attribut lang de la balise html
            document.documentElement.setAttribute('lang', lang);
            
            // Changer la direction pour l'arabe
            this.setDocumentDirection();
            // Mettre à jour les tooltips/localized titles des boutons (s'ils ont data-key-title)
            document.querySelectorAll('[data-key-title]').forEach(el => {
                const key = el.getAttribute('data-key-title');
                if (key && translations[key]) {
                    el.setAttribute('title', translations[key]);
                    // If element is button with img, also update aria-label
                    if (el.classList && el.classList.contains('lang-btn')) {
                        el.setAttribute('aria-label', translations[key]);
                    }
                }
            });
            // Notify other scripts that translations have been loaded
            try { document.dispatchEvent(new Event('translationsLoaded')); } catch (e) {}
            
        } catch (error) {
            console.error('Erreur de chargement de la langue:', error);
        }
    }

    applyTranslations(translations) {
        // Traduire les éléments avec data-key
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        // Traduire les éléments qui doivent recevoir du HTML (listes, badges...)
        document.querySelectorAll('[data-key-html]').forEach(element => {
            const key = element.getAttribute('data-key-html');
            if (translations[key]) {
                element.innerHTML = translations[key];
            }
        });

        // Traduire les attributs alt (images)
        document.querySelectorAll('[data-key-alt]').forEach(element => {
            const key = element.getAttribute('data-key-alt');
            if (translations[key]) {
                element.setAttribute('alt', translations[key]);
            }
        });

        // Traduire les attributs title
        document.querySelectorAll('[data-key-title]').forEach(element => {
            const key = element.getAttribute('data-key-title');
            if (translations[key]) {
                element.setAttribute('title', translations[key]);
            }
        });

        // Traduire les attributs aria-label
        document.querySelectorAll('[data-key-aria]').forEach(element => {
            const key = element.getAttribute('data-key-aria');
            if (translations[key]) {
                element.setAttribute('aria-label', translations[key]);
            }
        });

        // Traduire les valeurs (par ex. boutons de type input)
        document.querySelectorAll('[data-key-value]').forEach(element => {
            const key = element.getAttribute('data-key-value');
            if (translations[key]) {
                element.value = translations[key];
            }
        });

        // Traduire les attributs placeholder et title
        document.querySelectorAll('[data-key-placeholder]').forEach(element => {
            const key = element.getAttribute('data-key-placeholder');
            if (translations[key]) {
                element.setAttribute('placeholder', translations[key]);
            }
        });

        // Mettre à jour le title de la page si fourni
        if (translations.site_title) {
            document.title = translations.site_title;
        }
    }

    setDocumentDirection() {
        // Changer la direction du document pour l'arabe
        if (this.currentLang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.lang-btn').forEach(button => {
            // Use the button element directly (not e.target) because the click target
            // can be the inner <img> and then e.target.getAttribute('data-lang') === null
            button.addEventListener('click', async (e) => {
                const lang = button.getAttribute('data-lang') || e.currentTarget.getAttribute('data-lang');
                if (!lang) return;
                await this.loadLanguage(lang);
                this.setActiveButton();
            });
        });
    }

    setActiveButton() {
        document.querySelectorAll('.lang-btn').forEach(button => {
            if (button.getAttribute('data-lang') === this.currentLang) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
}

// Initialiser le sélecteur de langue quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new LanguageSwitcher();
});