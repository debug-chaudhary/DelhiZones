// Site database management
let currentSiteDatabase = [];
let uploadedSiteData = null;
let isUsingUploadedData = false;

// Default site database with comprehensive site information
const defaultSiteDatabase = [
    {
        siteId: 'DL001',
        siteName: 'CP Tower Alpha',
        circle: 'Delhi',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Connaught Place, Block A, New Delhi - 110001, Near Metro Station, Opposite PVR Cinema',
        coordinates: { lat: '28.6304', lng: '77.2177' },
        ipId: 'IP-DL-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2022-03-15',
        lastMaintenance: '2024-08-20',
        operator: 'Airtel',
        height: '45m',
        power: 'Grid + DG'
    },
    {
        siteId: 'DL002',
        siteName: 'Rohini Hub Beta',
        circle: 'Delhi',
        siteType: 'Macro',
        status: 'active',
        technologies: ['3G', '4G', '5G'],
        address: 'Sector 7, Rohini, New Delhi - 110085, Near Unity Mall, Behind Bus Stand',
        coordinates: { lat: '28.7041', lng: '77.1025' },
        ipId: 'IP-DL-002',
        bands: 'Band 1, Band 3, Band 8, Band 40',
        sectors: '3 Sectors',
        installDate: '2021-11-28',
        lastMaintenance: '2024-09-05',
        operator: 'Jio',
        height: '40m',
        power: 'Grid + Solar'
    },
    {
        siteId: 'MH001',
        siteName: 'Bandra West Central',
        circle: 'Mumbai',
        siteType: 'Macro',
        status: 'maintenance',
        technologies: ['4G'],
        address: 'Hill Road, Bandra West, Mumbai - 400050, Near Bandra Station, Opposite Shoppers Stop',
        coordinates: { lat: '19.0596', lng: '72.8295' },
        ipId: 'IP-MH-001',
        bands: 'Band 1, Band 3, Band 40',
        sectors: '3 Sectors',
        installDate: '2020-07-12',
        lastMaintenance: '2024-09-10',
        operator: 'Vodafone',
        height: '35m',
        power: 'Grid'
    },
    {
        siteId: 'MH002',
        siteName: 'Andheri East Plaza',
        circle: 'Mumbai',
        siteType: 'Small Cell',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'SEEPZ, Andheri East, Mumbai - 400093, Near Metro Station, IT Park Complex',
        coordinates: { lat: '19.1136', lng: '72.8697' },
        ipId: 'IP-MH-002',
        bands: 'Band 40, Band 78',
        sectors: '1 Sector',
        installDate: '2023-01-20',
        lastMaintenance: '2024-07-15',
        operator: 'Airtel',
        height: '20m',
        power: 'Grid'
    },
    {
        siteId: 'BG001',
        siteName: 'Electronic City Hub',
        circle: 'Bangalore',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Phase 1, Electronic City, Bangalore - 560100, Near Infosys Campus, Tech Park Area',
        coordinates: { lat: '12.8456', lng: '77.6603' },
        ipId: 'IP-BG-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2022-09-10',
        lastMaintenance: '2024-08-25',
        operator: 'Jio',
        height: '50m',
        power: 'Grid + DG'
    },
    {
        siteId: 'BG002',
        siteName: 'Whitefield Junction',
        circle: 'Bangalore',
        siteType: 'Macro',
        status: 'active',
        technologies: ['3G', '4G'],
        address: 'ITPL Main Road, Whitefield, Bangalore - 560066, Near Forum Mall, IT Corridor',
        coordinates: { lat: '12.9698', lng: '77.7500' },
        ipId: 'IP-BG-002',
        bands: 'Band 1, Band 3, Band 40',
        sectors: '3 Sectors',
        installDate: '2021-05-18',
        lastMaintenance: '2024-06-30',
        operator: 'Vodafone',
        height: '42m',
        power: 'Grid'
    },
    {
        siteId: 'CH001',
        siteName: 'OMR Tech Tower',
        circle: 'Chennai',
        siteType: 'Macro',
        status: 'active',
        technologies: ['4G', '5G'],
        address: 'Old Mahabalipuram Road, Thoraipakkam, Chennai - 600097, Near Sholinganallur, IT Highway',
        coordinates: { lat: '12.9010', lng: '80.2279' },
        ipId: 'IP-CH-001',
        bands: 'Band 1, Band 3, Band 40, Band 78',
        sectors: '3 Sectors',
        installDate: '2022-12-05',
        lastMaintenance: '2024-09-01',
        operator: 'Airtel',
        height: '48m',
        power: 'Grid + Solar'
    }
];

// Initialize current database with default data
currentSiteDatabase = [...defaultSiteDatabase];

// Resource mapping data
const resourceMapping = {
    'HR02': 'Rohit Rajput',
    'HR03': 'Sanjay Kumar',
    'HR04': 'Maman',
    'HR05': 'Monu',
    'HR06': 'Sukrampal',
    'HR07': 'Rohit Kumar Chaudhary',
    'HR08': 'Navneet Kumar',
    'HR 09': 'Anoop Kumar',
    'HR10': 'Suresh Sharma',
    'HR12': 'Anil Kumar',
    'HR13': 'Pawn Gupta',
    'HR14': 'Sumit Rana'
};

const nameToCodeMapping = {
    'Rohit Rajput': 'HR02',
    'Sanjay Kumar': 'HR03',
    'Maman': 'HR04',
    'Monu': 'HR05',
    'Sukrampal': 'HR06',
    'Rohit Kumar Chaudhary': 'HR07',
    'Navneet Kumar': 'HR08',
    'Anoop Kumar': 'HR 09',
    'Suresh Sharma': 'HR10',
    'Anil Kumar': 'HR12',
    'Pawn Gupta': 'HR13',
    'Sumit Rana': 'HR14'
};

let engineeringUpdates = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadUpdates();
    setCurrentDateTime();
    updateDashboard();
    setupDragAndDrop();
    updateFilterOptions();
    initializeChat();
});

// Check if user is authenticated
function checkAuthentication() {
    const session = localStorage.getItem('userSession');
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const sessionData = JSON.parse(session);
    if (sessionData.isAdmin) {
        window.location.href = 'admin.html';
        return;
    }

    // Check session validity (24 hours)
    const loginTime = new Date(sessionData.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
        return;
    }

    // Update UI with user info
    updateUserInterface(sessionData);
    
    // Load user-specific data
    loadUserData(sessionData);
}

// Update user interface with session data
function updateUserInterface(sessionData) {
    // Update header to show user info
    const header = document.querySelector('.header');
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
        <div class="user-details">
            <span class="user-name">Welcome, ${sessionData.name}</span>
            <span class="user-group">${sessionData.groupName} | ${sessionData.role}</span>
        </div>
        <button class="btn-secondary logout-btn" onclick="logout()">Logout</button>
    `;
    
    // Add user info to header
    header.appendChild(userInfo);
    
    // Pre-fill resource fields with user data
    if (sessionData.resourceCode) {
        const resourceCodeSelect = document.getElementById('resourceCode');
        const resourceNameSelect = document.getElementById('resourceName');
        if (resourceCodeSelect) resourceCodeSelect.value = sessionData.resourceCode;
        if (resourceNameSelect) resourceNameSelect.value = sessionData.name;
    }
}

// Load user-specific data
function loadUserData(sessionData) {
    // Load user's updates from group storage
    const groupUpdates = JSON.parse(localStorage.getItem(`groupUpdates_${sessionData.groupId}`) || '[]');
    const userUpdates = groupUpdates.filter(update => update.resourceCode === sessionData.resourceCode);
    
    // Set engineeringUpdates to user's updates for dashboard
    engineeringUpdates = userUpdates;
}

// Initialize chat system
function initializeChat() {
    // Chat system will be loaded from separate file
    setTimeout(() => {
        if (typeof ChatSystem !== 'undefined') {
            new ChatSystem();
        }
    }, 1000);
}

// Logout function
function logout() {
    const confirm = window.confirm('Are you sure you want to logout?');
    if (confirm) {
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    }
}

function updateResourceName() {
    const resourceCode = document.getElementById('resourceCode').value;
    const resourceNameSelect = document.getElementById('resourceName');
    
    if (resourceCode && resourceMapping[resourceCode]) {
        resourceNameSelect.value = resourceMapping[resourceCode];
    } else {
        resourceNameSelect.value = '';
    }
}

function updateResourceCode() {
    const resourceName = document.getElementById('resourceName').value;
    const resourceCodeSelect = document.getElementById('resourceCode');
    
    if (resourceName && nameToCodeMapping[resourceName]) {
        resourceCodeSelect.value = nameToCodeMapping[resourceName];
    } else {
        resourceCodeSelect.value = '';
    }
}

function setCurrentDateTime() {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16);
    const date = now.toISOString().slice(0, 10);
    
    document.getElementById('timestamp').value = timestamp;
    document.getElementById('date').value = date;
}

function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all nav buttons
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    event.target.classList.add('active');
    
    if (sectionName === 'dashboard') {
        updateDashboard();
    } else if (sectionName === 'updates') {
        displayUpdates();
        updateFilters();
    } else if (sectionName === 'siteSearch') {
        // Initialize site search with all sites
        setupDragAndDrop();
        searchSites();
    }
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function validateForm() {
    const requiredFields = document.querySelectorAll('.required');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#f56565';
            isValid = false;
        } else {
            field.style.borderColor = '#e2e8f0';
        }
    });
    
    return isValid;
}

// Override submitUpdate to save to group storage
function submitUpdate(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showAlert('Please fill in all required fields.', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-primary');
    const submitText = document.getElementById('submitText');
    const submitLoader = document.getElementById('submitLoader');
    
    submitText.style.display = 'none';
    submitLoader.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        const sessionData = JSON.parse(localStorage.getItem('userSession'));
        
        const formData = {
            id: Date.now(),
            timestamp: document.getElementById('timestamp').value,
            resourceCode: document.getElementById('resourceCode').value,
            resourceName: document.getElementById('resourceName').value,
            mediaTestPlan: document.getElementById('mediaTestPlan').value,
            date: document.getElementById('date').value,
            circle: document.getElementById('circle').value,
            location: document.getElementById('location').value,
            ipId: document.getElementById('ipId').value,
            siteName: document.getElementById('siteName').value,
            mediaType: document.getElementById('mediaType').value,
            mediaRemarks: document.getElementById('mediaRemarks').value,
            mediaStatus: document.getElementById('mediaStatus').value,
            activity: document.getElementById('activity').value,
            activityStatus: document.getElementById('activityStatus').value,
            remarks: document.getElementById('remarks').value,
            bands: document.getElementById('bands').value,
            sectors: document.getElementById('sectors').value,
            updatedActivity: document.getElementById('updatedActivity').value,
            projectCategory: document.getElementById('projectCategory').value,
            createdAt: new Date().toISOString(),
            userId: sessionData.userId,
            groupId: sessionData.groupId
        };
        
        // Add to local array
        engineeringUpdates.unshift(formData);
        
        // Save to group storage
        const groupUpdates = JSON.parse(localStorage.getItem(`groupUpdates_${sessionData.groupId}`) || '[]');
        groupUpdates.unshift(formData);
        localStorage.setItem(`groupUpdates_${sessionData.groupId}`, JSON.stringify(groupUpdates));
        
        // Save to personal storage
        saveUpdates();
        
        document.getElementById('updateForm').reset();
        setCurrentDateTime();
        
        showAlert('Update submitted successfully!');
        updateDashboard();
        
        submitText.style.display = 'inline';
        submitLoader.style.display = 'none';
        submitBtn.disabled = false;
    }, 1000);
}

function saveUpdates() {
    // In a real application, this would save to a backend database
    console.log('Updates saved:', engineeringUpdates.length);
}

function loadUpdates() {
    // Load sample data if no user data exists
    if (engineeringUpdates.length === 0) {
        engineeringUpdates = [
            {
                id: 1,
                timestamp: '2024-09-12T09:30',
                resourceCode: 'HR02',
                resourceName: 'Rohit Rajput',
                mediaTestPlan: 'MTP-001',
                date: '2024-09-12',
                circle: 'Delhi',
                location: 'Connaught Place',
                ipId: 'IP-001',
                siteName: 'CP-Tower-01',
                mediaType: '5G',
                mediaRemarks: 'Signal strength optimal',
                mediaStatus: 'Active',
                activity: 'Network optimization',
                activityStatus: 'Completed',
                remarks: 'All tests passed successfully',
                bands: 'Band 78, Band 40',
                sectors: 'Sector 1, Sector 2',
                updatedActivity: 'Completed optimization and testing',
                projectCategory: 'Network Optimization',
                createdAt: '2024-09-12T09:30:00Z'
            }
        ];
    }
}

function updateDashboard() {
    const totalUpdates = engineeringUpdates.length;
    const activeProjects = new Set(engineeringUpdates.map(u => u.projectCategory)).size;
    const today = new Date().toISOString().slice(0, 10);
    const todayUpdates = engineeringUpdates.filter(u => u.date === today).length;
    const pendingItems = engineeringUpdates.filter(u => u.activityStatus === 'Pending').length;

    document.getElementById('totalUpdates').textContent = totalUpdates;
    document.getElementById('activeProjects').textContent = activeProjects;
    document.getElementById('todayUpdates').textContent = todayUpdates;
    document.getElementById('pendingItems').textContent = pendingItems;

    displayDashboardTable();
}

function displayDashboardTable() {
    const tbody = document.getElementById('dashboardTable');
    const recentUpdates = engineeringUpdates.slice(0, 10);

    if (recentUpdates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-updates">No updates available. Add your first update to get started!</td></tr>';
        return;
    }

    tbody.innerHTML = recentUpdates.map(update => `
        <tr>
            <td>${formatDate(update.date)}</td>
            <td>${update.projectCategory}</td>
            <td>${update.siteName}</td>
            <td>${update.activity}</td>
            <td><span class="status-badge status-${update.activityStatus.toLowerCase().replace(' ', '-')}">${update.activityStatus}</span></td>
            <td>${update.resourceName}</td>
        </tr>
    `).join('');
}

function displayUpdates(filteredUpdates = null) {
    const updates = filteredUpdates || engineeringUpdates;
    const tbody = document.getElementById('updatesTable');

    if (updates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-updates">No updates found. Use the filters to refine your search.</td></tr>';
        return;
    }

    tbody.innerHTML = updates.map(update => `
        <tr>
            <td>${formatDateTime(update.timestamp)}</td>
            <td>${update.resourceName}<br><small>${update.resourceCode}</small></td>
            <td>${update.siteName}</td>
            <td>${update.location}</td>
            <td>${update.activity}</td>
            <td><span class="status-badge status-${update.activityStatus.toLowerCase().replace(' ', '-')}">${update.activityStatus}</span></td>
            <td>${update.mediaType || 'N/A'}</td>
            <td>${update.projectCategory}</td>
            <td>
                <button class="btn-secondary" onclick="viewDetails(${update.id})">View</button>
            </td>
        </tr>
    `).join('');
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Additional functions for site search and file upload
function searchSites() {
    // Site search functionality
    console.log('Site search functionality');
}

function handleSiteFileUpload(event) {
    // File upload functionality
    console.log('File upload functionality');
}

function setupDragAndDrop() {
    // Drag and drop functionality
    console.log('Drag and drop setup');
}

function updateFilterOptions() {
    // Update filter options
    console.log('Filter options updated');
}

// Event Listeners
document.getElementById('updateForm').addEventListener('submit', submitUpdate);

// Initialize
updateFilters = function() {
    const projects = [...new Set(engineeringUpdates.map(u => u.projectCategory))];
    
    const projectFilters = [
        document.getElementById('projectFilter'),
        document.getElementById('dashboardProjectFilter')
    ];
    
    projectFilters.forEach(filter => {
        if (filter) {
            const currentValue = filter.value;
            filter.innerHTML = '<option value="">All Projects</option>' +
                projects.map(project => `<option value="${project}">${project}</option>`).join('');
            filter.value = currentValue;
        }
    });
};