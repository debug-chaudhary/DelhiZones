#!/usr/bin/env node

/**
 * Index.html Cleanup Script
 * Removes duplicate/redundant elements from index.html
 * Run with: node cleanup-index.js
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const originalSize = content.length;
console.log('🔍 Analyzing index.html for duplicates...\n');

// 1. Check for duplicate H1 tags and keep only the first one
const h1Matches = Array.from(content.matchAll(/<h1[^>]*>.*?<\/h1>/gs));
if (h1Matches.length > 1) {
    console.log(`⚠️  Found ${h1Matches.length} H1 tags (should have only 1)`);
    h1Matches.forEach((match, i) => {
        console.log(`   ${i + 1}. Line ${content.substring(0, match.index).split('\n').length}: ${match[0].substring(0, 60)}...`);
    });
    console.log();
}

// 2. Remove duplicate stylesheet links
const stylesheetRegex = /<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
const stylesheets = new Set();
const duplicateStylesheets = [];

content = content.replace(stylesheetRegex, (match, href) => {
    if (stylesheets.has(href)) {
        duplicateStylesheets.push(href);
        console.log(`❌ Removing duplicate stylesheet: ${href}`);
        return ''; // Remove duplicate
    }
    stylesheets.add(href);
    return match;
});

// 3. Remove duplicate script tags (but keep loader.js and others intentional)
const scriptRegex = /<script[^>]*src="([^"]+)"[^>]*><\/script>/g;
const scripts = new Set();
const duplicateScripts = [];

content = content.replace(scriptRegex, (match, src) => {
    // Ignore tracking scripts and lazy-loaded scripts
    if (src.includes('googletagmanager') || src.includes('adsense') || src.includes('analytics')) {
        return match; // Keep all tracking scripts
    }
    
    if (scripts.has(src)) {
        duplicateScripts.push(src);
        console.log(`❌ Removing duplicate script: ${src}`);
        return ''; // Remove duplicate
    }
    scripts.add(src);
    return match;
});

// 4. Remove extra spacing and newlines
const beforeClean = content;
content = content.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove triple+ newlines

if (content !== beforeClean) {
    console.log('✅ Cleaned up extra whitespace');
}

// 5. Remove commented-out code blocks (optional - only large ones)
const largeComments = Array.from(content.matchAll(/<!--[\s\S]{200,}?-->/g));
if (largeComments.length > 0) {
    console.log(`\n⚠️  Found ${largeComments.length} large comment blocks`);
    largeComments.forEach((match, i) => {
        console.log(`   ${i + 1}. ${match[0].substring(0, 60)}...`);
    });
}

// Save the cleaned file
fs.writeFileSync(indexPath, content, 'utf8');
const finalSize = content.length;

console.log('\n✨ Cleanup Complete:');
console.log(`   Original size: ${originalSize} bytes`);
console.log(`   Final size: ${finalSize} bytes`);
console.log(`   Reduced by: ${originalSize - finalSize} bytes (${Math.round(((originalSize - finalSize) / originalSize) * 100)}%)`);

if (h1Matches.length > 1) {
    console.log('\n⚠️  NOTE: Multiple H1 tags detected. Consider reviewing content structure.');
    console.log('   Keep one H1 per page for better SEO.');
}
