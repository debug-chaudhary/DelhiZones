#!/usr/bin/env node

/**
 * Auto-Version Updater
 * Updates all HTML files with centralized version from assets/js/version.js
 * Run with: node update-versions.js
 */

const fs = require('fs');
const path = require('path');

const VERSION = '4.3'; // Update this to bump all versions
const rootDir = __dirname;

// Find all HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and common non-HTML directories
            if (!['node_modules', '.git', '.vscode'].includes(file)) {
                findHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Update version in a single file
function updateHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace all ?v=X.X patterns with new version
    content = content.replace(/\?v=[\d.]+/g, `?v=${VERSION}`);
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

// Main execution
const htmlFiles = findHtmlFiles(rootDir);
let updated = 0;

console.log(`🔍 Found ${htmlFiles.length} HTML files`);
console.log(`📝 Updating to version: ${VERSION}\n`);

htmlFiles.forEach(filePath => {
    if (updateHtmlFile(filePath)) {
        const relativePath = path.relative(rootDir, filePath);
        console.log(`✅ ${relativePath}`);
        updated++;
    }
});

console.log(`\n✨ Updated ${updated} files to version ${VERSION}`);
