// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' 
            ? 'light' 
            : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

document.addEventListener('DOMContentLoaded', initThemeToggle);

// Simple page view tracking
function trackPageView() {
    const data = {
        page: window.location.pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer
    };
    // Store locally for privacy
    const views = JSON.parse(localStorage.getItem('pageViews') || '[]');
    views.push(data);
    localStorage.setItem('pageViews', JSON.stringify(views.slice(-100)));
}

// Track popular content
function trackContentEngagement(contentType, contentId) {
    const engagement = JSON.parse(localStorage.getItem('contentEngagement') || '{}');
    const key = `${contentType}-${contentId}`;
    engagement[key] = (engagement[key] || 0) + 1;
    localStorage.setItem('contentEngagement', JSON.stringify(engagement));
}

document.addEventListener('DOMContentLoaded', () => {
    trackPageView();
    // Track video plays
    document.querySelectorAll('iframe[src*="youtube"]').forEach(iframe => {
        iframe.addEventListener('load', () => {
            trackContentEngagement('video', iframe.src);
        });
    });
});

// Lazy loading for images and videos
function initLazyLoading() {
    const lazyElements = document.querySelectorAll('[data-src]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.src = element.dataset.src;
                element.removeAttribute('data-src');
                observer.unobserve(element);
            }
        });
    });
    lazyElements.forEach(element => observer.observe(element));
}

document.addEventListener('DOMContentLoaded', initLazyLoading);
// Stylish Search Bar Logic
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('mainSearch');
    const searchBtn = document.getElementById('mainSearchBtn');
    const resultsBox = document.getElementById('mainSearchResults');
    const searchData = [
        // Semesters
        { title: "Semester 1", url: "semester1/index.html" },
        { title: "Semester 2", url: "semester2/index.html" },
        { title: "Semester 3", url: "semester3/index.html" },
        { title: "Semester 4", url: "semester4/index.html" },
        { title: "Semester 5", url: "semester5/index.html" },
        { title: "Semester 6", url: "semester6/index.html" },
        // Subjects
        { title: "BCS-011 Computer Fundamentals", url: "semester1/bcs11.html" },
        { title: "BCS-012 Basic Mathematics", url: "semester1/bcs12.html" },
        { title: "MCS-11 Problem Solving and Programming", url: "semester2/mcs11.html" },
        { title: "MCS-12 Computer Org and Assembly Language Programming", url: "semester2/mcs12.html" },
        { title: "MCS-13 Discrete Mathematics", url: "semester2/mcs13.html" },
        // Ebooks
        { title: "Ebooks Collection", url: "downloads/ebooks/" },
        { title: "Computer Fundamentals eBook", url: "downloads/ebooks/computer-fundamentals.pdf" },
        { title: "Mathematics eBook", url: "downloads/ebooks/mathematics.pdf" },
        // Syllabus
        { title: "Complete Syllabus", url: "downloads/syllabus/" },
        { title: "Semester 1 Syllabus", url: "downloads/syllabus/semester1.pdf" },
        // Previous Papers
        { title: "Previous Year Papers", url: "downloads/previous-papers/" },
        // Video Lectures
        { title: "Video Lectures", url: "resources/youtube-lectures.html" },
        { title: "C Programming Tutorial", url: "resources/videos.html#c-programming" }
    ];

    function showResults(results) {
        if (results.length === 0) {
            resultsBox.innerHTML = '<div class="search-bar-result-item">No results found</div>';
        } else {
            resultsBox.innerHTML = results.map(item => `<div class="search-bar-result-item" data-url="${item.url}">${item.title}</div>`).join('');
        }
        resultsBox.style.display = 'block';
    }

    function doSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length === 0) {
            resultsBox.style.display = 'none';
            return;
        }
        // Show all results if query is empty, else filter
        const filtered = searchData.filter(item => item.title.toLowerCase().includes(query));
        showResults(filtered);
    }

    searchInput.addEventListener('input', doSearch);
    searchBtn.addEventListener('click', doSearch);

    resultsBox.addEventListener('click', function(e) {
        if (e.target.classList.contains('search-bar-result-item') && e.target.dataset.url) {
            window.location.href = e.target.dataset.url;
        }
    });

    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !resultsBox.contains(e.target) && !searchBtn.contains(e.target)) {
            resultsBox.style.display = 'none';
        }
    });
});
