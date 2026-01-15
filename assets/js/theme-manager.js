/**
 * Delhizones Theme Manager
 * Handles switching between Harmonious Color Palettes.
 */

(function() {
    // Available Themes
    const themes = ['default', 'dark', 'nature', 'sunset', 'ocean'];

    function applyTheme(themeName) {
        const root = document.documentElement;
        
        // Remove all previous data-theme attributes
        root.removeAttribute('data-theme');

        if (themeName !== 'default') {
            root.setAttribute('data-theme', themeName);
        }

        // Save to Local Storage
        localStorage.setItem('site-theme', themeName);
        
        // Update Lucide icons (colors might change)
        if(window.lucide) setTimeout(() => window.lucide.createIcons(), 50);
    }

    // Initialize on Load
    const savedTheme = localStorage.getItem('site-theme') || 'default';
    applyTheme(savedTheme);

    // Export function to global scope so buttons can call it
    window.setTheme = applyTheme;
})();