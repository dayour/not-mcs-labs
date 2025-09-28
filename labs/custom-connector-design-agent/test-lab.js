#!/usr/bin/env node

/**
 * Simple validation script for the Custom Connector Design Agent lab
 * Tests the structure and readiness of lab components
 */

const fs = require('fs').promises;
const path = require('path');

async function validateLab() {
    console.log('🧪 Validating Custom Connector Design Agent Lab...\n');
    
    let allValid = true;
    
    // Check README exists and has expected content
    try {
        const readmeContent = await fs.readFile('./README.md', 'utf8');
        console.log('✅ README.md exists');
        
        // Check for key sections
        const requiredSections = [
            'Create a Design Agent with Getty Images Custom Connector',
            'Custom REST Connector',
            'Getty Images API',
            'Use Case #1',
            'Use Case #2'
        ];
        
        for (const section of requiredSections) {
            if (readmeContent.includes(section)) {
                console.log(`✅ Found section: ${section}`);
            } else {
                console.log(`❌ Missing section: ${section}`);
                allValid = false;
            }
        }
        
    } catch (error) {
        console.log('❌ README.md not found or unreadable');
        allValid = false;
    }
    
    // Check images directory
    try {
        const imageFiles = await fs.readdir('./images');
        const expectedImages = [
            'create-design-agent.png',
            'connector-basic-setup.png',
            'api-action-config.png',
            'connector-test.png',
            'agent-instructions.png',
            'creative-search-topic.png',
            'agent-testing.png',
            'complete-workflow-test.png'
        ];
        
        console.log('\n📸 Checking images:');
        for (const image of expectedImages) {
            if (imageFiles.includes(image)) {
                console.log(`✅ Image found: ${image}`);
            } else {
                console.log(`❌ Missing image: ${image}`);
                allValid = false;
            }
        }
        
    } catch (error) {
        console.log('❌ Images directory not accessible');
        allValid = false;
    }
    
    // Check package dependencies
    try {
        const packagePath = path.join(__dirname, '../../package.json');
        const packageContent = await fs.readFile(packagePath, 'utf8');
        const packageData = JSON.parse(packageContent);
        
        console.log('\n📦 Checking dependencies:');
        if (packageData.dependencies && packageData.dependencies['@darbotlabs/darbot-browser-mcp']) {
            console.log('✅ darbot-browser-mcp installed');
        } else {
            console.log('❌ darbot-browser-mcp not found');
            allValid = false;
        }
        
        if (packageData.dependencies && packageData.dependencies['playwright']) {
            console.log('✅ playwright installed');
        } else {
            console.log('❌ playwright not found');
            allValid = false;
        }
        
    } catch (error) {
        console.log('❌ Package.json validation failed');
        allValid = false;
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (allValid) {
        console.log('🎉 Lab validation successful! All components are ready.');
        console.log('\nNext steps:');
        console.log('1. Test the lab with actual Copilot Studio access');
        console.log('2. Verify Getty Images API integration');
        console.log('3. Validate all screenshots match current UI');
    } else {
        console.log('⚠️  Lab validation failed. Please address the issues above.');
    }
    
    return allValid ? 0 : 1;
}

// Run validation
validateLab().then(process.exit).catch(error => {
    console.error('Validation script error:', error);
    process.exit(1);
});