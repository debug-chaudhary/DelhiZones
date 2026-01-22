/**
 * Site Search Functionality
 * Handles search initialization, filtering, and result display
 */

// Site Search Index - All searchable pages and keywords
const SITE_SEARCH_INDEX = [
    { title: 'Home', path: '/index.html', keywords: ['home', 'main', 'dashboard'] },
    { title: 'About Us', path: '/about.html', keywords: ['about', 'team', 'company', 'info'] },
    { title: 'Contact', path: '/contact.html', keywords: ['contact', 'support', 'help', 'reach'] },
    { title: 'Blog', path: '/blog/', keywords: ['blog', 'articles', 'news', 'updates'] },
    { title: 'Gaming Zones Delhi 2026', path: '/blog/gaming-zones-delhi-2026.html', keywords: ['gaming', 'zones', 'entertainment', 'fun'] },
    { title: 'Kids Zone Delhi', path: '/blog/kids-zone-delhi.html', keywords: ['kids', 'children', 'family', 'activities'] },
    { title: 'Top 10 Gaming Zones Delhi', path: '/blog/top-10-gaming-zones-delhi.html', keywords: ['gaming', 'top', 'best', 'ranking'] },
    { title: 'Jobs', path: '/jobs/', keywords: ['jobs', 'careers', 'employment', 'vacancies'] },
    { title: 'Vacancies Alert 2025', path: '/jobs/vacancies-alert-2025.html', keywords: ['jobs', 'vacancies', 'employment', 'alert'] },
    { title: 'Government Portal', path: '/govt-portal/', keywords: ['government', 'govt', 'portal', 'services'] },
    { title: 'Learning Hub', path: '/learning/', keywords: ['learning', 'education', 'courses', 'tutorials'] },
    { title: 'IGNOU BCA Resources', path: '/learning/ignou-bca-resources/', keywords: ['ignou', 'bca', 'education', 'course'] },
    { title: 'Kids Learning', path: '/learning/kids/', keywords: ['kids', 'learning', 'education', 'games'] },
    { title: 'SEO Resources', path: '/learning/seo/', keywords: ['seo', 'search', 'optimization', 'marketing'] },
    { title: 'Tutor Directory', path: '/learning/tutor/', keywords: ['tutor', 'teacher', 'classes', 'education'] },
    { title: 'Lifestyle', path: '/lifestyle/', keywords: ['lifestyle', 'wellness', 'yoga', 'health'] },
    { title: 'Yoga Classes', path: '/lifestyle/YogaClass.html', keywords: ['yoga', 'fitness', 'wellness', 'exercise'] },
    { title: 'Color Sense', path: '/lifestyle/Colorsense.html', keywords: ['color', 'design', 'art', 'creativity'] },
    { title: 'News', path: '/news/', keywords: ['news', 'latest', 'updates', 'trending'] },
    { title: 'Results', path: '/results/', keywords: ['results', 'announcements', 'notifications'] },
    { title: 'IGNOU Practical Search', path: '/results/ignou-practical-search/', keywords: ['ignou', 'results', 'practical', 'search'] },
    { title: 'Business', path: '/business/', keywords: ['business', 'commerce', 'trade', 'enterprise'] },
    { title: 'Telecom Directory', path: '/telecom/', keywords: ['telecom', 'phone', 'providers', 'network'] },
    { title: 'Telecom Site Data Search', path: '/telecom/site-data-search/', keywords: ['telecom', 'site', 'data', 'search'] },
    { title: 'Telecom MOPS', path: '/telecom/mops/', keywords: ['telecom', 'mops', 'operators'] },
    { title: 'Web Tools', path: '/web-tool/', keywords: ['tools', 'utilities', 'generators', 'web'] },
    { title: 'Ebook Reader', path: '/web-tool/ebook-Reader.html', keywords: ['ebook', 'reader', 'books', 'reading'] },
    { title: 'SEO File Renamer', path: '/web-tool/seo-file-folder-renamer.html', keywords: ['seo', 'file', 'renamer', 'tool'] },
    { title: 'Score Board', path: '/web-tool/ScoreBoard.html', keywords: ['score', 'board', 'game', 'tracking'] },
    { title: 'Prompt Generator', path: '/web-tool/Prompt-Genrator.html', keywords: ['prompt', 'generator', 'ai', 'tool'] },
    { title: 'Top 20 AI', path: '/web-tool/Top20AI.html', keywords: ['ai', 'artificial', 'intelligence', 'tools'] },
    { title: 'Privacy Policy', path: '/privacy.html', keywords: ['privacy', 'policy', 'data', 'protection'] },
    { title: 'Terms & Conditions', path: '/terms.html', keywords: ['terms', 'conditions', 'legal', 'agreement'] },
    { title: 'Donate', path: '/donate.html', keywords: ['donate', 'support', 'contribution', 'help'] },
    { title: 'Subscribe', path: '/subscribe.html', keywords: ['subscribe', 'newsletter', 'updates', 'notifications'] },
];

/**
 * Perform search on query
 * @param {string} query - Search query string
 * @returns {Array} Array of matching results
 */
function performSearch(query) {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const results = SITE_SEARCH_INDEX.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(lowerQuery);
        const keywordMatch = item.keywords.some(kw => kw.includes(lowerQuery));
        return titleMatch || keywordMatch;
    });

    return results.slice(0, 8); // Limit to 8 results
}

/**
 * Display search results in the results container
 * @param {Array} results - Search results to display
 * @param {string} query - Original search query
 */
function displaySearchResults(results, query) {
    const resultsContainer = document.getElementById('search-results');
    
    if (!resultsContainer) {
        console.warn('Search results container not found');
        return;
    }
    
    if (!results.length && query) {
        resultsContainer.innerHTML = '<div class="px-4 py-3 text-sm opacity-70">No results found for "' + query + '"</div>';
        return;
    }

    if (!query) {
        resultsContainer.innerHTML = '';
        return;
    }

    resultsContainer.innerHTML = results.map((item, idx) => `
        <a href="${item.path}" 
           class="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/10 text-sm border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
           role="option">
            <div class="font-medium">${highlightMatch(item.title, query)}</div>
            <div class="text-xs opacity-60 mt-0.5">${item.title}</div>
        </a>
    `).join('');
}

/**
 * Highlight matching text in search results
 * @param {string} text - Text to highlight in
 * @param {string} query - Search query to highlight
 * @returns {string} HTML string with highlighted text
 */
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-700 font-bold">$1</mark>');
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('site-search');
    const searchResults = document.getElementById('search-results');
    const searchIcon = document.getElementById('search-icon');
    const searchCloseIcon = document.getElementById('search-close-icon');
    const searchContainer = document.querySelector('.search-container');
    const searchBar = document.querySelector('.search-bar');

    if (!searchInput) {
        console.warn('Search components not found in DOM');
        return;
    }

    // Click search icon to expand
    if (searchIcon) {
        searchIcon.addEventListener('click', e => {
            e.stopPropagation();
            searchContainer?.classList.add('expanded');
            searchInput.focus();
        });
    }

    // Show/hide close icon based on input value
    searchInput.addEventListener('input', e => {
        const query = e.target.value;
        const results = performSearch(query);
        displaySearchResults(results, query);
        
        // Toggle close icon visibility
        if (query.length > 0) {
            searchCloseIcon?.classList.remove('hidden');
        } else {
            searchCloseIcon?.classList.add('hidden');
        }
        
        if (results.length > 0 || query) {
            searchResults?.classList.remove('hidden');
        } else {
            searchResults?.classList.add('hidden');
        }
    });

    // Focus event - expand and show results
    searchInput.addEventListener('focus', e => {
        searchContainer?.classList.add('expanded');
        searchIcon?.classList.add('search-icon-focused');
        
        const query = e.target.value;
        const results = performSearch(query);
        
        if (results.length > 0 || query) {
            searchResults?.classList.remove('hidden');
        }
    });

    // Escape key to close
    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            searchResults?.classList.add('hidden');
            searchInput.value = '';
            searchContainer?.classList.remove('expanded');
            searchInput.blur();
        }
    });

    // Clear search on close icon click
    if (searchCloseIcon) {
        searchCloseIcon.addEventListener('click', e => {
            e.stopPropagation();
            searchInput.value = '';
            searchCloseIcon.classList.add('hidden');
            searchResults?.classList.add('hidden');
            searchContainer?.classList.remove('expanded');
            searchInput.focus();
        });
    }

    // Close search on outside click
    document.addEventListener('click', e => {
        if (!e.target.closest('.search-container')) {
            searchResults?.classList.add('hidden');
            if (searchInput.value.trim() === '') {
                searchContainer?.classList.remove('expanded');
            }
        }
    });
}

// Initialize search when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearch);
} else {
    initializeSearch();
}
