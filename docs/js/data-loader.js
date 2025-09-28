/**
 * Data Loader for Microsoft Copilot Studio Labs
 * Loads and parses lab content from markdown files
 */

class DataLoader {
    constructor() {
        this.labs = [];
        this.currentLab = null;
        this.cache = new Map();
    }

    /**
     * Initialize labs data from the main README
     */
    async initialize() {
        try {
            // Load main lab catalog
            const readmeResponse = await fetch('../README.md');
            const readmeContent = await readmeResponse.text();
            
            this.labs = this.parseLabCatalog(readmeContent);
            
            // Enhance with additional metadata
            for (const lab of this.labs) {
                await this.loadLabMetadata(lab);
            }
            
            console.log('Loaded', this.labs.length, 'labs');
            return this.labs;
        } catch (error) {
            console.error('Failed to initialize lab data:', error);
            // Fallback to hardcoded lab data
            return this.getFallbackLabData();
        }
    }

    /**
     * Parse lab catalog from README.md content
     */
    parseLabCatalog(content) {
        const labs = [];
        const tableRegex = /\|\s*(.+?)\s*\|\s*\[(.+?)\]\((.+?)\)\s*\|\s*(.+?)\s*\|/g;
        let match;

        while ((match = tableRegex.exec(content)) !== null) {
            const [, title, linkText, url, description] = match;
            
            // Skip header rows
            if (title.includes('Title') || title.includes('---')) continue;
            
            const labId = url.replace('./labs/', '').replace('/', '');
            
            labs.push({
                id: labId,
                title: title.trim(),
                url: url.trim(),
                description: description.trim(),
                level: this.extractLevel(description),
                duration: this.extractDuration(description),
                persona: this.extractPersona(description),
                completed: false,
                bookmarked: false,
                progress: 0
            });
        }

        return labs;
    }

    /**
     * Load detailed lab metadata from individual lab files
     */
    async loadLabMetadata(lab) {
        try {
            const labUrl = `../labs/${lab.id}/README.md`;
            const response = await fetch(labUrl);
            
            if (!response.ok) {
                console.warn(`Could not load lab metadata for ${lab.id}`);
                return;
            }
            
            const content = await response.text();
            
            // Parse lab details table
            const detailsMatch = content.match(/\|\s*Level\s*\|\s*Persona\s*\|\s*Duration\s*\|\s*Purpose\s*\|[\s\S]*?\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/);
            if (detailsMatch) {
                const [, level, persona, duration, purpose] = detailsMatch;
                lab.level = level.trim();
                lab.persona = persona.trim();
                lab.duration = duration.trim();
                lab.purpose = purpose.trim();
            }

            // Parse use cases
            lab.useCases = this.parseUseCases(content);
            
            // Parse images
            lab.images = this.parseImages(content, lab.id);
            
            // Cache the content
            this.cache.set(lab.id, content);
            
        } catch (error) {
            console.warn(`Failed to load metadata for lab ${lab.id}:`, error);
        }
    }

    /**
     * Parse use cases from lab content
     */
    parseUseCases(content) {
        const useCases = [];
        const useCaseRegex = /## (.+?) Use Case #(\d+): (.+?)(?=\n## |\n---|\n#|$)/gs;
        let match;

        while ((match = useCaseRegex.exec(content)) !== null) {
            const [, emoji, number, title] = match;
            
            // Extract steps
            const steps = this.parseSteps(match[0]);
            
            useCases.push({
                number: parseInt(number),
                emoji: emoji.trim(),
                title: title.trim(),
                steps: steps,
                completed: false
            });
        }

        return useCases;
    }

    /**
     * Parse steps from use case content
     */
    parseSteps(content) {
        const steps = [];
        const stepRegex = /^(\d+)\.\s+(.+?)(?=\n\d+\.|\n>|\n```|\n#|$)/gm;
        let match;

        while ((match = stepRegex.exec(content)) !== null) {
            const [, number, instruction] = match;
            
            steps.push({
                number: parseInt(number),
                instruction: instruction.trim(),
                completed: false,
                hasScreenshot: this.hasScreenshot(instruction),
                screenshot: this.extractScreenshot(instruction)
            });
        }

        return steps;
    }

    /**
     * Parse images from lab content
     */
    parseImages(content, labId) {
        const images = [];
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;

        while ((match = imageRegex.exec(content)) !== null) {
            const [, alt, src] = match;
            
            images.push({
                alt: alt.trim(),
                src: src.trim(),
                fullPath: `../labs/${labId}/${src.trim()}`
            });
        }

        return images;
    }

    /**
     * Get lab by ID
     */
    async getLab(labId) {
        const lab = this.labs.find(l => l.id === labId);
        if (!lab) return null;

        // Load full content if not cached
        if (!this.cache.has(labId)) {
            await this.loadLabMetadata(lab);
        }

        lab.content = this.cache.get(labId);
        return lab;
    }

    /**
     * Get lab content sections
     */
    getLabSections(labId) {
        const content = this.cache.get(labId);
        if (!content) return [];

        const sections = [];
        const sectionRegex = /^(#{1,6})\s+(.+?)$([\s\S]*?)(?=^#{1,6}\s+|$)/gm;
        let match;

        while ((match = sectionRegex.exec(content)) !== null) {
            const [, hashes, title, content] = match;
            const level = hashes.length;
            
            sections.push({
                level,
                title: title.trim(),
                content: content.trim(),
                id: this.slugify(title)
            });
        }

        return sections;
    }

    /**
     * Search labs
     */
    searchLabs(query) {
        const lowercaseQuery = query.toLowerCase();
        
        return this.labs.filter(lab => 
            lab.title.toLowerCase().includes(lowercaseQuery) ||
            lab.description.toLowerCase().includes(lowercaseQuery) ||
            lab.persona.toLowerCase().includes(lowercaseQuery) ||
            lab.id.toLowerCase().includes(lowercaseQuery)
        );
    }

    /**
     * Get labs by persona
     */
    getLabsByPersona(persona) {
        return this.labs.filter(lab => 
            lab.persona.toLowerCase().includes(persona.toLowerCase())
        );
    }

    /**
     * Get labs by level
     */
    getLabsByLevel(level) {
        return this.labs.filter(lab => 
            lab.level === level.toString()
        );
    }

    /**
     * Update lab progress
     */
    updateLabProgress(labId, progress) {
        const lab = this.labs.find(l => l.id === labId);
        if (lab) {
            lab.progress = Math.max(0, Math.min(100, progress));
            lab.completed = progress >= 100;
            this.saveProgress();
        }
    }

    /**
     * Toggle lab bookmark
     */
    toggleBookmark(labId) {
        const lab = this.labs.find(l => l.id === labId);
        if (lab) {
            lab.bookmarked = !lab.bookmarked;
            this.saveProgress();
        }
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        const progress = this.labs.reduce((acc, lab) => {
            acc[lab.id] = {
                progress: lab.progress,
                completed: lab.completed,
                bookmarked: lab.bookmarked
            };
            return acc;
        }, {});
        
        localStorage.setItem('copilot-labs-progress', JSON.stringify(progress));
    }

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('copilot-labs-progress');
            if (saved) {
                const progress = JSON.parse(saved);
                
                this.labs.forEach(lab => {
                    if (progress[lab.id]) {
                        lab.progress = progress[lab.id].progress || 0;
                        lab.completed = progress[lab.id].completed || false;
                        lab.bookmarked = progress[lab.id].bookmarked || false;
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to load progress:', error);
        }
    }

    /**
     * Get overall progress statistics
     */
    getProgressStats() {
        const total = this.labs.length;
        const completed = this.labs.filter(lab => lab.completed).length;
        const inProgress = this.labs.filter(lab => lab.progress > 0 && lab.progress < 100).length;
        const bookmarked = this.labs.filter(lab => lab.bookmarked).length;
        
        return {
            total,
            completed,
            inProgress,
            bookmarked,
            completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    // Utility methods
    extractLevel(text) {
        const match = text.match(/level\s*(\d+)/i);
        return match ? match[1] : '200'; // Default to intermediate
    }

    extractDuration(text) {
        const match = text.match(/(\d+)\s*min/i);
        return match ? `${match[1]} minutes` : '30 minutes'; // Default
    }

    extractPersona(text) {
        const personas = ['maker', 'developer', 'admin'];
        for (const persona of personas) {
            if (text.toLowerCase().includes(persona)) {
                return persona.charAt(0).toUpperCase() + persona.slice(1);
            }
        }
        return 'Maker'; // Default
    }

    hasScreenshot(instruction) {
        return instruction.includes('![') || instruction.includes('screenshot') || instruction.includes('image');
    }

    extractScreenshot(instruction) {
        const match = instruction.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        return match ? match[2] : null;
    }

    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }

    /**
     * Fallback lab data if loading fails
     */
    getFallbackLabData() {
        return [
            {
                id: 'agent-builder-web',
                title: 'Create your own web-based AI assistant with agent builder',
                description: 'Create a Copilot agent in Microsoft 365 Copilot Chat with Microsoft Copilot Studio agent builder.',
                level: '100',
                duration: '15 minutes',
                persona: 'Maker',
                completed: false,
                bookmarked: false,
                progress: 0,
                useCases: [],
                images: []
            },
            {
                id: 'public-website-agent',
                title: 'Give your public website chatbot a brain and make it an agent',
                description: 'Learn how to build and publish a Copilot Studio agent that delivers rich, contextual answers.',
                level: '200',
                duration: '25 minutes',
                persona: 'Maker',
                completed: false,
                bookmarked: false,
                progress: 0,
                useCases: [],
                images: []
            }
        ];
    }
}

// Export as global
window.DataLoader = DataLoader;