/**
 * Delhizones Global Loader
 * Purpose: Automatically injects Navbar, Footer, Head, and THEME SYSTEM.
 * Features: 
 * 1. Robust "Double Check" against duplicate injections.
 * 2. Executes scripts inside injected HTML.
 * 3. Auto-loads Theme CSS and Theme Manager JS.
 */

(function () {
    // Core injection function
    function injectComponent(path, destination, method = 'append', checkId = null) {
        
        // 1. First Check: If the element already exists, stop.
        if (checkId && document.getElementById(checkId)) {
            return;
        }

        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${path}: ${response.statusText}`);
                return response.text();
            })
            .then(html => {
                if (!html) return;

                // 2. Second Check: Verify existence again
                if (checkId && document.getElementById(checkId)) return;

                // 3. Create a "Contextual Fragment" (executes inner scripts)
                const range = document.createRange();
                range.selectNode(destination);
                const fragment = range.createContextualFragment(html);

                // 4. Insert into the page
                if (method === 'prepend') {
                    destination.insertBefore(fragment, destination.firstChild);
                } else {
                    destination.appendChild(fragment);
                }

                // 5. Re-initialize Icons (if Lucide is ready)
                if (window.lucide && destination !== document.head) {
                    setTimeout(() => window.lucide.createIcons(), 50);
                }
            })
            .catch(err => console.error('Delhizones Loader Error:', err));
    }

    // Helper to inject static assets (CSS/JS)
    function injectAsset(type, path) {
        if (type === 'css') {
            if (document.querySelector(`link[href="${path}"]`)) return; // Prevent dupes
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = path;
            document.head.appendChild(link);
        } else if (type === 'js') {
            if (document.querySelector(`script[src="${path}"]`)) return; // Prevent dupes
            const script = document.createElement('script');
            script.src = path;
            script.defer = true;
            document.body.appendChild(script);
        }
    }

    // Main Initialization
    function init() {
        // --- NEW: Inject Theme System ---
        injectAsset('css', '/assets/css/themes.css');
        injectAsset('js', '/assets/js/theme-manager.js');

        // --- Standard Injections ---
        // Inject Navbar (looks for id="header" to avoid dupes)
        injectComponent('/includes/navbar.html', document.body, 'prepend', 'header');

        // Inject Footer (looks for id="contact" to avoid dupes)
        injectComponent('/includes/footer.html', document.body, 'append', 'contact');
        
        // Inject Head Metadata
        injectComponent('/includes/head.html', document.head, 'append');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();