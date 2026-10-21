/**
 * S. MUKESH - HIGH-TECH INTERACTIVE PORTFOLIO ENGINE
 * Features: Neural Canvas, 3D Tilt, Web Audio Synth, Dynamic Typewriter,
 * Scroll Reveal, Interactive Modals & Clipboard Dispatch.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Set Current Year in Footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ==========================================================================
       1. NEURAL PARTICLE CANVAS BACKGROUND
       ========================================================================== */
    const canvas = document.getElementById('neural-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const mouse = { x: null, y: null, radius: 150 };

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.radius = Math.random() * 2 + 1;
            this.baseColor = Math.random() > 0.5 ? '139, 92, 246' : '6, 182, 212';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse magnetism / repulsion
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= (dx / dist) * force * 3;
                    this.y -= (dy / dist) * force * 3;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.baseColor}, 0.8)`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(${this.baseColor}, 0.8)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.min(Math.floor((width * height) / 13000), 100);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();
    window.addEventListener('resize', initParticles);

    function connectParticles() {
        const maxDist = 120;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        connectParticles();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    /* ==========================================================================
       2. CUSTOM GLOW CURSOR & TRAIL
       ========================================================================== */
    const cursorGlow = document.getElementById('cursor-glow');
    const cursorDot = document.getElementById('cursor-dot');
    let glowX = 0, glowY = 0;
    let dotX = 0, dotY = 0;

    window.addEventListener('mousemove', (e) => {
        dotX = e.clientX;
        dotY = e.clientY;
    });

    function renderCursor() {
        glowX += (dotX - glowX) * 0.12;
        glowY += (dotY - glowY) * 0.12;

        if (cursorGlow) {
            cursorGlow.style.left = `${glowX}px`;
            cursorGlow.style.top = `${glowY}px`;
        }
        if (cursorDot) {
            cursorDot.style.left = `${dotX}px`;
            cursorDot.style.top = `${dotY}px`;
        }
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Cursor hover effects on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .tilt-card, .quick-pill, .tool-tag, .copy-trigger');
    hoverTargets.forEach((target) => {
        target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    /* ==========================================================================
       3. DYNAMIC TYPEWRITER EFFECT
       ========================================================================== */
    const typewriterEl = document.getElementById('typewriter');
    const phrases = [
        'AI & Machine Learning',
        'Algorithmic Problem Solving',
        'B.Tech CS @ Scaler School of Tech',
        'Impactful AgriTech Solutions',
        'Python & Java Architectures'
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let typeSpeed = 90;

    function handleTypewriter() {
        const current = phrases[phraseIdx];
        if (isDeleting) {
            typewriterEl.textContent = current.substring(0, charIdx - 1);
            charIdx--;
            typeSpeed = 45;
        } else {
            typewriterEl.textContent = current.substring(0, charIdx + 1);
            charIdx++;
            typeSpeed = 90;
        }

        if (!isDeleting && charIdx === current.length) {
            typeSpeed = 1800; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            typeSpeed = 400; // Pause before new word
        }

        setTimeout(handleTypewriter, typeSpeed);
    }
    if (typewriterEl) handleTypewriter();

    /* ==========================================================================
       4. 3D CARD TILT WITH DYNAMIC GLARE
       ========================================================================== */
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -7;
            const rotateY = ((x - centerX) / centerX) * 7;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
        });
    });

    /* ==========================================================================
       5. SCROLL REVEAL & COUNTERS
       ========================================================================== */
    const revealElements = document.querySelectorAll('[data-reveal]');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Stats counter trigger
    const counters = document.querySelectorAll('.counter');
    let counted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !counted) {
            counted = true;
            counters.forEach((counter) => {
                const target = +counter.getAttribute('data-target');
                let count = 0;
                const step = target / 40;
                const updateCount = () => {
                    count += step;
                    if (count < target) {
                        counter.textContent = Math.ceil(count);
                        setTimeout(updateCount, 30);
                    } else {
                        counter.textContent = target;
                    }
                };
                updateCount();
            });
        }
    }, { threshold: 0.5 });

    const bioMetrics = document.querySelector('.bio-metrics');
    if (bioMetrics) counterObserver.observe(bioMetrics);

    /* ==========================================================================
       6. NAVBAR SCROLL EFFECT & MOBILE MENU
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    /* ==========================================================================
       7. SCI-FI SOUND EFFECTS (WEB AUDIO API)
       ========================================================================== */
    let audioCtx = null;
    let soundEnabled = false;
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');

    function playBeep(freq = 600, type = 'sine', duration = 0.08) {
        if (!soundEnabled) return;
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.warn('Audio API unavailable', e);
        }
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            if (soundEnabled) {
                soundIcon.setAttribute('data-lucide', 'volume-2');
                soundToggle.style.color = 'var(--accent-cyan)';
                soundToggle.style.borderColor = 'var(--accent-cyan)';
                playBeep(880, 'sine', 0.1);
            } else {
                soundIcon.setAttribute('data-lucide', 'volume-x');
                soundToggle.style.color = '';
                soundToggle.style.borderColor = '';
            }
            if (window.lucide) window.lucide.createIcons();
        });
    }

    // Attach click beeps to interactive buttons
    document.querySelectorAll('.btn, .quick-pill, .tool-tag').forEach(el => {
        el.addEventListener('click', () => playBeep(750, 'triangle', 0.06));
    });

    /* ==========================================================================
       8. MODAL INTERACTION (FARMERS PLATFORM BLUEPRINT)
       ========================================================================== */
    const modal = document.getElementById('project-modal');
    const openDemoBtns = document.querySelectorAll('.open-demo-btn');
    const modalClose = document.getElementById('modal-close');
    const modalContactLink = document.querySelector('.modal-contact-link');

    openDemoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (modal) modal.classList.add('active');
            playBeep(900, 'sine', 0.12);
        });
    });

    if (modalClose && modal) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            playBeep(450, 'sine', 0.08);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        if (modalContactLink) {
            modalContactLink.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }

    /* ==========================================================================
       9. COPY TO CLIPBOARD DISPATCH
       ========================================================================== */
    const copyTriggers = document.querySelectorAll('.copy-trigger');
    const copyToast = document.getElementById('copy-toast');
    const copyToastMsg = document.getElementById('copy-toast-msg');
    let toastTimeout = null;

    function showToast(message) {
        if (!copyToast) return;
        if (copyToastMsg) copyToastMsg.textContent = message;
        copyToast.classList.add('show');
        playBeep(1020, 'sine', 0.1);

        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            copyToast.classList.remove('show');
        }, 3000);
    }

    copyTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const textToCopy = trigger.getAttribute('data-copy');
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast(`Copied to clipboard: ${textToCopy}`);
                }).catch(() => {
                    showToast(`Copied: ${textToCopy}`);
                });
            }
        });
    });

    /* ==========================================================================
       10. ANIMATED CONTACT FORM DISPATCH
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successToast = document.getElementById('form-success-toast');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('user-name').value.trim();
            const phone = document.getElementById('user-phone').value.trim();
            const message = document.getElementById('user-message').value.trim();

            if (!name || !phone || !message) {
                showToast('Please fill in all contact fields.');
                return;
            }

            // High-tech transmission simulation
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Encrypting & Transmitting...</span>`;
            playBeep(520, 'sine', 0.15);

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>Message Transmitted</span> <i data-lucide="check" class="btn-icon"></i>`;
                if (window.lucide) window.lucide.createIcons();

                if (successToast) {
                    successToast.classList.remove('hidden');
                }
                playBeep(1200, 'triangle', 0.2);
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = `<span>Transmit Message</span> <i data-lucide="send" class="btn-icon"></i>`;
                    if (window.lucide) window.lucide.createIcons();
                }, 4000);
            }, 1200);
        });
    }
});
