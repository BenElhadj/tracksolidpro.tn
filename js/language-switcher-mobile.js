// Mobile language switcher behaviour: show only the active flag, toggle open to reveal others
(function(){
    const root = document.documentElement;
    function init() {
        const switcher = document.querySelector('.language-switcher');
        if (!switcher) return;

        // Click on active button toggles expand/collapse
        switcher.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-btn');
            if (!btn) return;

            const isActive = btn.classList.contains('active');
            // If clicked active button: toggle open
            if (isActive) {
                switcher.classList.toggle('open');
                const expanded = switcher.classList.contains('open');
                switcher.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                return;
            }

            // If clicked another language: change active and collapse
            const prev = switcher.querySelector('.lang-btn.active');
            if (prev) prev.classList.remove('active');
            btn.classList.add('active');
            switcher.classList.remove('open');
            switcher.setAttribute('aria-expanded', 'false');

            // Optionally, trigger any existing language switching logic present in the project
            // For example if there is code that listens to data-lang attr on .lang-btn, dispatch a custom event
            const lang = btn.dataset.lang;
            if (lang) {
                const ev = new CustomEvent('language:changed', { detail: { lang } });
                document.dispatchEvent(ev);
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!switcher.classList.contains('open')) return;
            if (switcher.contains(e.target)) return;
            switcher.classList.remove('open');
            switcher.setAttribute('aria-expanded', 'false');
        });

        // Accessibility: close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && switcher.classList.contains('open')) {
                switcher.classList.remove('open');
                switcher.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
