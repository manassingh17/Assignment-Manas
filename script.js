document.addEventListener('DOMContentLoaded', () => {

    /* ───── Sticky Header ─────
       Nav becomes fixed once the user scrolls past the hero section (first fold).
       Uses requestAnimationFrame to throttle scroll events for performance. */

    const heroSection = document.querySelector('.hero-section');
    const nav = document.querySelector('nav');
    const heroHeight = heroSection ? heroSection.offsetHeight + heroSection.offsetTop : 800;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;

        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            if (scrollY > heroHeight) {
                nav.classList.add('sticky-active', 'visible');
            } else {
                nav.classList.remove('sticky-active', 'visible');
            }
            ticking = false;
        });
    });

    /* ───── Image Carousel + Thumbnails ─────
       Clicking a thumbnail or arrow swaps the main product image with a fade transition.
       Zoom is re-initialized after each swap to recalculate dimensions. */

    const mainImg = document.getElementById('main-display-image');
    const thumbs = document.querySelectorAll('.thumb');
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');

    const updateMainImage = (src, thumb) => {
        mainImg.style.opacity = '0';
        setTimeout(() => {
            mainImg.src = src;
            mainImg.style.opacity = '1';
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            if (typeof initZoom === 'function') initZoom();
        }, 300);
    };

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            updateMainImage(thumb.querySelector('img').src, thumb);
        });
    });

    function navigateCarousel(direction) {
        const currentIndex = [...thumbs].findIndex(t => t.classList.contains('active'));
        const newIndex = (currentIndex + direction + thumbs.length) % thumbs.length;
        updateMainImage(thumbs[newIndex].querySelector('img').src, thumbs[newIndex]);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => navigateCarousel(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateCarousel(1));

    /* ───── Image Zoom ─────
       Hover-based lens zoom: a movable lens follows the cursor over the main image
       and renders a magnified region into the zoom-result container. */

    let zoomInitialized = false;

    function initZoom() {
        const img = document.getElementById('main-display-image');
        const result = document.getElementById('zoom-result');
        const lens = document.getElementById('zoom-lens');
        if (!img || !result || !lens) return;

        result.style.backgroundImage = `url('${img.src}')`;

        let cx, cy;

        const updateDimensions = () => {
            const prevLens = lens.style.display;
            const prevResult = result.style.display;
            lens.style.display = 'block';
            result.style.display = 'block';

            cx = result.offsetWidth / lens.offsetWidth;
            cy = result.offsetHeight / lens.offsetHeight;

            lens.style.display = prevLens;
            result.style.display = prevResult;

            if (img.width > 0) {
                result.style.backgroundSize = `${img.width * cx}px ${img.height * cy}px`;
            }
        };

        if (img.complete) updateDimensions();
        else img.onload = updateDimensions;

        const moveLens = (e) => {
            if (!cx || isNaN(cx)) updateDimensions();

            const rect = img.getBoundingClientRect();
            const posX = (e.clientX || (e.touches?.[0]?.clientX)) - rect.left;
            const posY = (e.clientY || (e.touches?.[0]?.clientY)) - rect.top;

            let x = Math.max(0, Math.min(posX - lens.offsetWidth / 2, img.width - lens.offsetWidth));
            let y = Math.max(0, Math.min(posY - lens.offsetHeight / 2, img.height - lens.offsetHeight));

            lens.style.left = x + 'px';
            lens.style.top = y + 'px';
            result.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
        };

        if (!zoomInitialized) {
            img.addEventListener('mousemove', moveLens);
            lens.addEventListener('mousemove', moveLens);

            img.addEventListener('mouseenter', () => {
                updateDimensions();
                lens.style.display = 'block';
                result.style.display = 'block';
            });

            img.addEventListener('mouseleave', () => {
                lens.style.display = 'none';
                result.style.display = 'none';
            });

            zoomInitialized = true;
        }
    }

    initZoom();

    /* ───── FAQ Accordion ─────
       Toggles open/close on click and updates aria-expanded for accessibility. */

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-question');
        if (!trigger) return;

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(other => {
                other.classList.remove('active');
                const btn = other.querySelector('.faq-question');
                if (btn) btn.setAttribute('aria-expanded', 'false');
                const icon = other.querySelector('.toggle-svg path');
                if (icon) icon.setAttribute('d', 'M6 9L12 15L18 9');
            });

            if (!isActive) {
                item.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
                const icon = item.querySelector('.toggle-svg path');
                if (icon) icon.setAttribute('d', 'M18 15L12 9L6 15');
            }
        });
    });

    /* ───── Manufacturing Image Carousel ───── */

    const mfgImg = document.getElementById('mfg-display-img');
    const mfgPrev = document.getElementById('mfg-img-prev');
    const mfgNext = document.getElementById('mfg-img-next');

    if (mfgImg && mfgPrev && mfgNext) {
        const mfgImages = [
            'assets/hero-product.png',
            'assets/industry-1.svg',
            'assets/industry-2.svg',
            'assets/industry-3.svg',
            'assets/industry-4.svg',
            'assets/industry-5.svg'
        ];
        let mfgIndex = 0;

        mfgImg.style.transition = 'opacity 0.2s ease';

        const showMfgImage = (dir) => {
            mfgIndex = (mfgIndex + dir + mfgImages.length) % mfgImages.length;
            mfgImg.style.opacity = '0';
            setTimeout(() => {
                mfgImg.src = mfgImages[mfgIndex];
                mfgImg.style.opacity = '1';
            }, 200);
        };

        mfgPrev.addEventListener('click', () => showMfgImage(-1));
        mfgNext.addEventListener('click', () => showMfgImage(1));
    }

    /* ───── Infinite Scroll Carousel (reusable) ─────
       Generic carousel that clones cards for seamless looping.
       Used by both the Applications and Testimonials sections. */

    function initInfiniteCarousel(container, prevBtn, nextBtn, cardSelector, opts = {}) {
        if (!container || !prevBtn || !nextBtn) return;

        const gap = opts.gap || 24;
        const autoScrollMs = opts.autoScroll || 0;
        const originalCards = Array.from(container.querySelectorAll(cardSelector));

        originalCards.forEach(card => {
            container.appendChild(card.cloneNode(true));
            container.prepend(card.cloneNode(true));
        });

        const getCardWidth = () => {
            const first = container.querySelector(cardSelector);
            return first ? first.offsetWidth + gap : 324;
        };

        const resetScroll = () => {
            container.scrollLeft = getCardWidth() * originalCards.length;
        };

        window.addEventListener('resize', resetScroll);
        resetScroll();

        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
        });

        let isJumping = false;
        container.addEventListener('scroll', () => {
            if (isJumping) return;
            const scrollLeft = container.scrollLeft;
            const cardWidth = getCardWidth();
            const totalWidth = cardWidth * originalCards.length;

            if (scrollLeft <= 0 || scrollLeft >= totalWidth * 2) {
                isJumping = true;
                container.style.scrollBehavior = 'auto';
                container.scrollLeft = totalWidth;
                container.style.scrollBehavior = 'smooth';
                setTimeout(() => { isJumping = false; }, 50);
            }
        });

        if (autoScrollMs > 0) {
            let interval;
            const start = () => {
                interval = setInterval(() => {
                    container.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
                }, autoScrollMs);
            };
            const stop = () => clearInterval(interval);

            const wrapper = container.parentElement;
            if (wrapper) {
                wrapper.addEventListener('mouseenter', stop);
                wrapper.addEventListener('mouseleave', start);
            }
            start();
        }
    }

    initInfiniteCarousel(
        document.getElementById('apps-slider'),
        document.getElementById('app-prev'),
        document.getElementById('app-next'),
        '.app-card',
        { autoScroll: 5000 }
    );

    initInfiniteCarousel(
        document.querySelector('.testi-grid'),
        document.getElementById('testi-prev'),
        document.getElementById('testi-next'),
        '.testi-card'
    );

    /* ───── Modal (reusable) ─────
       Handles open/close, backdrop click, Escape key, and optional form submit.
       Used for both the brochure download and callback request modals. */

    function initModal(modalEl, closeBtnEl, formEl, triggers) {
        if (!modalEl || !closeBtnEl) return;

        const open = () => {
            modalEl.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const close = () => {
            modalEl.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (triggers) {
            triggers.forEach(btn => btn.addEventListener('click', (e) => {
                e.preventDefault();
                open();
            }));
        }

        closeBtnEl.addEventListener('click', close);
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) close();
        });

        if (formEl) {
            formEl.addEventListener('submit', (e) => {
                e.preventDefault();
                close();
                formEl.reset();
            });
        }
    }

    initModal(
        document.getElementById('brochureModal'),
        document.getElementById('closeModal'),
        document.getElementById('brochureForm'),
        [document.getElementById('downloadDatasheet')].filter(Boolean)
    );

    initModal(
        document.getElementById('callbackModal'),
        document.getElementById('closeCallbackModal'),
        document.getElementById('callbackForm'),
        document.querySelectorAll('.trigger-callback')
    );

    /* Close any open modal on Escape */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });

});
