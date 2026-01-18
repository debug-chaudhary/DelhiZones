/**
 * Delhizones Theme Manager (v3.0)
 * Handles Color Switching, Dark Mode, and CSS Variable Injection
 */

// 1. GLOBAL THEME SETTER
window.setTheme = function(themeName) {
    const html = document.documentElement;
    
    // Set the attribute that CSS triggers off (e.g., [data-theme="nature"])
    if (themeName === 'default') {
        html.removeAttribute('data-theme');
    } else {
        html.setAttribute('data-theme', themeName);
    }

    // Save preference
    localStorage.setItem('selected-theme', themeName);
    
    // Update Icons (if they exist in the navbar)
    updateThemeUI(themeName);
};

// 2. BACKWARD COMPATIBILITY (Maps Navbar Buttons to New Themes)
// This ensures your previous Navbar HTML works with the new CSS
window.setColor = function(colorClass) {
    let targetTheme = 'default';

    switch(colorClass) {
        case 'theme-green': targetTheme = 'nature'; break;
        case 'theme-orange': targetTheme = 'sunset'; break;
        case 'theme-purple': targetTheme = 'ocean'; break; // Mapping Purple to Ocean/Cyan for now
        case 'theme-red': targetTheme = 'sunset'; break;   // Mapping Red to Sunset
        default: targetTheme = 'default';
    }
    
    window.setTheme(targetTheme);
};

// 3. DARK MODE TOGGLE (Separate from Color Themes)
window.setMode = function(mode) {
    const html = document.documentElement;
    
    if (mode === 'dark') {
        html.setAttribute('data-theme', 'dark'); // Force Night Mode
        localStorage.setItem('selected-theme', 'dark');
    } else if (mode === 'light') {
        html.removeAttribute('data-theme');      // Revert to Default Light
        localStorage.setItem('selected-theme', 'default');
    } else {
        // System Mode
        localStorage.removeItem('selected-theme');
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            html.setAttribute('data-theme', 'dark');
        } else {
            html.removeAttribute('data-theme');
        }
    }
};

// 4. UI UPDATER (Optional: Changes Icons based on selection)
function updateThemeUI(theme) {
    // Example: You could change the logo color here if needed
    console.log(`Theme switched to: ${theme}`);
}

// 5. INITIALIZE (Runs immediately if loaded late)
(function init() {
    const saved = localStorage.getItem('selected-theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
    }
})();