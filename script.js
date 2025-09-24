// ContactHub - Vanilla JavaScript Implementation
class ContactHub {
    constructor() {
        this.contacts = [];
        this.currentView = 'all'; // 'all' or 'favorites'
        this.searchQuery = '';
        this.isLoading = false;
        this.storageKey = 'contacthub_contacts';
        
        this.init();
    }

    // Initialize the application
    init() {
        this.loadContacts();
        this.bindEvents();
        this.render();
    }

    // Event Binding
    bindEvents() {
        // Form submission
        const form = document.getElementById('contactForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Navigation
        document.getElementById('allContactsBtn').addEventListener('click', () => this.switchView('all'));
        document.getElementById('favoritesBtn').addEventListener('click', () => this.switchView('favorites'));

        // Search
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Form validation on input
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', () => this.validateForm());
    }

    // Load contacts from localStorage
    loadContacts() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.contacts = JSON.parse(stored).map(contact => ({
                    ...contact,
                    createdAt: new Date(contact.createdAt)
                }));
            }
        } catch (error) {
            console.error('Failed to load contacts:', error);
            this.contacts = [];
        }
    }

    // Save contacts to localStorage
    saveContacts() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.contacts));
        } catch (error) {
            console.error('Failed to save contacts:', error);
            this.showToast('Error', 'Failed to save contacts. Please try again.', 'error');
        }
    }

    // Form submission handler
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = this.getFormData();
        if (!this.validateContactData(formData)) {
            return;
        }

        await this.addContact(formData);
    }

    // Get form data
    getFormData() {
        return {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim()
        };
    }

    // Validate contact data
    validateContactData(data) {
        if (!data.phone) {
            this.showToast('Error', 'Phone number is required.', 'error');
            return false;
        }

        if (data.email && !this.isValidEmail(data.email)) {
            this.showToast('Error', 'Please enter a valid email address.', 'error');
            return false;
        }

        return true;
    }

    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Add new contact
    async addContact(contactData) {
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <div class="loading-spinner"></div>
            Adding Contact...
        `;

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const newContact = {
                id: Date.now().toString(),
                ...contactData,
                isFavorite: false,
                createdAt: new Date()
            };

            this.contacts.push(newContact);
            this.saveContacts();
            this.clearForm();
            this.render();
            
            this.showToast('Success', 'Contact added successfully!', 'success');
        } catch (error) {
            console.error('Failed to add contact:', error);
            this.showToast('Error', 'Failed to add contact. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // Clear form
    clearForm() {
        document.getElementById('contactForm').reset();
        this.validateForm();
    }

    // Delete contact
    deleteContact(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact) return;

        if (confirm(`Are you sure you want to delete ${contact.name || 'this contact'}?`)) {
            this.contacts = this.contacts.filter(c => c.id !== id);
            this.saveContacts();
            this.render();
            this.showToast('Success', 'Contact deleted successfully!', 'success');
        }
    }

    // Toggle favorite status
    toggleFavorite(id) {
        const contactIndex = this.contacts.findIndex(c => c.id === id);
        if (contactIndex === -1) return;

        this.contacts[contactIndex].isFavorite = !this.contacts[contactIndex].isFavorite;
        this.saveContacts();
        this.render();

        const contact = this.contacts[contactIndex];
        const message = contact.isFavorite ? 
            'Contact added to favorites!' : 
            'Contact removed from favorites!';
        
        this.showToast('Success', message, 'success');
    }

    // Switch view (all/favorites)
    switchView(view) {
        this.currentView = view;
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        const activeBtn = view === 'all' ? 
            document.getElementById('allContactsBtn') : 
            document.getElementById('favoritesBtn');
        
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-pressed', 'true');

        this.render();
    }

    // Handle search
    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.render();
    }

    // Get filtered contacts
    getFilteredContacts() {
        let filtered = this.currentView === 'favorites' ? 
            this.contacts.filter(c => c.isFavorite) : 
            this.contacts;

        if (this.searchQuery) {
            filtered = filtered.filter(contact =>
                contact.name.toLowerCase().includes(this.searchQuery) ||
                contact.phone.includes(this.searchQuery) ||
                contact.email.toLowerCase().includes(this.searchQuery)
            );
        }

        return filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Validate form
    validateForm() {
        const phone = document.getElementById('phone').value.trim();
        const submitBtn = document.getElementById('submitBtn');
        const phoneInput = document.getElementById('phone');
        
        if (phone) {
            submitBtn.disabled = false;
            phoneInput.setAttribute('aria-invalid', 'false');
        } else {
            submitBtn.disabled = true;
            phoneInput.setAttribute('aria-invalid', 'true');
        }
    }

    // Render the application
    render() {
        this.renderContactList();
        this.updateContactCount();
    }

    // Render contact list
    renderContactList() {
        const contactList = document.getElementById('contactList');
        const emptyState = document.getElementById('emptyState');
        const filteredContacts = this.getFilteredContacts();

        if (filteredContacts.length === 0) {
            contactList.style.display = 'none';
            emptyState.style.display = 'flex';
            
            // Update empty state message based on current view
            const emptyTitle = emptyState.querySelector('h3');
            const emptyText = emptyState.querySelector('p');
            
            if (this.currentView === 'favorites') {
                emptyTitle.textContent = 'No favorite contacts';
                emptyText.textContent = 'Mark contacts as favorites to see them here!';
            } else if (this.searchQuery) {
                emptyTitle.textContent = 'No contacts found';
                emptyText.textContent = 'Try adjusting your search terms.';
            } else {
                emptyTitle.textContent = 'No contacts yet';
                emptyText.textContent = 'Add your first contact to get started!';
            }
        } else {
            contactList.style.display = 'flex';
            emptyState.style.display = 'none';
            
            contactList.innerHTML = filteredContacts.map(contact => 
                this.renderContactCard(contact)
            ).join('');

            // Bind contact actions
            contactList.querySelectorAll('.favorite-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    this.toggleFavorite(id);
                });
            });

            contactList.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    this.deleteContact(id);
                });
            });
        }
    }

    // Render individual contact card
    renderContactCard(contact) {
        const displayName = contact.name || 'Unnamed Contact';
        
        return `
            <div class="contact-card" role="listitem">
                <div class="contact-content">
                    <div class="contact-info">
                        <h3 class="contact-name" title="${displayName}">${displayName}</h3>
                        <div class="contact-details">
                            <div class="contact-detail">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 12a16 16 0 0 0 6.92 6.92l2.36-2.36a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                                <a href="tel:${contact.phone}" aria-label="Call ${contact.phone}">${contact.phone}</a>
                            </div>
                            ${contact.email ? `
                                <div class="contact-detail">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    <a href="mailto:${contact.email}" aria-label="Email ${contact.email}">${contact.email}</a>
                                </div>
                            ` : ''}
                            ${contact.address ? `
                                <div class="contact-detail">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    <span>${contact.address}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="contact-actions">
                        <button 
                            class="action-btn favorite-btn ${contact.isFavorite ? 'active' : ''}" 
                            data-id="${contact.id}"
                            aria-label="${contact.isFavorite ? `Remove ${displayName} from favorites` : `Add ${displayName} to favorites`}"
                            title="${contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
                            </svg>
                        </button>
                        <button 
                            class="action-btn delete-btn" 
                            data-id="${contact.id}"
                            aria-label="Delete ${displayName}"
                            title="Delete contact"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Update contact count
    updateContactCount() {
        const contactCount = document.getElementById('contactCount');
        const filteredContacts = this.getFilteredContacts();
        const total = this.contacts.length;
        
        let countText;
        if (this.currentView === 'favorites') {
            const favoriteCount = this.contacts.filter(c => c.isFavorite).length;
            countText = `${favoriteCount} favorite${favoriteCount !== 1 ? 's' : ''}`;
        } else if (this.searchQuery) {
            countText = `${filteredContacts.length} of ${total} contact${total !== 1 ? 's' : ''}`;
        } else {
            countText = `${total} contact${total !== 1 ? 's' : ''}`;
        }
        
        contactCount.textContent = countText;
    }

    // Show toast notification
    showToast(title, description, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toastId = `toast-${Date.now()}`;
        
        const toastElement = document.createElement('div');
        toastElement.id = toastId;
        toastElement.className = `toast ${type}`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        
        toastElement.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-description">${description}</div>
        `;
        
        toastContainer.appendChild(toastElement);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toastElement.parentNode) {
                        toastContainer.removeChild(toastElement);
                    }
                }, 300);
            }
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contactHub = new ContactHub();
});
