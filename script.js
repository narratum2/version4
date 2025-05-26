/**
 * Narratum.io - Interactive Experience Script
 * Designed for performance, accessibility, and visual elegance
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loadingScreen = document.querySelector('.loading-screen');
    const progressFill = document.querySelector('.progress-fill');
    const sections = document.querySelectorAll('.section');
    const navDots = document.querySelectorAll('.nav-dot');
    const audioToggle = document.querySelector('.audio-toggle');
    const signalParticles = document.querySelector('.signal-particles');
    const capabilityBlocks = document.querySelectorAll('.capability-block');
    
    // State
    let currentSection = 0;
    let isScrolling = false;
    let audioContext = null;
    let audioSource = null;
    let audioAnalyser = null;
    let audioInitialized = false;
    let pageLoadTime = 0;
    
    // Initialize loading sequence
    initLoading();
    
    // Initialize particles
    createParticles();
    
    // Initialize intersection observers
    initObservers();
    
    // Initialize event listeners
    initEventListeners();
    
    /**
     * Loading sequence
     */
    function initLoading() {
        const startTime = performance.now();
        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                
                // Calculate actual page load time
                pageLoadTime = Math.round(performance.now() - startTime);
                
                // Complete loading after a minimum time
                setTimeout(() => {
                    loadingScreen.classList.add('fade-out');
                    document.body.classList.add('loaded');
                    
                    // Make first section visible
                    if (sections[0]) {
                        sections[0].classList.add('visible');
                    }
                    
                    // Send analytics if available
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'page_timing', {
                            event_category: 'performance',
                            event_label: 'load',
                            value: pageLoadTime
                        });
                    }
                }, 500);
            }
            
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
        }, 100);
    }
    
    /**
     * Create background particles
     */
    function createParticles() {
        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('signal-particle');
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const size = Math.random() * 2 + 1;
            const duration = Math.random() * 15 + 10;
            const delay = Math.random() * 5;
            
            particle.style.left = `${posX}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = Math.random() * 0.5;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            signalParticles.appendChild(particle);
        }
    }
    
    /**
     * Initialize intersection observers for animations
     */
    function initObservers() {
        // Section visibility observer
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Update navigation dots
                    const sectionIndex = Array.from(sections).indexOf(entry.target);
                    updateNavigation(sectionIndex);
                    
                    // Track section view in analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'section_view', {
                            event_category: 'engagement',
                            event_label: entry.target.id
                        });
                    }
                }
            });
        }, { threshold: 0.3 });
        
        // Apply observers to sections
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
        
        // Capability blocks observer
        const capabilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Stagger animation of capability blocks
                    const index = Array.from(capabilityBlocks).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.setAttribute('data-visible', 'true');
                    }, index * 150);
                }
            });
        }, { threshold: 0.2 });
        
        // Apply observers to capability blocks
        capabilityBlocks.forEach(block => {
            capabilityObserver.observe(block);
        });
    }
    
    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        // Navigation dot click
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (!isScrolling) {
                    scrollToSection(index);
                }
            });
        });
        
        // Audio toggle
        if (audioToggle) {
            audioToggle.addEventListener('click', toggleAudio);
        }
        
        // Form submission
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }
        
        // Dispatch card interaction
        const dispatchCard = document.querySelector('.dispatch-card');
        if (dispatchCard) {
            dispatchCard.addEventListener('click', () => {
                showNotification('Dispatch module coming soon', 'info');
            });
        }
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            const sections = document.querySelectorAll('.section');
            const currentSection = Array.from(sections).findIndex(section => {
                const rect = section.getBoundingClientRect();
                return rect.top <= 100 && rect.bottom > 100;
            });
            
            if (e.key === 'ArrowDown' && currentSection < sections.length - 1) {
                e.preventDefault();
                sections[currentSection + 1]?.scrollIntoView({ behavior: 'smooth' });
            } else if (e.key === 'ArrowUp' && currentSection > 0) {
                e.preventDefault();
                sections[currentSection - 1]?.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Handle visibility change (pause animations when tab is not visible)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause animations
                document.querySelectorAll('[class*="animate"]').forEach(el => {
                    el.style.animationPlayState = 'paused';
                });
            } else {
                // Resume animations
                document.querySelectorAll('[class*="animate"]').forEach(el => {
                    el.style.animationPlayState = 'running';
                });
            }
        });
    }
    
    /**
     * Scroll to specific section
     */
    function scrollToSection(index) {
        if (index >= 0 && index < sections.length) {
            isScrolling = true;
            currentSection = index;
            
            sections[index].scrollIntoView({ behavior: 'smooth' });
            
            // Update navigation after scroll completes
            setTimeout(() => {
                updateNavigation(index);
                isScrolling = false;
            }, 1000);
        }
    }
    
    /**
     * Update navigation dots
     */
    function updateNavigation(index) {
        navDots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    /**
     * Toggle ambient audio
     */
    function toggleAudio() {
        if (!audioInitialized) {
            initAudio();
        } else {
            if (audioContext.state === 'running') {
                audioContext.suspend();
                audioToggle.setAttribute('data-state', 'inactive');
            } else {
                audioContext.resume();
                audioToggle.setAttribute('data-state', 'active');
            }
        }
    }
    
    /**
     * Initialize ambient audio
     */
    function initAudio() {
        try {
            // Create audio context
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create oscillator for ambient sound
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const oscillator3 = audioContext.createOscillator();
            
            // Create gain nodes for volume control
            const gainNode1 = audioContext.createGain();
            const gainNode2 = audioContext.createGain();
            const gainNode3 = audioContext.createGain();
            
            // Set oscillator types and frequencies
            oscillator1.type = 'sine';
            oscillator1.frequency.value = 220; // A3
            
            oscillator2.type = 'sine';
            oscillator2.frequency.value = 329.63; // E4
            
            oscillator3.type = 'sine';
            oscillator3.frequency.value = 440; // A4
            
            // Set very low volume
            gainNode1.gain.value = 0.03;
            gainNode2.gain.value = 0.02;
            gainNode3.gain.value = 0.01;
            
            // Connect nodes
            oscillator1.connect(gainNode1);
            oscillator2.connect(gainNode2);
            oscillator3.connect(gainNode3);
            
            gainNode1.connect(audioContext.destination);
            gainNode2.connect(audioContext.destination);
            gainNode3.connect(audioContext.destination);
            
            // Start oscillators
            oscillator1.start();
            oscillator2.start();
            oscillator3.start();
            
            // Update UI
            audioToggle.setAttribute('data-state', 'active');
            audioInitialized = true;
            
            // Show notification
            showNotification('Ambient sound enabled', 'info');
            
        } catch (error) {
            console.error('Audio initialization failed:', error);
            showNotification('Could not initialize audio', 'error');
        }
    }
    
    /**
     * Handle form submission
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            organization: formData.get('organization'),
            message: formData.get('message'),
            timestamp: new Date().toISOString(),
            source: 'narratum.io'
        };
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;
        
        // Simulate API call (replace with actual API call in production)
        setTimeout(() => {
            // Reset form
            form.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Show success notification
            showNotification('Message sent successfully', 'success');
            
            // Track form submission in analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    event_category: 'engagement',
                    event_label: 'contact_form'
                });
            }
        }, 1500);
    }
    
    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add type-specific styling if needed
        if (type === 'error') {
            notification.style.borderColor = '#ef4444';
        } else if (type === 'success') {
            notification.style.borderColor = '#10b981';
        }
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Auto-remove after delay
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Error boundary for production
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
        // In production, send to error tracking service
    });
    
    // Service Worker registration (for PWA support)
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
        });
    }
});
