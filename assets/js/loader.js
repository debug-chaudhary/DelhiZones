/**
 * Delhizones Global Loader
 * Purpose: Master Controller for Assets, Themes, PWA, and Components.
 * * CRITICAL UPDATE:
 * 1. Captures 'beforeinstallprompt' IMMEDIATELY (fixes hidden install button).
 * 2. Injects 'manifest.json' explicitly in init().
 * 3. Loads PWA Manager and Themes.
 */

(function () {
    
    // --- 1. IMMEDIATE PWA CAPTURE (Run this first!) ---
    // We do this here because waiting for head.html to load is too slow.
    window.deferredPrompt = null;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        window.deferredPrompt = e;
        console.log('Loader: PWA Install Event Captured!');
        
        // If pwa-manager is already loaded, tell it to show buttons
        if (window.showInstallButtons) {
            window.showInstallButtons();
        }
    });

    // --- 2. Component Injector (HTML) ---
    function injectComponent(path, destination, method = 'append', checkId = null) {
        if (checkId && document.getElementById(checkId)) return; 

        fetch(path)
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

                if (window.lucide && destination !== document.head) {
                    setTimeout(() => window.lucide.createIcons(), 50);
                }
            })
            .catch(err => console.error('Loader Error:', err));
    }

    // --- 3. Asset Injector (CSS/JS) ---
    function injectAsset(type, path) {
        if (type === 'css') {
            if (document.querySelector(`link[href="${path}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            document.head.appendChild(link);
        } 
        else if (type === 'js') {
            if (document.querySelector(`script[src="${path}"]`)) return;
            const script = document.createElement('script');
            script.src = path;
            script.defer = true;
            document.body.appendChild(script);
        }
    }

    // --- 4. Main Initialization (The "Inint" part) ---
    function init() {
        console.log('Delhizones: Initializing System...');

        // A. Inject Manifest IMMEDIATELY (Crucial for PWA recognition)
        if (!document.querySelector('link[rel="manifest"]')) {
            const manifest = document.createElement('link');
            manifest.rel = 'manifest';
            manifest.href = '/manifest.json';
            document.head.appendChild(manifest);
        }

        // B. Inject Core Systems
        injectAsset('css', '/assets/css/themes.css');       
        injectAsset('js', '/assets/js/theme-manager.js');   
        injectAsset('js', '/assets/js/pwa-manager.js');     

        // C. Inject HTML Components
        injectComponent('/includes/navbar.html', document.body, 'prepend', 'header');
        injectComponent('/includes/footer.html', document.body, 'append', 'contact');
        
        // Note: We still inject head.html for meta tags, but the PWA logic is now handled above.
        injectComponent('/includes/head.html', document.head, 'append');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();