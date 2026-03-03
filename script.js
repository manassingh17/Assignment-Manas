document.addEventListener('DOMContentLoaded', () => {
    // ───── IMAGE CAROUSEL ─────
    const mainImg = document.getElementById('main-display-image');
    const thumbs = document.querySelectorAll('.thumb');
    const heroSection = document.querySelector('.hero-section');
    const nav = document.querySelector('nav');

    // ───── SMART STICKY HEADER ─────
    let lastScrollY = window.scrollY;
    let heroHeight = heroSection ? heroSection.offsetHeight + heroSection.offsetTop : 800;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > heroHeight) {
            nav.classList.add('sticky-active');
            nav.classList.add('visible');
        } else {
            // Not beyond first fold
            nav.classList.remove('sticky-active');
            nav.classList.remove('visible');
        }

        lastScrollY = currentScrollY;
    });

    thumbs.forEach((thumb, index) => {
        const img = thumb.querySelector('img');
        thumb.addEventListener('click', () => {
            updateMainImage(img.src, thumb);
        });
    });

    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');

    const updateMainImage = (src, thumb) => {
        const newSrc = src.replace('w=200&q=80', 'w=1200&q=100');
        mainImg.style.opacity = '0';
        setTimeout(() => {
            mainImg.src = newSrc;
            mainImg.style.opacity = '1';
            thumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');

            // Re-init zoom after image change
            if (typeof initZoom === 'function') initZoom();
        }, 300);
    };

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            let currentIndex = [...thumbs].findIndex(t => t.classList.contains('active'));
            let newIndex = (currentIndex - 1 + thumbs.length) % thumbs.length;
            const newImg = thumbs[newIndex].querySelector('img');
            updateMainImage(newImg.src, thumbs[newIndex]);
        });

        nextBtn.addEventListener('click', () => {
            let currentIndex = [...thumbs].findIndex(t => t.classList.contains('active'));
            let newIndex = (currentIndex + 1) % thumbs.length;
            const newImg = thumbs[newIndex].querySelector('img');
            updateMainImage(newImg.src, thumbs[newIndex]);
        });
    }

    // ───── IMAGE ZOOM ─────
    let lens, result, cx, cy;
    let zoomInitialized = false;

    function initZoom() {
        const img = document.getElementById("main-display-image");
        result = document.getElementById("zoom-result");
        lens = document.getElementById("zoom-lens");

        if (!img || !result || !lens) return;

        // Reset background for every call (image switch)
        result.style.backgroundImage = `url('${img.src}')`;

        const updateZoomDimensions = () => {
            // Temporarily show to get dimensions if they are 0 (due to display:none)
            const oldLensDisplay = lens.style.display;
            const oldResultDisplay = result.style.display;

            lens.style.display = "block";
            result.style.display = "block";

            cx = result.offsetWidth / lens.offsetWidth;
            cy = result.offsetHeight / lens.offsetHeight;

            lens.style.display = oldLensDisplay;
            result.style.display = oldResultDisplay;

            if (img.width > 0) {
                result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
            }
        };

        if (img.complete) {
            updateZoomDimensions();
        } else {
            img.onload = updateZoomDimensions;
        }

        const moveLens = (e) => {
            if (!cx || isNaN(cx)) updateZoomDimensions();

            const pos = getCursorPos(e, img);
            let x = pos.x - (lens.offsetWidth / 2);
            let y = pos.y - (lens.offsetHeight / 2);

            if (x > img.width - lens.offsetWidth) x = img.width - lens.offsetWidth;
            if (x < 0) x = 0;
            if (y > img.height - lens.offsetHeight) y = img.height - lens.offsetHeight;
            if (y < 0) y = 0;

            lens.style.left = x + "px";
            lens.style.top = y + "px";
            result.style.backgroundPosition = "-" + (x * cx) + "px -" + (y * cy) + "px";
        };

        if (!zoomInitialized) {
            img.addEventListener("mousemove", moveLens);
            lens.addEventListener("mousemove", moveLens);

            img.addEventListener("mouseenter", () => {
                updateZoomDimensions();
                lens.style.display = "block";
                result.style.display = "block";
            });

            img.addEventListener("mouseleave", () => {
                lens.style.display = "none";
                result.style.display = "none";
            });
            zoomInitialized = true;
        }
    }

    function getCursorPos(e, img) {
        const rect = img.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        return { x: x, y: y };
    }

    // Initial Zoom Call
    initZoom();

    // ───── FAQ INTERACTION ─────
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close others
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const icon = otherItem.querySelector('.toggle-svg path');
                    if (icon) icon.setAttribute('d', 'M6 9L12 15L18 9'); // Down arrow
                });

                if (!isActive) {
                    item.classList.add('active');
                    const icon = item.querySelector('.toggle-svg path');
                    if (icon) icon.setAttribute('d', 'M18 15L12 9L6 15'); // Up arrow
                }
            });
        }
    });

    // ───── MANUFACTURING IMAGE CAROUSEL ─────
    const mfgImg = document.getElementById('mfg-display-img');
    const mfgImgPrev = document.getElementById('mfg-img-prev');
    const mfgImgNext = document.getElementById('mfg-img-next');

    if (mfgImg && mfgImgPrev && mfgImgNext) {
        const mfgImages = [
            'assets/hero-product.png',
            'assets/industry-1.svg',
            'assets/industry-2.svg',
            'assets/industry-3.svg',
            'assets/industry-4.svg',
            'assets/industry-5.svg'
        ];
        let mfgIndex = 0;

        const updateMfgImage = (index) => {
            mfgIndex = (index + mfgImages.length) % mfgImages.length;
            mfgImg.style.opacity = '0';
            setTimeout(() => {
                mfgImg.src = mfgImages[mfgIndex];
                mfgImg.style.opacity = '1';
            }, 200);
        };

        mfgImg.style.transition = 'opacity 0.2s ease';
        mfgImgPrev.addEventListener('click', () => updateMfgImage(mfgIndex - 1));
        mfgImgNext.addEventListener('click', () => updateMfgImage(mfgIndex + 1));
    }

    // ───── APPLICATIONS CAROUSEL NAv ─────
    const appSlider = document.getElementById('apps-slider');
    const appPrev = document.getElementById('app-prev');
    const appNext = document.getElementById('app-next');

    if (appSlider && appPrev && appNext) {
        let cards = Array.from(appSlider.querySelectorAll('.app-card'));

        // Clone cards for infinite loop if not already cloned
        if (appSlider.querySelectorAll('.app-card').length === cards.length) {
            cards.forEach(card => {
                const cloneStart = card.cloneNode(true);
                const cloneEnd = card.cloneNode(true);
                appSlider.appendChild(cloneEnd);
                appSlider.prepend(cloneStart);
            });
        }

        const getCardWidth = () => {
            const firstCard = appSlider.querySelector('.app-card');
            return firstCard ? firstCard.offsetWidth + 24 : 324; // width + gap
        };

        // Reset scroll position on load and resize
        const resetScroll = () => {
            const cardWidth = getCardWidth();
            appSlider.scrollLeft = cardWidth * cards.length;
        };

        window.addEventListener('resize', resetScroll);
        resetScroll();

        appNext.addEventListener('click', () => {
            appSlider.scrollBy({
                left: getCardWidth(),
                behavior: 'smooth'
            });
        });

        appPrev.addEventListener('click', () => {
            appSlider.scrollBy({
                left: -getCardWidth(),
                behavior: 'smooth'
            });
        });

        // Auto-scroll logic
        let autoScrollInterval;
        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                appSlider.scrollBy({
                    left: getCardWidth(),
                    behavior: 'smooth'
                });
            }, 5000);
        };

        const stopAutoScroll = () => clearInterval(autoScrollInterval);

        const wrapper = appSlider.parentElement;
        if (wrapper) {
            wrapper.addEventListener('mouseenter', stopAutoScroll);
            wrapper.addEventListener('mouseleave', startAutoScroll);
        }

        startAutoScroll();

        let isJumping = false;
        appSlider.addEventListener('scroll', () => {
            if (isJumping) return;
            const scrollLeft = appSlider.scrollLeft;
            const cardWidth = getCardWidth();
            const totalWidth = cardWidth * cards.length;

            if (scrollLeft <= 0) {
                isJumping = true;
                appSlider.style.scrollBehavior = 'auto';
                appSlider.scrollLeft = totalWidth;
                appSlider.style.scrollBehavior = 'smooth';
                setTimeout(() => isJumping = false, 50);
            } else if (scrollLeft >= totalWidth * 2) {
                isJumping = true;
                appSlider.style.scrollBehavior = 'auto';
                appSlider.scrollLeft = totalWidth;
                appSlider.style.scrollBehavior = 'smooth';
                setTimeout(() => isJumping = false, 50);
            }
        });
    }

    // ───── TESTIMONIALS CAROUSEL NAv ─────
    const testiGrid = document.querySelector('.testi-grid');
    const testiPrev = document.getElementById('testi-prev');
    const testiNext = document.getElementById('testi-next');

    if (testiGrid && testiPrev && testiNext) {
        let cards = Array.from(testiGrid.querySelectorAll('.testi-card'));

        // Clone cards for infinite loop if not already cloned
        if (testiGrid.querySelectorAll('.testi-card').length === cards.length) {
            cards.forEach(card => {
                const cloneStart = card.cloneNode(true);
                const cloneEnd = card.cloneNode(true);
                testiGrid.appendChild(cloneEnd);
                testiGrid.prepend(cloneStart);
            });
        }

        const getCardWidth = () => {
            const firstCard = testiGrid.querySelector('.testi-card');
            return firstCard ? firstCard.offsetWidth + 24 : 424;
        };

        const resetScroll = () => {
            const cardWidth = getCardWidth();
            testiGrid.scrollLeft = cardWidth * cards.length;
        };

        window.addEventListener('resize', resetScroll);
        resetScroll();

        testiNext.addEventListener('click', () => {
            testiGrid.scrollBy({
                left: getCardWidth(),
                behavior: 'smooth'
            });
        });

        testiPrev.addEventListener('click', () => {
            testiGrid.scrollBy({
                left: -getCardWidth(),
                behavior: 'smooth'
            });
        });

        let isJumping = false;
        testiGrid.addEventListener('scroll', () => {
            if (isJumping) return;
            const scrollLeft = testiGrid.scrollLeft;
            const cardWidth = getCardWidth();
            const totalWidth = cardWidth * cards.length;

            if (scrollLeft <= 0) {
                isJumping = true;
                testiGrid.style.scrollBehavior = 'auto';
                testiGrid.scrollLeft = totalWidth;
                testiGrid.style.scrollBehavior = 'smooth';
                setTimeout(() => isJumping = false, 50);
            } else if (scrollLeft >= totalWidth * 2) {
                isJumping = true;
                testiGrid.style.scrollBehavior = 'auto';
                testiGrid.scrollLeft = totalWidth;
                testiGrid.style.scrollBehavior = 'smooth';
                setTimeout(() => isJumping = false, 50);
            }
        });
    }

    // ───── BROCHURE MODAL ─────
    const brochureModal = document.getElementById('brochureModal');
    const downloadBtn = document.getElementById('downloadDatasheet');
    const closeBtn = document.getElementById('closeModal');
    const brochureForm = document.getElementById('brochureForm');

    if (brochureModal && downloadBtn && closeBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            brochureModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeModalFunc = () => {
            brochureModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeBtn.addEventListener('click', closeModalFunc);

        brochureModal.addEventListener('click', (e) => {
            if (e.target === brochureModal) {
                closeModalFunc();
            }
        });

        if (brochureForm) {
            brochureForm.addEventListener('submit', (e) => {
                e.preventDefault();
                closeModalFunc();
                brochureForm.reset();
            });
        }
    }

    // ───── CALL-BACK MODAL ─────
    const callbackModal = document.getElementById('callbackModal');
    const callbackTriggers = document.querySelectorAll('.trigger-callback');
    const closeCallbackBtn = document.getElementById('closeCallbackModal');
    const callbackForm = document.getElementById('callbackForm');

    if (callbackModal && closeCallbackBtn) {
        callbackTriggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                callbackModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeCallbackFunc = () => {
            callbackModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeCallbackBtn.addEventListener('click', closeCallbackFunc);

        callbackModal.addEventListener('click', (e) => {
            if (e.target === callbackModal) {
                closeCallbackFunc();
            }
        });

        if (callbackForm) {
            callbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                closeCallbackFunc();
                callbackForm.reset();
            });
        }
    }
});
