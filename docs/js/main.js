/**
 * Main Application Controller
 */

class App {
    constructor() {
        this.dataLoader = null;
        this.labRenderer = null;
        this.aiAssistant = null;
        this.isLoading = true;
        this.currentTheme = 'dark';
        
        this.initialize();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize core components
            this.dataLoader = new DataLoader();
            this.labRenderer = new LabRenderer(this.dataLoader);
            this.aiAssistant = new AIAssistant();
            
            // Make components globally available
            window.dataLoader = this.dataLoader;
            window.labRenderer = this.labRenderer;
            window.aiAssistant = this.aiAssistant;
            
            // Load lab data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load user preferences
            this.loadUserPreferences();
            
            // Hide loading screen and show app
            this.hideLoadingScreen();
            
            console.log('App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    /**
     * Load lab data
     */
    async loadData() {
        const labs = await this.dataLoader.initialize();
        this.dataLoader.loadProgress();
        
        // Render lab list
        this.labRenderer.renderLabList(labs);
        
        // Update stats
        this.updateStats(labs);
        
        // Setup search
        this.setupSearch(labs);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Help button
        const helpButton = document.querySelector('.help-button');
        if (helpButton) {
            helpButton.addEventListener('click', () => this.showHelp());
        }

        // Start journey button
        const startButton = document.getElementById('start-journey');
        if (startButton) {
            startButton.addEventListener('click', () => this.startJourney());
        }

        // Explore labs button
        const exploreButton = document.getElementById('explore-labs');
        if (exploreButton) {
            exploreButton.addEventListener('click', () => this.showLabExplorer());
        }

        // Global search
        const globalSearch = document.querySelector('.global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Before unload (save progress)
        window.addEventListener('beforeunload', () => this.saveUserPreferences());
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (app) app.style.display = 'none';
        
        // Animate loading progress
        this.animateLoadingProgress();
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    if (app) {
                        app.style.display = 'block';
                        app.style.opacity = '0';
                        requestAnimationFrame(() => {
                            app.style.transition = 'opacity 0.5s ease';
                            app.style.opacity = '1';
                        });
                    }
                }, 300);
            }
        }, 1000);
    }

    /**
     * Animate loading progress
     */
    animateLoadingProgress() {
        const progressBar = document.querySelector('.progress-bar');
        if (!progressBar) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            progressBar.style.width = `${progress}%`;
        }, 200);
    }

    /**
     * Toggle theme between light and dark
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
        
        this.saveUserPreferences();
    }

    /**
     * Show help modal
     */
    showHelp() {
        // For now, toggle AI assistant
        this.aiAssistant.toggleChat();
    }

    /**
     * Start the learning journey (first lab)
     */
    startJourney() {
        const firstLab = this.dataLoader.labs[0];
        if (firstLab) {
            this.labRenderer.loadLab(firstLab.id);
        }
    }

    /**
     * Show lab explorer (for now, just scroll to sidebar)
     */
    showLabExplorer() {
        const sidebar = document.querySelector('.app-sidebar');
        if (sidebar) {
            sidebar.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Update application stats
     */
    updateStats(labs) {
        const totalLabsEl = document.getElementById('total-labs');
        if (totalLabsEl) {
            totalLabsEl.textContent = labs.length;
        }

        // Update progress ring
        const stats = this.dataLoader.getProgressStats();
        const progressRing = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressRing) {
            progressRing.style.setProperty('--progress', stats.completionPercentage);
        }
        
        if (progressText) {
            progressText.textContent = `${stats.completionPercentage}%`;
        }
    }

    /**
     * Setup search functionality
     */
    setupSearch(labs) {
        let searchTimeout;
        
        const handleSearchInput = (query) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(query, labs);
            }, 300);
        };

        this.handleSearch = handleSearchInput;
    }

    /**
     * Perform search
     */
    performSearch(query, labs) {
        if (!query.trim()) {
            this.labRenderer.renderLabList(labs);
            return;
        }

        const results = this.dataLoader.searchLabs(query);
        this.labRenderer.renderLabList(results);
        
        // Show search results count (optional)
        console.log(`Found ${results.length} labs matching "${query}"`);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.global-search input');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            if (this.aiAssistant.isOpen) {
                this.aiAssistant.closeChat();
            }
        }

        // Ctrl/Cmd + / for help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.showHelp();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Add responsive behavior if needed
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile view adjustments
            this.handleMobileView();
        } else {
            // Desktop view
            this.handleDesktopView();
        }
    }

    /**
     * Handle mobile view
     */
    handleMobileView() {
        // Hide sidebar on mobile when content is shown
        const labContent = document.getElementById('lab-content');
        const sidebar = document.querySelector('.app-sidebar');
        
        if (labContent && labContent.style.display !== 'none' && sidebar) {
            // Could implement a mobile sidebar toggle here
        }
    }

    /**
     * Handle desktop view
     */
    handleDesktopView() {
        // Ensure sidebar is visible on desktop
        const sidebar = document.querySelector('.app-sidebar');
        if (sidebar) {
            sidebar.style.display = 'block';
        }
    }

    /**
     * Save user preferences
     */
    saveUserPreferences() {
        const preferences = {
            theme: this.currentTheme,
            lastVisited: Date.now()
        };
        
        try {
            localStorage.setItem('copilot-labs-preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    /**
     * Load user preferences
     */
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('copilot-labs-preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                
                if (preferences.theme) {
                    this.currentTheme = preferences.theme;
                    document.documentElement.setAttribute('data-theme', this.currentTheme);
                    
                    const themeIcon = document.querySelector('.theme-icon');
                    if (themeIcon) {
                        themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load preferences:', error);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        // Create error notification
        const errorEl = document.createElement('div');
        errorEl.className = 'error-notification';
        errorEl.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close">×</button>
            </div>
        `;
        
        document.body.appendChild(errorEl);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.remove();
            }
        }, 5000);
        
        // Manual close
        errorEl.querySelector('.error-close').addEventListener('click', () => {
            errorEl.remove();
        });
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const successEl = document.createElement('div');
        successEl.className = 'success-notification';
        successEl.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(successEl);
        
        setTimeout(() => {
            if (successEl.parentNode) {
                successEl.remove();
            }
        }, 3000);
    }

    /**
     * Initialize particles effect (optional)
     */
    initializeParticles() {
        const particleContainer = document.querySelector('.particle-container');
        if (!particleContainer) return;

        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            
            particleContainer.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 5000);
        };

        // Create particles periodically
        setInterval(createParticle, 2000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Handle service worker registration (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}