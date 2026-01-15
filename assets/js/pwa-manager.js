/**
 * Delhizones PWA Manager
 * Centralizes the "Install App" logic.
 * * Features:
 * 1. Captures the 'beforeinstallprompt' event.
 * 2. Exposes a global 'window.installPWA()' function.
 * 3. Automatically finds and un-hides install buttons in Navbar/Footer/Body.
 * 4. Uses MutationObserver to detect when loader.js injects new buttons.
 */

(function () {
    window.deferredPrompt = null;

    // List of IDs used for install buttons across the site
    const installButtonIDs = [
        'install-app-btn',          // Desktop Navbar
        'mobile-install-app-btn',   // Mobile Menu
        'footer-install-btn',       // Footer
        'hero-install-btn'          // Homepage Hero
    ];

    // Function to reveal buttons
    function showInstallButtons() {
        if (!window.deferredPrompt) return;
        
        installButtonIDs.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.remove('hidden');
                // Ensure the click handler is attached
                // We use onclick attribute in HTML usually, but this is a failsafe
                btn.onclick = window.installPWA; 
            }
        });
    }

    // Function to hide buttons (after install)
    function hideInstallButtons() {
        installButtonIDs.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.add('hidden');
        });
    }

    // 1. Listen for the browser event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        window.deferredPrompt = e;
        console.log('PWA: Install Prompt Captured');
        
        // Show any buttons that are already on the page
        showInstallButtons();
    });

    // 2. Global Install Function (called by buttons)
    window.installPWA = async () => {
        if (!window.deferredPrompt) return;
        
        // Show the install prompt
        window.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await window.deferredPrompt.userChoice;
        console.log(`PWA: User response to install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        window.deferredPrompt = null;
        
        // Hide buttons
        hideInstallButtons();
    };

    // 3. Handle successful installation
    window.addEventListener('appinstalled', () => {
        console.log('PWA: App installed successfully');
        window.deferredPrompt = null;
        hideInstallButtons();
    });

    // 4. MutationObserver: Watch for loader.js injecting the navbar/footer
    // This ensures that if the prompt fires BEFORE the navbar loads, 
    // we still show the buttons the moment they appear.
    const observer = new MutationObserver((mutations) => {
        if (window.deferredPrompt) {
            showInstallButtons();
        }
    });

    // Start observing the body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });

})();