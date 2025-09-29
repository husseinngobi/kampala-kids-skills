// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('adminToken');
        this.currentSection = 'dashboard';
        this.isLoggedIn = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // User menu
        document.getElementById('userMenuBtn').addEventListener('click', () => {
            this.toggleUserDropdown();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.fixed');
                this.closeModal(modal);
            });
        });

        // Export buttons
        document.getElementById('exportEnrollments')?.addEventListener('click', () => {
            this.exportData('enrollments');
        });

        // Filters
        document.getElementById('statusFilter')?.addEventListener('change', () => {
            this.loadEnrollments();
        });

        document.getElementById('searchEnrollments')?.addEventListener('input', 
            this.debounce(() => this.loadEnrollments(), 500)
        );

        document.getElementById('dateFromFilter')?.addEventListener('change', () => {
            this.loadEnrollments();
        });

        document.getElementById('dateToFilter')?.addEventListener('change', () => {
            this.loadEnrollments();
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#userMenuBtn')) {
                document.getElementById('userDropdown').classList.add('hidden');
            }
        });
    }

    checkAuthStatus() {
        if (this.token) {
            this.validateToken();
        } else {
            this.showLogin();
        }
    }

    async validateToken() {
        try {
            const response = await fetch(`${this.baseURL}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.isLoggedIn = true;
                this.showDashboard();
                this.loadDashboardData();
            } else {
                throw new Error('Invalid token');
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            this.showLogin();
        }
    }

    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');

        try {
            this.showLoading('Logging in...');

            const response = await fetch(`${this.baseURL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.data.token;
                localStorage.setItem('adminToken', this.token);
                localStorage.setItem('adminUser', JSON.stringify(data.data.admin));
                
                this.isLoggedIn = true;
                this.showDashboard();
                this.loadDashboardData();
                this.showNotification('Login successful!', 'success');
            } else {
                errorDiv.textContent = data.message || 'Login failed';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = 'Login failed. Please try again.';
            errorDiv.classList.remove('hidden');
        } finally {
            this.hideLoading();
        }
    }

    logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        this.token = null;
        this.isLoggedIn = false;
        this.showLogin();
        this.showNotification('Logged out successfully', 'info');
    }

    showLogin() {
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('dashboardContent').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('dashboardContent').classList.remove('hidden');
        
        // Set admin name
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
        document.getElementById('adminName').textContent = 
            `${adminUser.firstName || 'Admin'} ${adminUser.lastName || ''}`.trim();
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        // Show selected section
        const section = document.getElementById(sectionName);
        if (section) {
            section.classList.remove('hidden');
            section.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

        this.currentSection = sectionName;

        // Load section data
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'enrollments':
                this.loadEnrollments();
                break;
            case 'inquiries':
                this.loadInquiries();
                break;
            case 'videos':
                this.loadVideos();
                break;
        }
    }

    async loadDashboardData() {
        try {
            const response = await fetch(`${this.baseURL}/admin/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to load dashboard data');

            const data = await response.json();
            
            if (data.success) {
                this.updateDashboardStats(data.data.stats);
                this.updateRecentActivities(data.data.recentActivities);
                this.updateSidebarCounts(data.data.stats);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('totalEnrollments').textContent = stats.enrollments.total;
        document.getElementById('activeChildren').textContent = stats.users.totalChildren;
        document.getElementById('newInquiries').textContent = stats.inquiries.new;
        
        const revenue = new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0
        }).format(stats.revenue.total);
        document.getElementById('totalRevenue').textContent = revenue;
    }

    updateRecentActivities(activities) {
        // Update recent enrollments
        const enrollmentsContainer = document.getElementById('recentEnrollments');
        if (activities.enrollments && activities.enrollments.length > 0) {
            enrollmentsContainer.innerHTML = activities.enrollments.map(enrollment => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p class="font-medium">${enrollment.childName}</p>
                        <p class="text-sm text-gray-600">${enrollment.programme}</p>
                    </div>
                    <span class="status-badge status-${enrollment.status.toLowerCase()}">${enrollment.status}</span>
                </div>
            `).join('');
        } else {
            enrollmentsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No recent enrollments</p>';
        }

        // Update recent inquiries
        const inquiriesContainer = document.getElementById('recentInquiries');
        if (activities.inquiries && activities.inquiries.length > 0) {
            inquiriesContainer.innerHTML = activities.inquiries.map(inquiry => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p class="font-medium">${inquiry.name}</p>
                        <p class="text-sm text-gray-600">${inquiry.subject || inquiry.inquiryType}</p>
                    </div>
                    <span class="status-badge status-${inquiry.status.toLowerCase()}">${inquiry.status}</span>
                </div>
            `).join('');
        } else {
            inquiriesContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No recent inquiries</p>';
        }
    }

    updateSidebarCounts(stats) {
        document.getElementById('enrollmentCount').textContent = stats.enrollments.pending;
        document.getElementById('inquiryCount').textContent = stats.inquiries.new;
        document.getElementById('videoCount').textContent = stats.videos.total;

        // Update notification badge
        const totalNotifications = stats.enrollments.pending + stats.inquiries.new;
        const badge = document.getElementById('notificationBadge');
        if (totalNotifications > 0) {
            badge.textContent = totalNotifications;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    async loadEnrollments(page = 1) {
        try {
            const filters = {
                page,
                limit: 20,
                status: document.getElementById('statusFilter')?.value || 'all',
                search: document.getElementById('searchEnrollments')?.value || '',
                dateFrom: document.getElementById('dateFromFilter')?.value || '',
                dateTo: document.getElementById('dateToFilter')?.value || ''
            };

            const queryString = new URLSearchParams(filters).toString();
            const response = await fetch(`${this.baseURL}/admin/enrollments?${queryString}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to load enrollments');

            const data = await response.json();
            
            if (data.success) {
                this.renderEnrollmentsTable(data.data, data.pagination);
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
            this.showNotification('Failed to load enrollments', 'error');
        }
    }

    renderEnrollmentsTable(enrollments, pagination) {
        const tableContainer = document.getElementById('enrollmentsTable');
        
        if (enrollments.length === 0) {
            tableContainer.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-users text-4xl mb-4"></i>
                    <p>No enrollments found</p>
                </div>
            `;
            return;
        }

        const table = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Child</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${enrollments.map(enrollment => `
                        <tr class="table-row">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">${enrollment.child.name}</div>
                                    <div class="text-sm text-gray-500">Age: ${enrollment.child.age}, ${enrollment.child.gender}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div class="text-sm font-medium text-gray-900">${enrollment.parent.name}</div>
                                    <div class="text-sm text-gray-500">${enrollment.parent.email}</div>
                                    <div class="text-sm text-gray-500">${enrollment.parent.phone}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${enrollment.programme}</div>
                                <div class="text-sm text-gray-500">${enrollment.session.dates}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="status-badge status-${enrollment.status.toLowerCase()}">${enrollment.status}</span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">UGX ${enrollment.totalFee.toLocaleString()}</div>
                                <div class="text-sm text-gray-500">Paid: UGX ${enrollment.amountPaid.toLocaleString()}</div>
                                ${enrollment.balanceDue > 0 ? `<div class="text-sm text-red-600">Due: UGX ${enrollment.balanceDue.toLocaleString()}</div>` : ''}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${new Date(enrollment.createdAt).toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onclick="dashboard.viewEnrollment('${enrollment.id}')" class="text-blue-600 hover:text-blue-900 mr-3">View</button>
                                <button onclick="dashboard.updateEnrollmentStatus('${enrollment.id}')" class="text-green-600 hover:text-green-900">Update</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${this.renderPagination(pagination)}
        `;

        tableContainer.innerHTML = table;
    }

    renderPagination(pagination) {
        if (pagination.totalPages <= 1) return '';

        let pages = [];
        for (let i = 1; i <= pagination.totalPages; i++) {
            pages.push(i);
        }

        return `
            <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button onclick="dashboard.loadEnrollments(${pagination.page - 1})" 
                            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${pagination.page === 1 ? 'disabled' : ''}>
                        Previous
                    </button>
                    <button onclick="dashboard.loadEnrollments(${pagination.page + 1})"
                            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${pagination.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                            ${pagination.page === pagination.totalPages ? 'disabled' : ''}>
                        Next
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Showing <span class="font-medium">${(pagination.page - 1) * pagination.limit + 1}</span>
                            to <span class="font-medium">${Math.min(pagination.page * pagination.limit, pagination.total)}</span>
                            of <span class="font-medium">${pagination.total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            ${pages.map(page => `
                                <button onclick="dashboard.loadEnrollments(${page})"
                                        class="relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                               ${page === pagination.page 
                                                 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                                 : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}">
                                    ${page}
                                </button>
                            `).join('')}
                        </nav>
                    </div>
                </div>
            </div>
        `;
    }

    async viewEnrollment(enrollmentId) {
        // This would show enrollment details in a modal
        console.log('Viewing enrollment:', enrollmentId);
        this.showNotification('Enrollment details feature coming soon!', 'info');
    }

    async updateEnrollmentStatus(enrollmentId) {
        // This would show a status update form
        console.log('Updating enrollment:', enrollmentId);
        this.showNotification('Status update feature coming soon!', 'info');
    }

    async exportData(type) {
        try {
            const response = await fetch(`${this.baseURL}/admin/export/${type}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            this.showNotification(`${type} exported successfully!`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification(`Failed to export ${type}`, 'error');
        }
    }

    async loadInquiries() {
        // Placeholder for inquiries loading
        this.showNotification('Inquiries management coming soon!', 'info');
    }

    async loadVideos() {
        try {
            this.showLoading('Loading videos...');
            
            // Load video analytics first
            await this.loadVideoAnalytics();
            
            // Load videos list
            await this.loadVideosList();
            
            // Setup video management event listeners
            this.setupVideoEventListeners();
            
        } catch (error) {
            console.error('Error loading videos:', error);
            this.showNotification('Failed to load videos', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async loadVideoAnalytics() {
        try {
            const response = await fetch(`${this.baseURL}/admin/videos/analytics/overview`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load video analytics');
            }

            const result = await response.json();
            const analytics = result.data;

            // Update analytics cards
            document.getElementById('totalVideosCount').textContent = analytics.overview.total;
            document.getElementById('publicVideosCount').textContent = analytics.overview.public;
            document.getElementById('featuredVideosCount').textContent = analytics.overview.featured;
            document.getElementById('totalVideoSize').textContent = this.formatFileSize(analytics.overview.totalSize);

        } catch (error) {
            console.error('Error loading video analytics:', error);
            this.showNotification('Failed to load video analytics', 'error');
        }
    }

    async loadVideosList(page = 1, filters = {}) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...filters
            });

            const response = await fetch(`${this.baseURL}/admin/videos?${params}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load videos');
            }

            const result = await response.json();
            this.renderVideosTable(result.data.videos, result.data.pagination);

        } catch (error) {
            console.error('Error loading videos:', error);
            this.showNotification('Failed to load videos', 'error');
        }
    }

    renderVideosTable(videos, pagination) {
        const tableBody = document.getElementById('videosTableBody');
        
        if (videos.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-video text-4xl mb-4"></i>
                        <p>No videos found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = videos.map(video => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" class="video-checkbox rounded" value="${video.id}">
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-16 w-24">
                            <video class="h-16 w-24 rounded object-cover" muted>
                                <source src="${video.url}" type="${video.mimeType}">
                                <div class="h-16 w-24 bg-gray-200 rounded flex items-center justify-center">
                                    <i class="fas fa-video text-gray-400"></i>
                                </div>
                            </video>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${this.escapeHtml(video.title)}</div>
                            <div class="text-sm text-gray-500">${this.escapeHtml(video.originalName)}</div>
                            ${video.isFeatured ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><i class="fas fa-star mr-1"></i>Featured</span>' : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        ${this.formatCategory(video.category)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge status-${video.status.toLowerCase()}">${video.status}</span>
                    ${!video.isPublic ? '<div class="text-xs text-gray-500 mt-1">Private</div>' : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${video.views.toLocaleString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatFileSize(video.fileSize)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${new Date(video.uploadedAt).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="dashboard.editVideo('${video.id}')" class="text-blue-600 hover:text-blue-900 mr-3" title="Edit Video">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="dashboard.viewVideo('${video.id}')" class="text-green-600 hover:text-green-900 mr-3" title="View Video">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="dashboard.deleteVideo('${video.id}')" class="text-red-600 hover:text-red-900" title="Delete Video">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Update pagination info
        document.getElementById('videosFrom').textContent = ((pagination.current - 1) * pagination.limit + 1);
        document.getElementById('videosTo').textContent = Math.min(pagination.current * pagination.limit, pagination.total);
        document.getElementById('videosTotal').textContent = pagination.total;

        this.renderVideosPagination(pagination);
    }

    renderVideosPagination(pagination) {
        const paginationContainer = document.getElementById('videosPagination');
        
        let paginationHtml = '';
        
        // Previous button
        paginationHtml += `
            <button onclick="dashboard.loadVideosList(${pagination.current - 1})" 
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${!pagination.hasPrev ? 'cursor-not-allowed opacity-50' : ''}"
                    ${!pagination.hasPrev ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, pagination.current - 2);
        const endPage = Math.min(pagination.pages, pagination.current + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <button onclick="dashboard.loadVideosList(${i})" 
                        class="relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            i === pagination.current 
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }">
                    ${i}
                </button>
            `;
        }

        // Next button
        paginationHtml += `
            <button onclick="dashboard.loadVideosList(${pagination.current + 1})" 
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${!pagination.hasNext ? 'cursor-not-allowed opacity-50' : ''}"
                    ${!pagination.hasNext ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationContainer.innerHTML = paginationHtml;
    }

    setupVideoEventListeners() {
        // Upload video button
        const uploadBtn = document.getElementById('uploadVideoBtn');
        if (uploadBtn && !uploadBtn.dataset.listenerAdded) {
            uploadBtn.addEventListener('click', () => this.openUploadModal());
            uploadBtn.dataset.listenerAdded = 'true';
        }

        // Upload form
        const uploadForm = document.getElementById('uploadVideoForm');
        if (uploadForm && !uploadForm.dataset.listenerAdded) {
            uploadForm.addEventListener('submit', (e) => this.handleVideoUpload(e));
            uploadForm.dataset.listenerAdded = 'true';
        }

        // Edit form
        const editForm = document.getElementById('editVideoForm');
        if (editForm && !editForm.dataset.listenerAdded) {
            editForm.addEventListener('submit', (e) => this.handleVideoEdit(e));
            editForm.dataset.listenerAdded = 'true';
        }

        // Modal close buttons
        document.getElementById('closeUploadModal')?.addEventListener('click', () => this.closeUploadModal());
        document.getElementById('cancelUpload')?.addEventListener('click', () => this.closeUploadModal());
        document.getElementById('closeEditModal')?.addEventListener('click', () => this.closeEditModal());
        document.getElementById('cancelEdit')?.addEventListener('click', () => this.closeEditModal());

        // Filter buttons
        document.getElementById('applyVideoFilters')?.addEventListener('click', () => this.applyVideoFilters());

        // Select all checkbox
        document.getElementById('selectAllVideos')?.addEventListener('change', (e) => this.toggleAllVideoSelection(e.target.checked));

        // Bulk action buttons
        document.getElementById('bulkDeleteVideos')?.addEventListener('click', () => this.bulkVideoAction('delete'));
        document.getElementById('bulkFeatureVideos')?.addEventListener('click', () => this.bulkVideoAction('feature'));
    }

    openUploadModal() {
        document.getElementById('uploadVideoModal').classList.remove('hidden');
        document.getElementById('uploadVideoForm').reset();
        document.getElementById('uploadProgress').classList.add('hidden');
    }

    closeUploadModal() {
        document.getElementById('uploadVideoModal').classList.add('hidden');
    }

    closeEditModal() {
        document.getElementById('editVideoModal').classList.add('hidden');
    }

    async handleVideoUpload(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = document.getElementById('submitUpload');
        const progressDiv = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('uploadProgressBar');
        const progressText = document.getElementById('uploadPercentage');

        try {
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Uploading...';
            
            // Show progress
            progressDiv.classList.remove('hidden');

            const xhr = new XMLHttpRequest();
            
            // Upload progress handler
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    progressBar.style.width = percentComplete + '%';
                    progressText.textContent = percentComplete + '%';
                }
            });

            // Response handler
            xhr.addEventListener('load', () => {
                if (xhr.status === 201) {
                    const result = JSON.parse(xhr.responseText);
                    this.showNotification('Video uploaded successfully!', 'success');
                    this.closeUploadModal();
                    this.loadVideos(); // Reload videos list
                } else {
                    const error = JSON.parse(xhr.responseText);
                    throw new Error(error.message || 'Upload failed');
                }
            });

            xhr.addEventListener('error', () => {
                throw new Error('Upload failed');
            });

            // Make the request
            xhr.open('POST', `${this.baseURL}/admin/videos/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
            xhr.send(formData);

        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification(error.message || 'Failed to upload video', 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Upload Video';
        }
    }

    async editVideo(videoId) {
        try {
            this.showLoading('Loading video details...');
            
            const response = await fetch(`${this.baseURL}/admin/videos/${videoId}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load video details');
            }

            const result = await response.json();
            const video = result.data;

            // Populate edit form
            document.getElementById('editVideoId').value = video.id;
            document.getElementById('editVideoTitle').value = video.title;
            document.getElementById('editVideoDescription').value = video.description || '';
            document.getElementById('editVideoCategory').value = video.category;
            document.getElementById('editVideoIsPublic').checked = video.isPublic;
            document.getElementById('editVideoIsFeatured').checked = video.isFeatured;
            document.getElementById('editVideoStatus').value = video.status;

            // Show edit modal
            document.getElementById('editVideoModal').classList.remove('hidden');

        } catch (error) {
            console.error('Error loading video details:', error);
            this.showNotification('Failed to load video details', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleVideoEdit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const videoId = document.getElementById('editVideoId').value;
        
        const submitBtn = document.getElementById('submitEdit');

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';

            const data = {
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                isPublic: formData.get('isPublic') === 'on',
                isFeatured: formData.get('isFeatured') === 'on',
                status: formData.get('status')
            };

            const response = await fetch(`${this.baseURL}/admin/videos/${videoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update video');
            }

            this.showNotification('Video updated successfully!', 'success');
            this.closeEditModal();
            this.loadVideos(); // Reload videos list

        } catch (error) {
            console.error('Edit error:', error);
            this.showNotification(error.message || 'Failed to update video', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
        }
    }

    async deleteVideo(videoId) {
        if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
            return;
        }

        try {
            this.showLoading('Deleting video...');

            const response = await fetch(`${this.baseURL}/admin/videos/${videoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete video');
            }

            this.showNotification('Video deleted successfully!', 'success');
            this.loadVideos(); // Reload videos list

        } catch (error) {
            console.error('Delete error:', error);
            this.showNotification(error.message || 'Failed to delete video', 'error');
        } finally {
            this.hideLoading();
        }
    }

    viewVideo(videoId) {
        // Open video in new tab
        window.open(`/uploads/videos/${videoId}`, '_blank');
    }

    applyVideoFilters() {
        const filters = {
            search: document.getElementById('videoSearchInput').value,
            category: document.getElementById('videoCategoryFilter').value,
            status: document.getElementById('videoStatusFilter').value,
            sortBy: document.getElementById('videoSortBy').value
        };

        this.loadVideosList(1, filters);
    }

    toggleAllVideoSelection(checked) {
        document.querySelectorAll('.video-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    async bulkVideoAction(action) {
        const selectedVideos = Array.from(document.querySelectorAll('.video-checkbox:checked')).map(cb => cb.value);
        
        if (selectedVideos.length === 0) {
            this.showNotification('Please select videos first', 'warning');
            return;
        }

        const actionText = action === 'delete' ? 'delete' : 'update';
        if (!confirm(`Are you sure you want to ${actionText} ${selectedVideos.length} selected video(s)?`)) {
            return;
        }

        try {
            this.showLoading(`Processing ${selectedVideos.length} videos...`);

            const response = await fetch(`${this.baseURL}/admin/videos/bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    videoIds: selectedVideos
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Failed to ${actionText} videos`);
            }

            const result = await response.json();
            this.showNotification(result.message, 'success');
            this.loadVideos(); // Reload videos list

        } catch (error) {
            console.error(`Bulk ${action} error:`, error);
            this.showNotification(error.message || `Failed to ${actionText} videos`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Helper functions
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatCategory(category) {
        return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility functions
    toggleUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        dropdown.classList.toggle('hidden');
    }

    closeModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg text-center">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification alert-${type}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${this.getNotificationIcon(type)} mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
});

// Handle page refresh/navigation
window.addEventListener('beforeunload', () => {
    // Clean up any ongoing requests or timers
});