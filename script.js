document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://127.0.0.1:5000/api';
    const REPORTS_ENDPOINT = `${API_BASE}/report`;
    const REPORTS_GET_ENDPOINT = `${API_BASE}/reports`;

    const reportBtn = document.getElementById('report-btn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const itemForm = document.getElementById('item-form');
    const itemGallery = document.getElementById('item-gallery');
    const emptyMessage = document.getElementById('empty-message');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    let items = [];

    const escapeHTML = (str = '') =>
        String(str).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));

    const formatDisplayDate = dt => {
        const d = new Date(dt);
        if (isNaN(d)) return '';
        return d.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // API helpers
    async function fetchReports() {
        const res = await fetch(REPORTS_GET_ENDPOINT);
        if (!res.ok) throw new Error(`Failed to load reports: ${res.status}`);
        const data = await res.json();
        const rows = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        items = rows.map(r => ({
            id: r.id,
            name: r.itemname,
            description: r.description,
            location: r.location || '',
            status: r.status,
            contact: r.contact || '',
            imageUrl: r.imgurl || null,
            createdAt: r.reportdate
        }));
        renderItems(items);
    }

    
    async function createReport(payload) {
     const res = await fetch(REPORTS_ENDPOINT, {
        method: 'POST',
        body: payload,
        });
        if (!res.ok) {

        const msg = await safeText(res.clone()); 
        throw new Error(`Failed to create report: ${res.status} ${msg}`);
        }
        return res.json(); 
    }
    async function deleteReport(id) {
        const res = await fetch(`${REPORTS_ENDPOINT}/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const msg = await safeText(res);
            throw new Error(`Failed to delete report: ${res.status} ${msg}`);
        }
    }

    async function safeText(res) {
        try { return await res.text(); } catch { return ''; }
    }

    // rendering
    function renderItems(list) {
        itemGallery.innerHTML = '';
        if (!list || list.length === 0) {
            emptyMessage.style.display = 'block';
            return;
        }
        emptyMessage.style.display = 'none';

        list.forEach(item => {
            const displayDate = formatDisplayDate(item.createdAt);
            const imageMarkup = item.imageUrl
                ? `<img src="${escapeHTML(item.imageUrl)}" alt="${escapeHTML(item.name)}">`
                : '<div class="placeholder-image">No Image</div>';

            const locationLine = item.location
                ? `<p class="location-line"><span class="loc-icon" aria-hidden="true">📍</span>${escapeHTML(item.location)}</p>`
                : '';

            const contactLine = `<p class="contact-line"><strong>Contact:</strong> ${escapeHTML(item.contact)}</p>`;

            const card = `
                <div class="item-card" data-id="${item.id}">
                    <span class="item-date" title="${escapeHTML(item.createdAt || '')}">${escapeHTML(displayDate)}</span>
                    <button class="delete-btn" aria-label="Delete item">&times;</button>
                    ${imageMarkup}
                    <div class="item-card-content">
                        <span class="status-badge status-${escapeHTML(item.status)}">${escapeHTML(item.status)}</span>
                        <h3>${escapeHTML(item.name)}</h3>
                        ${locationLine}
                        <p>${escapeHTML(item.description)}</p>
                        ${contactLine}
                    </div>
                </div>
            `;
            itemGallery.insertAdjacentHTML('beforeend', card);
        });
    }

    // modal controls
    const hideModal = () => {
        const activeElement = document.activeElement;
        if (modal.contains(activeElement)) {
            activeElement.blur();
            reportBtn.focus();
        }
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('inert', 'true');  
        itemForm.reset();
    };

    const openModal = () => {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        modal.removeAttribute('inert');  
        const firstInput = itemForm.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    };

    // handlers
    function showFieldError(el, message) {
        alert(message);
        el?.focus();
    }

    async function onSubmit(e) {
        e.preventDefault();
        const formData = new FormData(itemForm);

        const name = (formData.get('itemName') || '').toString().trim();
        const description = (formData.get('description') || '').toString().trim();
        const location = (formData.get('location') || '').toString().trim();
        const status = (formData.get('status') || '').toString();
        const contact = (formData.get('contact') || '').toString().trim();
        const imageFile = formData.get('image');

        if (!name) return showFieldError(document.getElementById('item-name'), 'Item name is required.');
        if (!description) return showFieldError(document.getElementById('description'), 'Description is required.');
        if (!location) return showFieldError(document.getElementById('location'), 'Location is required.');
        if (!status) return showFieldError(document.getElementById('status'), 'Status is required.');
        if (!contact) return showFieldError(document.getElementById('contact'), 'Contact is required.');

        const payload = new FormData();
        payload.set('itemname', name);
        payload.set('description', description);
        payload.set('location', location);
        payload.set('isFound', status === 'found' ? '1' : '0');
        payload.set('contact', contact);
        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            payload.set('image', imageFile);
        }

        try {
            await createReport(payload);
            hideModal();
            await fetchReports();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Failed to submit report.');
        }
    }

    async function onDeleteClick(e) {
        if (!e.target.classList.contains('delete-btn')) return;
        const card = e.target.closest('.item-card');
        const id = card ? card.dataset.id : null;
        if (!id || id === 'undefined'){
            console.error('Error: Could not retrieve a valid report ID for deletion.', card);
            alert('Failed to identify the report for deletion. Please try refreshing.');
            return;
        }
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteReport(id);
            await fetchReports();
        } catch (err) {
            console.error(err);
            alert(err.message || 'Failed to delete report.');
        }
    }

    function onSearch(e) {
        e.preventDefault();
        const term = (searchInput.value || '').toLowerCase();
        const filtered = items.filter(item =>
            (item.name || '').toLowerCase().includes(term) ||
            (item.description || '').toLowerCase().includes(term) ||
            (item.location || '').toLowerCase().includes(term) ||
            (item.contact || '').toLowerCase().includes(term)
        );
        renderItems(filtered);
    }

    // event listeners
    reportBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', hideModal);
    itemForm.addEventListener('submit', onSubmit);
    searchForm.addEventListener('submit', onSearch);
    itemGallery.addEventListener('click', onDeleteClick);
    searchInput.addEventListener('input', () => {
        if (searchInput.value === '') renderItems(items);
        else
            onSearch({ preventDefault: () => {} });
    });
    window.addEventListener('click', e => {
        if (e.target === modal) hideModal();
    });

    // initial load
    fetchReports().catch(err => {
        console.error(err);
        emptyMessage.textContent = 'Failed to load items. Please try again.';
        emptyMessage.style.display = 'block';
    });
});