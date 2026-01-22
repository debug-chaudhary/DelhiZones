#!/usr/bin/env node

/**
 * Favicon Standardization Script
 * Replaces all non-standard favicon references with the correct one from includes/head.html
 * Run with: node fix-favicons.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

// Standard favicon lines to replace incorrect ones with
const STANDARD_FAVICON = `<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/icon-192.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">
<link rel="manifest" href="/assets/icons/site.webmanifest">`;

// Patterns to replace
const PATTERNS_TO_REMOVE = [
    /<link rel="icon"[^>]*href="\/assets\/icons\/icon-192\.png"[^>]*>/g,
    /<link rel="icon"[^>]*href="\/favicon\.svg"[^>]*>/g,
    /<link rel="icon"[^>]*href="data:image\/svg\+xml[^>]*>/g,
    /<link rel="manifest"[^>]*>/g,
];

function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (!['node_modules', '.git', '.vscode', 'assets/icons'].includes(file)) {
                findHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html') && !file.includes('head.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

function fixFaviconsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove all incorrect favicon patterns
    PATTERNS_TO_REMOVE.forEach(pattern => {
        content = content.replace(pattern, '');
    });
    
    // Clean up multiple spaces/newlines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Add standard favicon after closing head or after other meta/link tags in head
    // Look for </head> and insert before it
    if (content.includes('</head>') && !content.includes('favicon-32x32.png')) {
        content = content.replace(
            '</head>',
            `${STANDARD_FAVICON}\n</head>`
        );
    } else if (!content.includes('favicon-32x32.png') && content.includes('<meta')) {
        // Insert after last meta tag if no </head> found
        const lastMetaIndex = content.lastIndexOf('<meta ');
        if (lastMetaIndex !== -1) {
            const endOfMetaTag = content.indexOf('>', lastMetaIndex) + 1;
            content = content.slice(0, endOfMetaTag) + 
                     '\n' + STANDARD_FAVICON + 
                     content.slice(endOfMetaTag);
        }
    }
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

// Main execution
const htmlFiles = findHtmlFiles(rootDir);
let updated = 0;

console.log(`🔍 Found ${htmlFiles.length} HTML files to check`);
console.log(`🎯 Standardizing favicons...\n`);

htmlFiles.forEach(filePath => {
    if (fixFaviconsInFile(filePath)) {
        const relativePath = path.relative(rootDir, filePath);
        console.log(`✅ ${relativePath}`);
        updated++;
    }
});

console.log(`\n✨ Standardized favicons in ${updated} files`);
console.log(`📝 All favicons now use:`);
console.log(`   - icon-192.png (mobile/PWA)`);
console.log(`   - favicon-32x32.png (browser tabs)`);
console.log(`   - apple-touch-icon.png (iOS)`);
