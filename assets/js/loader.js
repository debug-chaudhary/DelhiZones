/**
 * Delhizones Master Loader (v8.0 - PWA Multi-Button Fix)
 * Integrates: Themes, PWA (Hero+Nav), Navigation, and Component Injection
 */

(function () {
    
    const SITE_VERSION = '?v=8.0'; // Version bump for cache busting
    
    // Paths
    const PATHS = {
        themeCss: '/assets/css/themes.css',
        navbar: '/includes/navbar.html',
        footer: '/includes/footer.html'
    };

    // ==========================================
    // 1. THEME MANAGER (Centralized)
    // ==========================================
    
    function initTheme() {
        const saved = localStorage.getItem('selected-theme');
        const html = document.documentElement;
        
        if (saved === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else if (saved === 'nature' || saved === 'ocean' || saved === 'sunset') {
            html.setAttribute('data-theme', saved);
        } else {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches && !saved) {
                html.setAttribute('data-theme', 'dark');
            } else {
                html.removeAttribute('data-theme');
            }
        }
        
        // Wait for DOM to be ready before updating UI icons
        if(document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => updateThemeUI(saved || 'system'));
        } else {
            updateThemeUI(saved || 'system');
        }
    }

    window.setMode = function(mode) {
        const html = document.documentElement;
        if (mode === 'dark') {
            html.setAttribute('data-theme', 'dark');
            localStorage.setItem('selected-theme', 'dark');
        } else if (mode === 'light') {
            html.removeAttribute('data-theme');
            localStorage.setItem('selected-theme', 'default');
        } else {
            localStorage.removeItem('selected-theme');
            initTheme(); 
        }
        updateThemeUI(mode);
    };

    window.setColor = function(themeName) {
        let target = 'default';
        if(themeName.includes('green')) target = 'nature';
        else if(themeName.includes('purple')) target = 'ocean';
        else if(themeName.includes('orange') || themeName.includes('red')) target = 'sunset';
        else if(themeName.includes('blue')) target = 'default';
        
        document.documentElement.setAttribute('data-theme', target);
        localStorage.setItem('selected-theme', target);
        updateThemeUI(target);
    };

    function updateThemeUI(activeMode) {
        // 1. Reset all Mode Icons
        ['mode-light', 'mode-dark', 'mode-system'].forEach(id => {
            const btn = document.getElementById(id);
            if(btn) {
                btn.setAttribute('aria-pressed', 'false');
                btn.style.color = ''; 
            }
        });

        // 2. Highlight Active Mode
        const activeId = activeMode === 'light' ? 'mode-light' : 
                         activeMode === 'dark' ? 'mode-dark' : 'mode-system';
        
        const activeBtn = document.getElementById(activeId);
        if(activeBtn) {
            activeBtn.setAttribute('aria-pressed', 'true');
        }

        if(window.lucide) window.lucide.createIcons();
    }

    // ==========================================
    // 2. UI INTERACTION MANAGER
    // ==========================================

    window.toggleDropdown = function(id, event) {
        if(event) event.stopPropagation();
        
        const menu = document.getElementById(id);
        if(!menu) return;

        // Close all other dropdowns
        document.querySelectorAll('.dropdown-content').forEach(m => {
            if(m.id !== id) m.classList.add('hidden');
        });
        document.querySelectorAll('.dropdown-btn').forEach(b => {
             if(b !== event.currentTarget) b.setAttribute('aria-expanded', 'false');
        });

        const isHidden = menu.classList.contains('hidden');
        if (isHidden) {
            menu.classList.remove('hidden');
            if(event.currentTarget) event.currentTarget.setAttribute('aria-expanded', 'true');
            
            const btn = event.currentTarget;
            const rect = btn.getBoundingClientRect();
            menu.style.top = (rect.bottom + 10) + 'px';
            
            if (rect.left + 224 > window.innerWidth) {
                menu.style.left = 'auto'; 
                menu.style.right = '10px';
            } else {
                menu.style.left = rect.left + 'px'; 
                menu.style.right = 'auto';
            }
        } else {
            menu.classList.add('hidden');
            if(event.currentTarget) event.currentTarget.setAttribute('aria-expanded', 'false');
        }
    };

    window.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-content') && !e.target.closest('.dropdown-btn')) {
            document.querySelectorAll('.dropdown-content').forEach(m => m.classList.add('hidden'));
            document.querySelectorAll('.dropdown-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
        }
    });

    // ==========================================
    // 3. PWA INSTALL LOGIC (With Debug Alerts)
    // ==========================================
    
    window.deferredPrompt = null;

    window.installPWA = async () => {
        // DEBUG: Check why it might fail
        if (!window.deferredPrompt) {
            // Check if we are incorrectly forcing it on localhost
            if (window.location.hostname === 'localhost') {
                alert("PWA Error: The browser is not blocking the install, but it hasn't given us the 'Prompt' yet.\n\nPossible reasons:\n1. App is ALREADY installed (Check chrome://apps)\n2. manifest.json is missing or broken\n3. You are in Incognito mode");
            }
            console.error("PWA: Install failed. 'deferredPrompt' is null.");
            return;
        }
        
        // Save current path
        localStorage.setItem('pwa_home_path', window.location.pathname);
        
        // Show the native prompt
        window.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await window.deferredPrompt.userChoice;
        console.log(`PWA: User response: ${outcome}`);
        
        window.deferredPrompt = null;
        
        // Hide button if they said yes
        if(outcome === 'accepted') {
            document.querySelectorAll('#install-app-btn, #hero-install-btn').forEach(btn => {
                btn.style.display = 'none';
            });
        }
    };

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        window.deferredPrompt = e;
        console.log("PWA: App is ready to install!");
        
        // REVEAL BUTTONS
        const buttons = document.querySelectorAll('#install-app-btn, #hero-install-btn');
        buttons.forEach(btn => {
            if(btn) {
                btn.hidden = false;
                btn.style.display = 'flex';
                btn.classList.remove('hidden');
            }
        });
    });

    // Force Update Feature (Clear Cache & Reload)
    window.forceUpdate = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => {
                regs.forEach(reg => reg.unregister());
            });
        }
        if ('caches' in window) {
            caches.keys().then(keys => {
                Promise.all(keys.map(key => caches.delete(key))).then(() => window.location.reload());
            });
        } else {
            window.location.reload();
        }
    };
    
    // ==========================================
    // 4. COMPONENT INJECTOR
    // ==========================================

    function inject(path, destinationId, method = 'append') {
        const dest = document.getElementById(destinationId) || document.body;
        if (!dest) return;

        fetch(path + SITE_VERSION)
            .then(res => res.text())
            .then(html => {
                const range = document.createRange();
                range.selectNode(dest); 
                const fragment = range.createContextualFragment(html);

                if (method === 'prepend') dest.insertBefore(fragment, dest.firstChild);
                else dest.appendChild(fragment);

                if (window.lucide) window.lucide.createIcons();
                
                const currentTheme = localStorage.getItem('selected-theme') || 'system';
                updateThemeUI(currentTheme);

                // PWA FIX: If the prompt fired before this component loaded, show buttons now
                if (window.deferredPrompt) {
                    const buttons = document.querySelectorAll('#install-app-btn, #hero-install-btn');
                    buttons.forEach(btn => {
                        btn.hidden = false;
                        btn.style.display = 'flex';
                        btn.classList.remove('hidden');
                    });
                }
            })
            .catch(err => console.error(`Failed to load ${path}`, err));
    }

    // ==========================================
    // 5. BOOTSTRAP
    // ==========================================
    
    function init() {
        // 1. Load Theme CSS
        if (!document.querySelector(`link[href*="${PATHS.themeCss}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = PATHS.themeCss + SITE_VERSION;
            document.head.appendChild(link);
        }

        // 2. Load Navbar (Prepend to Body)
        inject(PATHS.navbar, null, 'prepend'); 

        // 3. Load Footer (Append to Body)
        inject(PATHS.footer, null, 'append');

        // 4. Apply Theme
        initTheme();
        
        // 5. Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('SW Registered');
                reg.update(); // Check for updates immediately
            }).catch(err => console.error('SW Failed:', err));

            // Auto-reload when new version takes control
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

})();