/* Scoped carousel script — works only inside .hero-image .main-container to avoid global collisions */
(function () {
    const root = document.querySelector('.hero-image .main-container');
    if (!root) return;

    const teamMembers = [
        { name: "Luffy", role: "Founder" },
        { name: "Monkey D. Luffy", role: "Creative Director" },
        { name: "Luffy chan", role: "Lead Developer" },
        { name: "Lucy", role: "UX Designer" },
        { name: "Luffy kun", role: "Marketing Manager" },
        { name: "Monkey chan", role: "Product Manager" }
    ];

    const cards = root.querySelectorAll('.card');
    const dots = root.querySelectorAll('.dot');
    const memberName = root.querySelector('.member-name');
    const memberRole = root.querySelector('.member-role');
    const upArrows = root.querySelectorAll('.nav-arrow.up');
    const downArrows = root.querySelectorAll('.nav-arrow.down');
    let currentIndex = 0;
    let isAnimating = false;

    function updateCarousel(newIndex) {
        console.log('[carousel] updateCarousel called ->', newIndex);
        if (isAnimating) return;
        isAnimating = true;

        currentIndex = (newIndex + cards.length) % cards.length;

        cards.forEach((card, i) => {
            const offset = (i - currentIndex + cards.length) % cards.length;

            card.classList.remove('center', 'up-1', 'up-2', 'down-1', 'down-2', 'hidden');

            if (offset === 0) {
                card.classList.add('center');
            } else if (offset === 1) {
                card.classList.add('down-1');
            } else if (offset === 2) {
                card.classList.add('down-2');
            } else if (offset === cards.length - 1) {
                card.classList.add('up-1');
            } else if (offset === cards.length - 2) {
                card.classList.add('up-2');
            } else {
                card.classList.add('hidden');
            }
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });

        if (memberName) memberName.style.opacity = '0';
        if (memberRole) memberRole.style.opacity = '0';

        setTimeout(() => {
            if (memberName) memberName.textContent = teamMembers[currentIndex].name;
            if (memberRole) memberRole.textContent = teamMembers[currentIndex].role;
            if (memberName) memberName.style.opacity = '1';
            if (memberRole) memberRole.style.opacity = '1';
        }, 300);

        setTimeout(() => {
            isAnimating = false;
        }, 800);
    }

    upArrows.forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            console.log('[carousel] up arrow clicked');
            e.stopPropagation();
            updateCarousel(currentIndex - 1);
        });
    });

    downArrows.forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            console.log('[carousel] down arrow clicked');
            e.stopPropagation();
            updateCarousel(currentIndex + 1);
        });
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => {
            console.log('[carousel] dot clicked', i);
            e.stopPropagation();
            updateCarousel(i);
        });
    });

    cards.forEach((card, i) => {
        card.addEventListener('click', (e) => {
            console.log('[carousel] card direct click', i);
            e.stopPropagation();
            updateCarousel(i);
        });
    });

    // Add a delegated click handler on root to ensure clicks bubble through
    // even if some elements are repositioned/overlaid by CSS on small screens.
    root.addEventListener('click', (e) => {
        console.log('[carousel] delegated click on root ->', e.target && e.target.className);
        const arrowUp = e.target.closest('.nav-arrow.up');
        if (arrowUp) {
            e.preventDefault();
            updateCarousel(currentIndex - 1);
            return;
        }

        const arrowDown = e.target.closest('.nav-arrow.down');
        if (arrowDown) {
            e.preventDefault();
            updateCarousel(currentIndex + 1);
            return;
        }

        const dot = e.target.closest('.dot');
        if (dot && dot.dataset && typeof dot.dataset.index !== 'undefined') {
            const idx = parseInt(dot.dataset.index, 10);
            if (!isNaN(idx)) updateCarousel(idx);
            return;
        }

        const clickedCard = e.target.closest('.card');
        if (clickedCard && clickedCard.dataset && typeof clickedCard.dataset.index !== 'undefined') {
            const idx = parseInt(clickedCard.dataset.index, 10);
            console.log('[carousel] delegated card click ->', idx);
            if (!isNaN(idx)) updateCarousel(idx);
            return;
        }

        // Fallback: sometimes the event target is the track even when a card is visually under the pointer
        // Try to compute which card (if any) is under the click point and use it.
        const track = e.target.closest('.carousel-track');
        if (track) {
            const x = e.clientX;
            const y = e.clientY;
            // try elementFromPoint first
            let elUnder = document.elementFromPoint(x, y);
            let cardUnder = elUnder && elUnder.closest ? elUnder.closest('.card') : null;
            if (!cardUnder) {
                // fallback: check bounding rects of cards
                for (let i = 0; i < cards.length; i++) {
                    const rect = cards[i].getBoundingClientRect();
                    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                        cardUnder = cards[i];
                        break;
                    }
                }
            }

            if (cardUnder && cardUnder.dataset && typeof cardUnder.dataset.index !== 'undefined') {
                const idx = parseInt(cardUnder.dataset.index, 10);
                console.log('[carousel] fallback card detection ->', idx, 'elUnder=', elUnder && elUnder.className);
                if (!isNaN(idx)) updateCarousel(idx);
                return;
            }
        }
    });

    // Keyboard navigation — global but acts only if carousel exists
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            updateCarousel(currentIndex - 1);
        } else if (e.key === 'ArrowDown') {
            updateCarousel(currentIndex + 1);
        }
    });

    let touchStartY = 0;
    let touchEndY = 0;

    root.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    root.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                updateCarousel(currentIndex + 1);
            } else {
                updateCarousel(currentIndex - 1);
            }
        }
    }

    // Scroll indicator inside the hero to avoid adding global fixed element
    function createScrollIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.innerHTML = 'scroll';
        root.appendChild(indicator);
        // remove after animation to keep DOM clean
        setTimeout(() => indicator.remove(), 6000);
    }

    createScrollIndicator();

    updateCarousel(0);

})();
