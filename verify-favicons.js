#!/usr/bin/env node

/**
 * Favicon Verification Tool
 * Checks if all favicon files exist and are properly linked
 * Run with: node verify-favicons.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const iconsDir = path.join(rootDir, 'assets/icons');

// Required favicon files
const REQUIRED_FILES = [
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png',
    'site.webmanifest'
];

// Expected favicon links in HTML
const EXPECTED_LINKS = [
    '<link rel="icon" type="image/x-icon" href="/assets/icons/favicon.ico">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/icon-192.png">',
    '<link rel="icon" type="image/png" sizes="512x512" href="/assets/icons/icon-512.png">',
    '<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">',
    '<link rel="manifest" href="/assets/icons/site.webmanifest">',
    '<meta name="theme-color" content="#2563EB">'
];

console.log('🔍 Favicon Verification Report\n');
console.log('=' .repeat(50));

// Check 1: Verify favicon files exist
console.log('\n✓ CHECKING FAVICON FILES:');
let missingFiles = [];

REQUIRED_FILES.forEach(file => {
    const filePath = path.join(iconsDir, file);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2);
        console.log(`   ✅ ${file} (${size}KB)`);
    } else {
        console.log(`   ❌ ${file} (MISSING)`);
        missingFiles.push(file);
    }
});

// Check 2: Verify HTML contains favicon links
console.log('\n✓ CHECKING HTML FAVICON LINKS:');
const indexPath = path.join(rootDir, 'index.html');
const htmlContent = fs.readFileSync(indexPath, 'utf8');

let missingLinks = [];
EXPECTED_LINKS.forEach(link => {
    if (htmlContent.includes(link)) {
        console.log(`   ✅ ${link.substring(0, 70)}...`);
    } else {
        console.log(`   ❌ ${link.substring(0, 70)}...`);
        missingLinks.push(link);
    }
});

// Check 3: Verify manifest content
console.log('\n✓ CHECKING MANIFEST:');
const manifestPath = path.join(iconsDir, 'site.webmanifest');
try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`   ✅ Manifest name: "${manifest.name}"`);
    console.log(`   ✅ Manifest icons: ${manifest.icons?.length || 0}`);
    console.log(`   ✅ Theme color: ${manifest.theme_color}`);
} catch (e) {
    console.log(`   ❌ Manifest JSON parse error`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 SUMMARY:');

if (missingFiles.length === 0 && missingLinks.length === 0) {
    console.log('✅ All favicon files and links are properly configured!');
    console.log('\n🎉 Favicon should display on:');
    console.log('   • Browser tabs (favicon-16x16, favicon-32x32)');
    console.log('   • Mobile home screen (icon-192, icon-512)');
    console.log('   • iOS Safari (apple-touch-icon)');
    console.log('   • PWA install (manifest.json)');
} else {
    if (missingFiles.length > 0) {
        console.log(`\n⚠️  Missing files: ${missingFiles.join(', ')}`);
    }
    if (missingLinks.length > 0) {
        console.log(`\n⚠️  Missing HTML links: ${missingLinks.length} items`);
    }
}

console.log('\n💡 Troubleshooting:');
console.log('   • Clear browser cache (Ctrl+Shift+Delete)');
console.log('   • Hard refresh page (Ctrl+Shift+R)');
console.log('   • Check browser DevTools > Application > Manifest');
