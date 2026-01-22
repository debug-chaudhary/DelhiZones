#!/usr/bin/env node

/**
 * Advanced Favicon Debugger
 * Diagnoses favicon issues and verifies configuration
 * Run with: node debug-favicon.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

console.log('\n🔍 FAVICON DEBUGGING REPORT\n' + '='.repeat(60));

// 1. Check favicon in root
console.log('\n✓ ROOT FAVICON:');
const rootFavicon = path.join(rootDir, 'favicon.ico');
if (fs.existsSync(rootFavicon)) {
    const size = fs.statSync(rootFavicon).size;
    console.log(`   ✅ /favicon.ico (${(size/1024).toFixed(2)}KB) - IMPORTANT FOR BROWSER!`);
} else {
    console.log('   ❌ /favicon.ico MISSING - Browsers won\'t find it!');
}

// 2. Check favicon files
console.log('\n✓ ICON FILES IN /assets/icons/:');
const iconsDir = path.join(rootDir, 'assets/icons');
const requiredIcons = [
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'icon-192.png',
    'icon-512.png'
];

let missing = 0;
requiredIcons.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    if (fs.existsSync(iconPath)) {
        const size = (fs.statSync(iconPath).size / 1024).toFixed(2);
        console.log(`   ✅ ${icon} (${size}KB)`);
    } else {
        console.log(`   ❌ ${icon} MISSING`);
        missing++;
    }
});

// 3. Check HTML favicon links
console.log('\n✓ HTML FAVICON CONFIGURATION:');
const indexPath = path.join(rootDir, 'index.html');
const htmlContent = fs.readFileSync(indexPath, 'utf8');

const faviconChecks = [
    { tag: 'Root favicon.ico', search: 'href="/favicon.ico"' },
    { tag: 'favicon-16x16.png', search: 'href="/assets/icons/favicon-16x16.png"' },
    { tag: 'favicon-32x32.png', search: 'href="/assets/icons/favicon-32x32.png"' },
    { tag: 'apple-touch-icon', search: 'href="/assets/icons/apple-touch-icon.png"' },
    { tag: 'PWA manifest', search: 'href="/assets/icons/site.webmanifest"' },
];

faviconChecks.forEach(check => {
    if (htmlContent.includes(check.search)) {
        console.log(`   ✅ ${check.tag}`);
    } else {
        console.log(`   ❌ ${check.tag} - Missing link!`);
    }
});

// 4. Check for conflicts
console.log('\n✓ POTENTIAL CONFLICTS:');
const faviconLinks = htmlContent.match(/<link[^>]*rel="icon"[^>]*>/g) || [];
console.log(`   Found ${faviconLinks.length} favicon links`);
if (faviconLinks.length > 4) {
    console.log(`   ⚠️  Too many favicon links (${faviconLinks.length}) - may cause confusion`);
} else {
    console.log(`   ✅ Reasonable number of favicon links`);
}

// 5. Verify Service Worker not removing favicons
console.log('\n✓ SERVICE WORKER CHECK:');
const swPath = path.join(rootDir, 'sw.js');
if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    if (swContent.includes('favicon') || swContent.includes('/assets/icons')) {
        console.log('   ⚠️  Service Worker might be caching favicons - check sw.js');
    } else {
        console.log('   ✅ Service Worker not interfering with favicons');
    }
} else {
    console.log('   ℹ️  No Service Worker file');
}

// 6. Check loader.js
console.log('\n✓ LOADER.JS CHECK:');
const loaderPath = path.join(rootDir, 'assets/js/loader.js');
const loaderContent = fs.readFileSync(loaderPath, 'utf8');
if (loaderContent.includes('favicon') || loaderContent.includes('window.location.reload()')) {
    console.log('   ⚠️  Loader.js has reload logic - could cause flicker');
} else {
    console.log('   ✅ Loader.js not causing favicon issues');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📋 SUMMARY & FIXES:');

if (!fs.existsSync(rootFavicon)) {
    console.log('\n🔧 FIX: Copy favicon.ico to root:');
    console.log('   cp assets/icons/favicon.ico favicon.ico');
}

if (missing > 0) {
    console.log(`\n🔧 FIX: Generate missing ${missing} icon files`);
}

console.log('\n🧹 BROWSER CACHE FIX:');
console.log('   1. Open DevTools (F12)');
console.log('   2. Settings → Network → Disable cache (check box)');
console.log('   3. Hard refresh (Ctrl+Shift+R)');
console.log('   4. Leave DevTools open while testing');

console.log('\n✅ FINAL CHECKLIST:');
console.log('   ☐ favicon.ico exists in root (/)');
console.log('   ☐ All icons in /assets/icons/');
console.log('   ☐ HTML has root favicon link first');
console.log('   ☐ Browser cache disabled during testing');
console.log('   ☐ Hard refresh page (Ctrl+Shift+R)');
console.log('   ☐ Check DevTools Application → Manifest tab');
console.log('\n');
