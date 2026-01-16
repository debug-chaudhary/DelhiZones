/**
 * Delhizones Global Loader
 * Purpose: Master Controller for Assets, Themes, PWA, and Components.
 * Features:
 * 1. Cache Busting (Updates site version automatically).
 * 2. Captures 'beforeinstallprompt' IMMEDIATELY.
 * 3. Injects Navbar, Footer, and PWA logic.
 */

(function () {
    
    // --- CONFIGURATION ---
    // CHANGE THIS NUMBER whenever you update your code to force a refresh for all users.
    const SITE_VERSION = '?v=1.3'; 

    // --- 1. IMMEDIATE PWA CAPTURE ---
    window.deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
        console.log('Loader: PWA Install Event Captured!');
        if (window.showInstallButtons) window.showInstallButtons();
    });

    // --- 2. Component Injector (HTML) ---
    function injectComponent(path, destination, method = 'append', checkId = null) {
        if (checkId && document.getElementById(checkId)) return; 

        // Append version to path to force fresh download
        const versionedPath = path + SITE_VERSION;

        fetch(versionedPath)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${path}`);
                return response.text();
            })
            .then(html => {
                if (!html) return;
                if (checkId && document.getElementById(checkId)) return;

                const range = document.createRange();
                range.selectNode(destination);
                const fragment = range.createContextualFragment(html);

                if (method === 'prepend') destination.insertBefore(fragment, destination.firstChild);
                else destination.appendChild(fragment);

                // Re-init Icons if needed
                if (window.lucide && destination !== document.head) {
                    setTimeout(() => window.lucide.createIcons(), 50);
                }
            })
            .catch(err => console.error('Loader Error:', err));
    }

    // --- 3. Asset Injector (CSS/JS) ---
    function injectAsset(type, path) {
        // Check if asset already exists (ignoring version string for check)
        const cleanPath = path.split('?')[0];
        
        if (type === 'css') {
            if (document.querySelector(`link[href^="${cleanPath}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path + SITE_VERSION; // Add version
            document.head.appendChild(link);
        } 
        else if (type === 'js') {
            if (document.querySelector(`script[src^="${cleanPath}"]`)) return;
            const script = document.createElement('script');
            script.src = path + SITE_VERSION; // Add version
            script.defer = true;
            document.body.appendChild(script);
        }
    }

    // --- 4. Main Initialization ---
    function init() {
        console.log(`Delhizones: Initializing System (Version ${SITE_VERSION})...`);

        // A. Inject Manifest IMMEDIATELY
        if (!document.querySelector('link[rel="manifest"]')) {
            const manifest = document.createElement('link');
            manifest.rel = 'manifest';
            manifest.href = '/manifest.json' + SITE_VERSION;
            document.head.appendChild(manifest);
        }

        // B. Inject Core Systems (With Versioning)
        injectAsset('css', '/assets/css/themes.css');       
        injectAsset('js', '/assets/js/theme-manager.js');   
        injectAsset('js', '/assets/js/pwa-manager.js');     

        // C. Inject HTML Components (With Versioning)
        // Navbar -> Top of Body
        injectComponent('/includes/navbar.html', document.body, 'prepend', 'header');

        // Footer -> Bottom of Body
        injectComponent('/includes/footer.html', document.body, 'append', 'contact');
        
        // Head Meta -> Bottom of Head
        injectComponent('/includes/head.html', document.head, 'append');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();