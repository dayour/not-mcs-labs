/**
 * Animation Controller for UI Navigation and Interactions
 */

class AnimationController {
    constructor() {
        this.activeAnimations = new Map();
        this.animationQueue = [];
        this.isAnimating = false;
        
        this.initialize();
    }

    /**
     * Initialize animation system
     */
    initialize() {
        this.setupIntersectionObserver();
        this.setupHoverEffects();
        this.setupClickEffects();
        this.initializeParallax();
    }

    /**
     * Setup intersection observer for scroll animations
     */
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateIntoView(entry.target);
                }
            });
        }, options);

        // Observe all animatable elements
        document.querySelectorAll('[data-animate]').forEach(el => {
            this.observer.observe(el);
        });
    }

    /**
     * Setup hover effects
     */
    setupHoverEffects() {
        // Interactive elements
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('interactive-scale')) {
                this.addHoverEffect(e.target, 'scale');
            } else if (e.target.classList.contains('interactive-glow')) {
                this.addHoverEffect(e.target, 'glow');
            } else if (e.target.classList.contains('cyber-card')) {
                this.addHoverEffect(e.target, 'cyber');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('interactive-scale') ||
                e.target.classList.contains('interactive-glow') ||
                e.target.classList.contains('cyber-card')) {
                this.removeHoverEffect(e.target);
            }
        });
    }

    /**
     * Setup click effects
     */
    setupClickEffects() {
        document.addEventListener('click', (e) => {
            // Add ripple effect to buttons
            if (e.target.tagName === 'FLUENT-BUTTON' || 
                e.target.classList.contains('btn') ||
                e.target.classList.contains('lab-item')) {
                this.createRippleEffect(e.target, e);
            }

            // Create click indicator for guided tours
            if (e.target.dataset.guidedClick) {
                this.showClickIndicator(e.target);
            }
        });
    }

    /**
     * Initialize parallax effects
     */
    initializeParallax() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => this.updateParallax());
        });
    }

    /**
     * Animate element into view
     */
    animateIntoView(element) {
        const animationType = element.dataset.animate;
        
        switch (animationType) {
            case 'fade-up':
                this.fadeUp(element);
                break;
            case 'fade-in':
                this.fadeIn(element);
                break;
            case 'slide-left':
                this.slideLeft(element);
                break;
            case 'slide-right':
                this.slideRight(element);
                break;
            case 'scale-in':
                this.scaleIn(element);
                break;
            case 'bounce-in':
                this.bounceIn(element);
                break;
            default:
                this.fadeIn(element);
        }
    }

    /**
     * Fade up animation
     */
    fadeUp(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    /**
     * Fade in animation
     */
    fadeIn(element) {
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.6s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    /**
     * Slide left animation
     */
    slideLeft(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(50px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    }

    /**
     * Slide right animation
     */
    slideRight(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-50px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        });
    }

    /**
     * Scale in animation
     */
    scaleIn(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });
    }

    /**
     * Bounce in animation
     */
    bounceIn(element) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.3)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });
    }

    /**
     * Add hover effect
     */
    addHoverEffect(element, type) {
        switch (type) {
            case 'scale':
                element.style.transform = 'scale(1.05)';
                element.style.transition = 'transform 0.2s ease';
                break;
            case 'glow':
                element.style.boxShadow = 'var(--shadow-glow)';
                element.style.transition = 'box-shadow 0.2s ease';
                break;
            case 'cyber':
                element.style.transform = 'translateY(-4px)';
                element.style.boxShadow = 'var(--shadow-xl), var(--shadow-glow)';
                element.style.borderColor = 'var(--accent-primary)';
                element.style.transition = 'all 0.3s ease';
                break;
        }
    }

    /**
     * Remove hover effect
     */
    removeHoverEffect(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
        element.style.borderColor = '';
    }

    /**
     * Create ripple effect
     */
    createRippleEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x - 10}px;
            top: ${y - 10}px;
            width: 20px;
            height: 20px;
            pointer-events: none;
        `;
        
        // Ensure element has relative positioning
        const originalPosition = element.style.position;
        if (!originalPosition || originalPosition === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 600);
    }

    /**
     * Show click indicator for guided tours
     */
    showClickIndicator(element) {
        const rect = element.getBoundingClientRect();
        const indicator = document.createElement('div');
        indicator.className = 'click-indicator';
        indicator.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2 - 10}px;
            top: ${rect.top + rect.height / 2 - 10}px;
            width: 20px;
            height: 20px;
            border: 2px solid var(--accent-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            animation: clickRipple 1s ease-out forwards;
        `;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 1000);
    }

    /**
     * Update parallax effects
     */
    updateParallax() {
        const scrollY = window.pageYOffset;
        
        document.querySelectorAll('[data-parallax]').forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    /**
     * Guided tour: highlight element
     */
    highlightElement(selector, options = {}) {
        const element = document.querySelector(selector);
        if (!element) return;

        const {
            message = 'Click here',
            position = 'top',
            duration = 3000,
            showArrow = true
        } = options;

        // Create highlight overlay
        const highlight = document.createElement('div');
        highlight.className = 'step-highlight';
        
        const rect = element.getBoundingClientRect();
        highlight.style.cssText = `
            position: fixed;
            left: ${rect.left - 10}px;
            top: ${rect.top - 10}px;
            width: ${rect.width + 20}px;
            height: ${rect.height + 20}px;
            z-index: 9999;
            pointer-events: none;
        `;
        
        document.body.appendChild(highlight);

        // Create tooltip
        if (message) {
            const tooltip = this.createTooltip(message, element, position);
            document.body.appendChild(tooltip);
            
            // Remove after duration
            setTimeout(() => {
                tooltip.remove();
            }, duration);
        }

        // Create arrow
        if (showArrow) {
            const arrow = this.createArrow(element, position);
            document.body.appendChild(arrow);
            
            setTimeout(() => {
                arrow.remove();
            }, duration);
        }

        // Remove highlight after duration
        setTimeout(() => {
            highlight.remove();
        }, duration);

        return highlight;
    }

    /**
     * Create tooltip
     */
    createTooltip(message, targetElement, position) {
        const tooltip = document.createElement('div');
        tooltip.className = `animated-tooltip ${position}`;
        tooltip.textContent = message;
        
        const rect = targetElement.getBoundingClientRect();
        let left, top;
        
        switch (position) {
            case 'top':
                left = rect.left + rect.width / 2;
                top = rect.top - 10;
                tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
                break;
            case 'bottom':
                left = rect.left + rect.width / 2;
                top = rect.bottom + 10;
                tooltip.style.transform = 'translateX(-50%)';
                break;
            case 'left':
                left = rect.left - 10;
                top = rect.top + rect.height / 2;
                tooltip.style.transform = 'translateX(-100%) translateY(-50%)';
                break;
            case 'right':
                left = rect.right + 10;
                top = rect.top + rect.height / 2;
                tooltip.style.transform = 'translateY(-50%)';
                break;
        }
        
        tooltip.style.cssText += `
            position: fixed;
            left: ${left}px;
            top: ${top}px;
            z-index: 10001;
        `;
        
        return tooltip;
    }

    /**
     * Create arrow pointing to element
     */
    createArrow(targetElement, position) {
        const arrow = document.createElement('div');
        arrow.className = 'nav-arrow';
        
        const rect = targetElement.getBoundingClientRect();
        let left, top, rotation;
        
        switch (position) {
            case 'top':
                left = rect.left + rect.width / 2;
                top = rect.top - 50;
                rotation = '180deg';
                arrow.textContent = '↓';
                break;
            case 'bottom':
                left = rect.left + rect.width / 2;
                top = rect.bottom + 20;
                rotation = '0deg';
                arrow.textContent = '↑';
                break;
            case 'left':
                left = rect.left - 50;
                top = rect.top + rect.height / 2;
                rotation = '90deg';
                arrow.textContent = '→';
                break;
            case 'right':
                left = rect.right + 20;
                top = rect.top + rect.height / 2;
                rotation = '270deg';
                arrow.textContent = '←';
                break;
        }
        
        arrow.style.cssText = `
            position: fixed;
            left: ${left}px;
            top: ${top}px;
            transform: translate(-50%, -50%) rotate(${rotation});
            z-index: 10000;
            pointer-events: none;
        `;
        
        return arrow;
    }

    /**
     * Animate step completion
     */
    animateStepCompletion(element) {
        // Create success checkmark
        const checkmark = document.createElement('div');
        checkmark.innerHTML = `
            <svg class="success-checkmark" viewBox="0 0 52 52">
                <circle class="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="success-checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
        `;
        
        const rect = element.getBoundingClientRect();
        checkmark.style.cssText = `
            position: fixed;
            left: ${rect.right - 30}px;
            top: ${rect.top}px;
            width: 30px;
            height: 30px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(checkmark);
        
        setTimeout(() => {
            checkmark.remove();
        }, 2000);
    }

    /**
     * Animate progress update
     */
    animateProgressUpdate(progressElement, newValue) {
        if (!progressElement) return;
        
        const currentValue = parseInt(progressElement.dataset.progress || '0');
        const targetValue = Math.max(0, Math.min(100, newValue));
        
        // Animate counter
        this.animateNumber(progressElement.querySelector('.progress-text'), currentValue, targetValue);
        
        // Animate progress bar/ring
        const progressBar = progressElement.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.setProperty('--progress', targetValue);
        }
        
        progressElement.dataset.progress = targetValue;
    }

    /**
     * Animate number counter
     */
    animateNumber(element, start, end, duration = 1000) {
        if (!element) return;
        
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = `${Math.round(current)}%`;
        }, 16);
    }

    /**
     * Create particle burst effect
     */
    createParticleBurst(x, y, color = 'var(--accent-primary)') {
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
            `;
            
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            document.body.appendChild(particle);
            
            // Animate particle
            let posX = x;
            let posY = y;
            let opacity = 1;
            
            const animateParticle = () => {
                posX += vx * 0.02;
                posY += vy * 0.02;
                opacity -= 0.02;
                
                particle.style.left = `${posX}px`;
                particle.style.top = `${posY}px`;
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animateParticle);
        }
    }

    /**
     * Cleanup animations
     */
    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
        }
        
        this.activeAnimations.clear();
        this.animationQueue = [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.animationController = new AnimationController();
    }
});

// Add CSS for ripple effect
const rippleCSS = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);