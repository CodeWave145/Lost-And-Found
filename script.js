document.addEventListener('DOMContentLoaded', () => {
    const reportBtn = document.getElementById('report-btn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const itemForm = document.getElementById('item-form');
    const itemGallery = document.getElementById('item-gallery');
    const emptyMessage = document.getElementById('empty-message');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    let items = JSON.parse(localStorage.getItem('lostAndFoundItems')) || [];

    // Backfill older entries missing new fields
    items = items.map(it => ({
        ...it,
        location: typeof it.location === 'string' ? it.location : '',
        createdAt: it.createdAt || (typeof it.id === 'number'
            ? new Date(it.id).toISOString()
            : new Date().toISOString()),
        contact: (typeof it.contact === 'string' && it.contact.trim() !== '')
            ? it.contact
            : '(missing)'
    }));

    const saveItems = () => {
        localStorage.setItem('lostAndFoundItems', JSON.stringify(items));
    };

    const escapeHTML = (str = '') =>
        str.replace(/[&<>"']/g, c => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[c]));

    const formatDisplayDate = iso => {
        const d = new Date(iso);
        return d.toLocaleString(undefined, {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderItems = (filteredItems = items) => {
        itemGallery.innerHTML = '';
        if (filteredItems.length === 0) {
            emptyMessage.style.display = 'block';
            return;
        }
        emptyMessage.style.display = 'none';

        filteredItems.forEach(item => {
            const iso = item.createdAt || new Date().toISOString();
            const displayDate = formatDisplayDate(iso);

            const imageMarkup = item.image
                ? `<img src="${item.image}" alt="${escapeHTML(item.name)}">`
                : '<div class="placeholder-image">No Image</div>';

            const locationLine = item.location
                ? `<p class="location-line"><span class="loc-icon" aria-hidden="true">📍</span>${escapeHTML(item.location)}</p>`
                : '';

            const contactLine = `<p class="contact-line"><strong>Contact:</strong> ${escapeHTML(item.contact)}</p>`;

            const card = `
                <div class="item-card" data-id="${item.id}">
                    <span class="item-date" title="${iso}">${displayDate}</span>
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
    };

    const openModal = () => {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        const firstInput = itemForm.querySelector('input, textarea, select');
        if (firstInput) firstInput.focus();
    };

    const hideModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    };

    const showFieldError = (el, message) => {
        alert(message);
        el.focus();
    };

    const handleFormSubmit = e => {
        e.preventDefault();
        const formData = new FormData(itemForm);

        const name = formData.get('itemName').trim();
        const description = formData.get('description').trim();
        const location = formData.get('location').trim();
        const status = formData.get('status');
        const contact = formData.get('contact').trim();
        const imageFile = formData.get('image');

        if (!name) return showFieldError(document.getElementById('item-name'), 'Item name is required.');
        if (!description) return showFieldError(document.getElementById('description'), 'Description is required.');
        if (!location) return showFieldError(document.getElementById('location'), 'Location is required.');
        if (!status) return showFieldError(document.getElementById('status'), 'Status is required.');
        if (!contact) return showFieldError(document.getElementById('contact'), 'Contact is required.');

        const newItem = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            name,
            description,
            location,
            status,
            contact,
            image: null
        };

        const finalizeAdd = () => {
            items.push(newItem);
            saveItems();
            renderItems();
            itemForm.reset();
            hideModal();
        };

        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = evt => {
                newItem.image = evt.target.result;
                finalizeAdd();
            };
            reader.readAsDataURL(imageFile);
        } else {
            finalizeAdd();
        }
    };

    const handleSearch = e => {
        e.preventDefault();
        const term = searchInput.value.toLowerCase();
        const filtered = items.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.location.toLowerCase().includes(term) ||
            (item.contact || '').toLowerCase().includes(term)
        );
        renderItems(filtered);
    };

    const handleDelete = e => {
        if (!e.target.classList.contains('delete-btn')) return;
        const card = e.target.closest('.item-card');
        const id = Number(card.dataset.id);
        if (confirm('Are you sure you want to delete this item?')) {
            items = items.filter(it => it.id !== id);
            saveItems();
            renderItems();
        }
    };

    searchInput.addEventListener('input', () => {
        if (searchInput.value === '') renderItems();
    });

    reportBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', hideModal);
    itemForm.addEventListener('submit', handleFormSubmit);
    searchForm.addEventListener('submit', handleSearch);
    itemGallery.addEventListener('click', handleDelete);

    window.addEventListener('click', e => {
        if (e.target === modal) hideModal();
    });

    renderItems();
});