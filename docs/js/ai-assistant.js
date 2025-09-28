/**
 * AI Assistant - Floating chat window with Spark LLM integration
 */

class AIAssistant {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.currentContext = null;
        this.isTyping = false;
        
        // Mock Spark LLM configuration (replace with actual API)
        this.apiConfig = {
            endpoint: 'https://api.example.com/spark-llm', // Placeholder
            apiKey: 'your-api-key-here', // Placeholder
            model: 'spark-v1'
        };
        
        this.initialize();
    }

    /**
     * Initialize the AI assistant
     */
    initialize() {
        this.setupEventListeners();
        this.loadChatHistory();
        
        // Add welcome message
        if (this.messages.length === 0) {
            this.addMessage('assistant', this.getWelcomeMessage());
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const toggle = document.getElementById('assistant-toggle');
        const chatWindow = document.getElementById('assistant-chat');
        const closeBtn = document.querySelector('.close-btn');
        const minimizeBtn = document.querySelector('.minimize-btn');
        const sendBtn = document.getElementById('send-message');
        const chatInput = document.getElementById('chat-input');

        if (toggle) {
            toggle.addEventListener('click', () => this.toggleChat());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChat());
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.minimizeChat());
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            chatInput.addEventListener('input', () => {
                this.adjustTextareaHeight(chatInput);
            });
        }

        // Listen for context changes
        document.addEventListener('labChanged', (e) => {
            this.updateContext(e.detail);
        });

        document.addEventListener('stepChanged', (e) => {
            this.updateContext(e.detail);
        });
    }

    /**
     * Toggle chat window
     */
    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('assistant-chat');
        const toggle = document.getElementById('assistant-toggle');
        
        if (chatWindow) {
            chatWindow.style.display = this.isOpen ? 'flex' : 'none';
            
            if (this.isOpen) {
                chatWindow.classList.add('modal-enter');
                this.scrollToBottom();
                this.focusInput();
            }
        }
        
        if (toggle) {
            toggle.classList.toggle('active', this.isOpen);
        }
    }

    /**
     * Close chat window
     */
    closeChat() {
        this.isOpen = false;
        const chatWindow = document.getElementById('assistant-chat');
        
        if (chatWindow) {
            chatWindow.classList.add('modal-exit');
            setTimeout(() => {
                chatWindow.style.display = 'none';
                chatWindow.classList.remove('modal-exit');
            }, 300);
        }
        
        const toggle = document.getElementById('assistant-toggle');
        if (toggle) {
            toggle.classList.remove('active');
        }
    }

    /**
     * Minimize chat window
     */
    minimizeChat() {
        this.closeChat();
    }

    /**
     * Send user message
     */
    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput || !chatInput.value.trim()) return;

        const userMessage = chatInput.value.trim();
        chatInput.value = '';
        this.adjustTextareaHeight(chatInput);

        // Add user message
        this.addMessage('user', userMessage);
        
        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const response = await this.getAIResponse(userMessage);
            this.hideTypingIndicator();
            this.addMessage('assistant', response);
        } catch (error) {
            console.error('Failed to get AI response:', error);
            this.hideTypingIndicator();
            this.addMessage('assistant', "I'm sorry, I'm having trouble connecting right now. Please try again later.");
        }

        this.saveChatHistory();
    }

    /**
     * Get AI response from Spark LLM (mock implementation)
     */
    async getAIResponse(userMessage) {
        // Mock implementation - replace with actual Spark LLM API call
        await this.wait(1000 + Math.random() * 2000); // Simulate API delay

        const responses = this.generateContextualResponse(userMessage);
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Generate contextual response based on current lab context
     */
    generateContextualResponse(userMessage) {
        const message = userMessage.toLowerCase();
        const context = this.currentContext;

        // Context-aware responses
        if (context && context.labId) {
            if (message.includes('help') || message.includes('stuck')) {
                return [
                    `I see you're working on "${context.labTitle}". What specific step are you having trouble with?`,
                    `For the ${context.labTitle} lab, here are some common issues and solutions...`,
                    `Need help with ${context.labTitle}? Let me guide you through the current step.`
                ];
            }
            
            if (message.includes('next') || message.includes('continue')) {
                return [
                    `Great! The next step in ${context.labTitle} is to ${this.getNextStepHint(context)}.`,
                    `You're making good progress! Ready to move to the next part?`,
                    `Let's continue with the next use case in your lab.`
                ];
            }
            
            if (message.includes('screenshot') || message.includes('image')) {
                return [
                    `The screenshot shows the key elements you need to interact with. Look for the highlighted areas.`,
                    `Pay attention to the visual cues in the screenshot - they guide you to the right UI elements.`,
                    `The screenshot demonstrates exactly what your screen should look like at this step.`
                ];
            }
        }

        // General Microsoft Copilot Studio knowledge
        if (message.includes('copilot studio')) {
            return [
                `Microsoft Copilot Studio is a powerful platform for building AI agents and chatbots. What would you like to know about it?`,
                `Copilot Studio allows you to create intelligent agents that can help users with various tasks. Are you interested in a specific feature?`,
                `You can build conversational AI agents, autonomous agents, and integrate with various Microsoft services using Copilot Studio.`
            ];
        }

        if (message.includes('agent')) {
            return [
                `AI agents in Copilot Studio can be conversational or autonomous. Conversational agents chat with users, while autonomous agents can perform tasks automatically.`,
                `There are different types of agents you can build - which one interests you most?`,
                `Agents can integrate with SharePoint, ServiceNow, custom APIs, and more. What integration are you thinking about?`
            ];
        }

        if (message.includes('error') || message.includes('problem')) {
            return [
                `Let me help you troubleshoot. Can you describe what error you're seeing?`,
                `Common issues often relate to permissions, authentication, or configuration. What seems to be the problem?`,
                `I can help you debug this. What step were you on when the error occurred?`
            ];
        }

        // Default responses
        return [
            `I'm here to help you with Microsoft Copilot Studio labs! What can I assist you with?`,
            `Feel free to ask me about any step in your current lab, or general Copilot Studio questions.`,
            `I can explain concepts, help troubleshoot issues, or guide you through complex steps. What would you like to know?`,
            `Whether you need help with specific steps or want to understand the broader concepts, I'm here to help!`
        ];
    }

    /**
     * Get hint for next step based on context
     */
    getNextStepHint(context) {
        const hints = [
            'configure your agent settings',
            'add a knowledge source',
            'test your agent',
            'deploy to SharePoint',
            'set up authentication',
            'configure the connector'
        ];
        
        return hints[Math.floor(Math.random() * hints.length)];
    }

    /**
     * Add message to chat
     */
    addMessage(sender, content) {
        const message = {
            id: Date.now(),
            sender,
            content,
            timestamp: new Date()
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    /**
     * Render message in chat
     */
    renderMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.sender}-message`;
        messageEl.innerHTML = `
            <div class="message-avatar">
                ${message.sender === 'user' ? '👤' : '🤖'}
            </div>
            <div class="message-content">
                ${this.formatMessageContent(message.content)}
                <div class="message-time">
                    ${this.formatTime(message.timestamp)}
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageEl);
        
        // Animate message appearance
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            messageEl.style.transition = 'all 0.3s ease';
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateY(0)';
        });
    }

    /**
     * Format message content
     */
    formatMessageContent(content) {
        // Convert markdown-like formatting
        return content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Format timestamp
     */
    formatTime(timestamp) {
        return timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const typingEl = document.createElement('div');
        typingEl.className = 'message assistant-message typing-indicator';
        typingEl.id = 'typing-indicator';
        typingEl.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingEl);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Update context when lab or step changes
     */
    updateContext(context) {
        this.currentContext = context;
        
        // Send context-aware message
        if (context.type === 'labChanged') {
            this.addMessage('assistant', 
                `I see you've started "${context.labTitle}". I'm here to help if you have any questions!`
            );
        } else if (context.type === 'stepChanged') {
            // Don't be too chatty with step changes
            console.log('Context updated:', context);
        }
    }

    /**
     * Scroll to bottom of chat
     */
    scrollToBottom() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    /**
     * Focus input field
     */
    focusInput() {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            setTimeout(() => chatInput.focus(), 100);
        }
    }

    /**
     * Adjust textarea height
     */
    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    /**
     * Get welcome message
     */
    getWelcomeMessage() {
        return `Hello! I'm your AI assistant for Microsoft Copilot Studio Labs. I can help you with:

• Explaining concepts and steps
• Troubleshooting issues
• Providing additional context
• Suggesting next steps

How can I assist you today?`;
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        try {
            const history = this.messages.slice(-50); // Keep last 50 messages
            localStorage.setItem('copilot-labs-chat', JSON.stringify(history));
        } catch (error) {
            console.warn('Failed to save chat history:', error);
        }
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('copilot-labs-chat');
            if (saved) {
                const history = JSON.parse(saved);
                this.messages = history.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                
                // Render existing messages
                this.messages.forEach(message => this.renderMessage(message));
            }
        } catch (error) {
            console.warn('Failed to load chat history:', error);
        }
    }

    /**
     * Clear chat history
     */
    clearHistory() {
        this.messages = [];
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        localStorage.removeItem('copilot-labs-chat');
        
        // Add welcome message back
        this.addMessage('assistant', this.getWelcomeMessage());
    }

    /**
     * Get suggestions based on current context
     */
    getSuggestions() {
        const context = this.currentContext;
        
        if (context && context.labId) {
            return [
                'What does this step do?',
                'I need help with this lab',
                'Show me the next step',
                'What is Microsoft Copilot Studio?'
            ];
        }
        
        return [
            'How do I get started?',
            'What labs are available?',
            'What is Microsoft Copilot Studio?',
            'Help me choose a lab'
        ];
    }

    /**
     * Utility function to wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export as global
window.AIAssistant = AIAssistant;