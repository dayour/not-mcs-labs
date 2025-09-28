/**
 * Lab Renderer - Interactive step-by-step lab content rendering
 */

class LabRenderer {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
        this.currentLab = null;
        this.currentStep = 0;
        this.animationQueue = [];
        this.isAnimating = false;
    }

    /**
     * Render lab list in the sidebar
     */
    renderLabList(labs) {
        const labList = document.getElementById('lab-list');
        if (!labList) return;

        labList.innerHTML = labs.map(lab => `
            <div class="lab-item ${lab.completed ? 'completed' : ''} ${lab.bookmarked ? 'bookmarked' : ''}" 
                 data-lab-id="${lab.id}">
                <div class="lab-title">${lab.title}</div>
                <div class="lab-meta">
                    <div class="lab-duration">
                        <span>⏱️</span>
                        ${lab.duration}
                    </div>
                    <div class="lab-status">
                        ${lab.completed ? '✅' : lab.progress > 0 ? `${lab.progress}%` : '⭕'}
                    </div>
                </div>
                ${lab.progress > 0 ? `
                    <div class="lab-progress-bar">
                        <div class="progress-fill" style="width: ${lab.progress}%"></div>
                    </div>
                ` : ''}
            </div>
        `).join('');

        // Add click handlers
        labList.querySelectorAll('.lab-item').forEach(item => {
            item.addEventListener('click', () => {
                const labId = item.dataset.labId;
                this.loadLab(labId);
            });
        });
    }

    /**
     * Load and display a specific lab
     */
    async loadLab(labId) {
        try {
            const lab = await this.dataLoader.getLab(labId);
            if (!lab) {
                console.error('Lab not found:', labId);
                return;
            }

            this.currentLab = lab;
            this.currentStep = 0;

            // Update UI states
            this.updateActiveLabInSidebar(labId);
            this.showLabContent();
            this.renderLabHeader(lab);
            this.renderLabNavigation();
            
            // Start with first use case
            if (lab.useCases && lab.useCases.length > 0) {
                this.renderUseCase(lab.useCases[0]);
            } else {
                this.renderMarkdownContent(lab.content);
            }

            // Update progress
            this.updateProgress();

        } catch (error) {
            console.error('Failed to load lab:', error);
            this.showError('Failed to load lab content');
        }
    }

    /**
     * Show lab content area
     */
    showLabContent() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const labContent = document.getElementById('lab-content');
        
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (labContent) labContent.style.display = 'block';
    }

    /**
     * Update active lab in sidebar
     */
    updateActiveLabInSidebar(labId) {
        document.querySelectorAll('.lab-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-lab-id="${labId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Render lab header
     */
    renderLabHeader(lab) {
        const breadcrumb = document.getElementById('lab-breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <span>Labs</span>
                <span>›</span>
                <span>${lab.title}</span>
            `;
        }
    }

    /**
     * Render lab navigation
     */
    renderLabNavigation() {
        const currentStepEl = document.querySelector('.current-step');
        const totalStepsEl = document.querySelector('.total-steps');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (!this.currentLab || !this.currentLab.useCases) return;

        const totalSteps = this.currentLab.useCases.reduce((total, useCase) => 
            total + (useCase.steps ? useCase.steps.length : 1), 0
        );

        if (currentStepEl) currentStepEl.textContent = this.currentStep + 1;
        if (totalStepsEl) totalStepsEl.textContent = totalSteps;

        // Update button states
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 0;
            prevBtn.onclick = () => this.previousStep();
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentStep >= totalSteps - 1;
            nextBtn.onclick = () => this.nextStep();
        }
    }

    /**
     * Render a use case
     */
    renderUseCase(useCase) {
        const display = document.getElementById('lab-display');
        if (!display) return;

        const content = `
            <div class="use-case-content">
                <div class="use-case-header">
                    <h2>${useCase.emoji} ${useCase.title}</h2>
                    <div class="use-case-meta">
                        <span class="use-case-number">Use Case #${useCase.number}</span>
                        ${useCase.completed ? '<span class="completion-badge">✅ Completed</span>' : ''}
                    </div>
                </div>
                
                ${useCase.steps && useCase.steps.length > 0 ? 
                    this.renderSteps(useCase.steps) : 
                    '<p>No steps available for this use case.</p>'
                }
            </div>
        `;

        display.innerHTML = content;
        this.attachStepHandlers();
    }

    /**
     * Render steps with interactive elements
     */
    renderSteps(steps) {
        return `
            <div class="steps-container">
                ${steps.map((step, index) => `
                    <div class="step-item ${step.completed ? 'completed' : ''}" 
                         data-step-index="${index}">
                        <div class="step-header">
                            <div class="step-number">${step.number}</div>
                            <div class="step-status">
                                ${step.completed ? '✅' : '⭕'}
                            </div>
                        </div>
                        <div class="step-content">
                            <div class="step-instruction">
                                ${this.processStepInstruction(step.instruction)}
                            </div>
                            
                            ${step.hasScreenshot && step.screenshot ? `
                                <div class="step-screenshot">
                                    <img src="../labs/${this.currentLab.id}/${step.screenshot}" 
                                         alt="Step ${step.number} screenshot"
                                         class="screenshot-image"
                                         loading="lazy">
                                    <div class="screenshot-overlay">
                                        <button class="zoom-btn" onclick="this.parentElement.parentElement.classList.toggle('zoomed')">
                                            🔍 Click to zoom
                                        </button>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="step-actions">
                                <button class="step-complete-btn ${step.completed ? 'completed' : ''}"
                                        onclick="window.labRenderer.toggleStepCompletion(${index})">
                                    ${step.completed ? '✅ Completed' : '✓ Mark Complete'}
                                </button>
                                
                                ${step.hasScreenshot ? `
                                    <button class="show-animation-btn" 
                                            onclick="window.labRenderer.showStepAnimation(${index})">
                                        ✨ Show Animation
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Process step instruction text to add interactive elements
     */
    processStepInstruction(instruction) {
        // Convert markdown-like syntax to HTML
        let processed = instruction
            .replace(/\*\*(.+?)\*\*/g, '<strong class="highlight-text">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code class="inline-code">$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>');

        // Add click indicators for UI elements
        processed = processed.replace(
            /\*\*(.+?)\*\*/g, 
            '<span class="clickable-element" data-element="$1">$1</span>'
        );

        return processed;
    }

    /**
     * Show step animation (hover and click indicators)
     */
    showStepAnimation(stepIndex) {
        const step = this.currentLab.useCases[0].steps[stepIndex];
        if (!step || this.isAnimating) return;

        this.isAnimating = true;
        
        // Find clickable elements in the instruction
        const clickableElements = document.querySelectorAll('.clickable-element');
        
        if (clickableElements.length > 0) {
            this.animateClickSequence(clickableElements);
        } else {
            // Generic animation for screenshot
            this.animateScreenshot(stepIndex);
        }
    }

    /**
     * Animate click sequence on UI elements
     */
    async animateClickSequence(elements) {
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            
            // Add hover indicator
            this.showHoverIndicator(element);
            await this.wait(1000);
            
            // Add click indicator
            this.showClickIndicator(element);
            await this.wait(500);
            
            // Remove indicators
            this.removeIndicators(element);
            await this.wait(300);
        }
        
        this.isAnimating = false;
    }

    /**
     * Animate screenshot with highlights
     */
    async animateScreenshot(stepIndex) {
        const screenshot = document.querySelector(`[data-step-index="${stepIndex}"] .screenshot-image`);
        if (!screenshot) {
            this.isAnimating = false;
            return;
        }

        // Add pulse animation
        screenshot.classList.add('pulse-neon');
        await this.wait(2000);
        screenshot.classList.remove('pulse-neon');
        
        this.isAnimating = false;
    }

    /**
     * Show hover indicator
     */
    showHoverIndicator(element) {
        const rect = element.getBoundingClientRect();
        const indicator = document.createElement('div');
        indicator.className = 'hover-indicator';
        indicator.style.left = `${rect.left - 5}px`;
        indicator.style.top = `${rect.top - 5}px`;
        indicator.style.width = `${rect.width + 10}px`;
        indicator.style.height = `${rect.height + 10}px`;
        
        document.body.appendChild(indicator);
        element.hoverIndicator = indicator;
    }

    /**
     * Show click indicator
     */
    showClickIndicator(element) {
        const rect = element.getBoundingClientRect();
        const indicator = document.createElement('div');
        indicator.className = 'click-indicator';
        indicator.style.left = `${rect.left + rect.width / 2 - 10}px`;
        indicator.style.top = `${rect.top + rect.height / 2 - 10}px`;
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 1000);
    }

    /**
     * Remove indicators
     */
    removeIndicators(element) {
        if (element.hoverIndicator) {
            element.hoverIndicator.remove();
            delete element.hoverIndicator;
        }
    }

    /**
     * Toggle step completion
     */
    toggleStepCompletion(stepIndex) {
        if (!this.currentLab || !this.currentLab.useCases[0].steps[stepIndex]) return;

        const step = this.currentLab.useCases[0].steps[stepIndex];
        step.completed = !step.completed;

        // Update UI
        const stepElement = document.querySelector(`[data-step-index="${stepIndex}"]`);
        if (stepElement) {
            stepElement.classList.toggle('completed', step.completed);
            
            const statusElement = stepElement.querySelector('.step-status');
            if (statusElement) {
                statusElement.textContent = step.completed ? '✅' : '⭕';
            }
            
            const completeBtn = stepElement.querySelector('.step-complete-btn');
            if (completeBtn) {
                completeBtn.textContent = step.completed ? '✅ Completed' : '✓ Mark Complete';
                completeBtn.classList.toggle('completed', step.completed);
            }
        }

        // Update progress
        this.updateProgress();
        
        // Show success animation
        if (step.completed) {
            this.showSuccessAnimation(stepElement);
        }
    }

    /**
     * Show success animation
     */
    showSuccessAnimation(element) {
        const success = document.createElement('div');
        success.innerHTML = `
            <svg class="success-checkmark" viewBox="0 0 52 52">
                <circle class="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="success-checkmark-check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
        `;
        success.style.position = 'fixed';
        success.style.top = '50%';
        success.style.left = '50%';
        success.style.transform = 'translate(-50%, -50%)';
        success.style.zIndex = '10000';
        success.style.pointerEvents = 'none';
        
        document.body.appendChild(success);
        
        setTimeout(() => success.remove(), 2000);
    }

    /**
     * Navigate to next step
     */
    nextStep() {
        if (!this.currentLab) return;
        
        const totalSteps = this.getTotalSteps();
        if (this.currentStep < totalSteps - 1) {
            this.currentStep++;
            this.renderCurrentStep();
            this.renderLabNavigation();
        }
    }

    /**
     * Navigate to previous step
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderCurrentStep();
            this.renderLabNavigation();
        }
    }

    /**
     * Render current step
     */
    renderCurrentStep() {
        // Implementation depends on how steps map to use cases
        // For now, render the first use case
        if (this.currentLab && this.currentLab.useCases.length > 0) {
            this.renderUseCase(this.currentLab.useCases[0]);
        }
    }

    /**
     * Get total steps count
     */
    getTotalSteps() {
        if (!this.currentLab || !this.currentLab.useCases) return 0;
        
        return this.currentLab.useCases.reduce((total, useCase) => 
            total + (useCase.steps ? useCase.steps.length : 1), 0
        );
    }

    /**
     * Update progress
     */
    updateProgress() {
        if (!this.currentLab) return;

        const totalSteps = this.getTotalSteps();
        const completedSteps = this.getCompletedSteps();
        const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

        // Update lab progress
        this.dataLoader.updateLabProgress(this.currentLab.id, progress);

        // Update progress ring
        const progressRing = document.querySelector('.progress-fill');
        if (progressRing) {
            progressRing.style.setProperty('--progress', progress);
        }

        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }

        // Update sidebar
        const labItem = document.querySelector(`[data-lab-id="${this.currentLab.id}"]`);
        if (labItem) {
            const statusEl = labItem.querySelector('.lab-status');
            if (statusEl) {
                statusEl.textContent = progress >= 100 ? '✅' : progress > 0 ? `${progress}%` : '⭕';
            }
            
            labItem.classList.toggle('completed', progress >= 100);
        }
    }

    /**
     * Get completed steps count
     */
    getCompletedSteps() {
        if (!this.currentLab || !this.currentLab.useCases) return 0;
        
        return this.currentLab.useCases.reduce((total, useCase) => {
            if (useCase.steps) {
                return total + useCase.steps.filter(step => step.completed).length;
            }
            return total;
        }, 0);
    }

    /**
     * Render markdown content as fallback
     */
    renderMarkdownContent(content) {
        const display = document.getElementById('lab-display');
        if (!display || !content) return;

        // Simple markdown to HTML conversion
        const html = content
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>');

        display.innerHTML = `<div class="markdown-content">${html}</div>`;
    }

    /**
     * Show error message
     */
    showError(message) {
        const display = document.getElementById('lab-display');
        if (display) {
            display.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <div class="error-text">${message}</div>
                    <button onclick="location.reload()" class="retry-btn">Retry</button>
                </div>
            `;
        }
    }

    /**
     * Attach event handlers to step elements
     */
    attachStepHandlers() {
        // Screenshot zoom functionality
        document.querySelectorAll('.screenshot-image').forEach(img => {
            img.addEventListener('click', (e) => {
                e.target.closest('.step-screenshot').classList.toggle('zoomed');
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.previousStep();
                    break;
                case 'ArrowRight':
                    this.nextStep();
                    break;
                case ' ':
                    e.preventDefault();
                    this.nextStep();
                    break;
            }
        });
    }

    /**
     * Utility function to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export as global
window.LabRenderer = LabRenderer;