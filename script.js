document.addEventListener('DOMContentLoaded', () => {
    const reportBtn = document.getElementById('report-btn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const itemForm = document.getElementById('item-form');
    const itemGallery = document.getElementById('item-gallery');
    const emptyMessage = document.getElementById('empty-message');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    // for local storage of all items (temporary) (remove later)
    let items = JSON.parse(localStorage.getItem('lostAndFoundItems')) || [];

    const saveItems = () => {
        localStorage.setItem('lostAndFoundItems', JSON.stringify(items));
    };

    const renderItems = (filteredItems = items) => {
        itemGallery.innerHTML = '';
        if (filteredItems.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            filteredItems.forEach(item => {
                const itemCard = `
                    <div class="item-card" data-id="${item.id}">
                        <button class="delete-btn" aria-label="Delete item">&times;</button>
                        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div class="placeholder-image">No Image</div>'}
                        <div class="item-card-content">
                            <span class="status-badge status-${item.status}">${item.status}</span>
                            <h3>${item.name}</h3>
                            <p>${item.description}</p>
                            ${item.contact ? `<p><strong>Contact:</strong> ${item.contact}</p>` : ''}
                        </div>
                    </div>
                `;
                itemGallery.insertAdjacentHTML('beforeend', itemCard);
            });
        }
    };

    // functions to show and hide the popup form
    const openModal = () => modal.style.display = 'block';
    const hideModal = () => modal.style.display = 'none';

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(itemForm);
        const imageFile = formData.get('image');

        const newItem = {
            id: Date.now(),
            name: formData.get('itemName'),
            description: formData.get('description'),
            status: formData.get('status'),
            contact: formData.get('contact'),
            image: null
        };

        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                newItem.image = event.target.result;
                items.push(newItem);
                saveItems();
                renderItems();
            };
            reader.readAsDataURL(imageFile);
        } else {
            items.push(newItem);
            saveItems();
            renderItems();
        }

        itemForm.reset();
        hideModal();
    };

    // handles the search thingy
    const handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.toLowerCase();
        const filteredItems = items.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.description.toLowerCase().includes(searchTerm)
        );
        renderItems(filteredItems);
    };
    
    const handleDelete = (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const card = e.target.closest('.item-card');
            const itemId = Number(card.dataset.id);

            if (confirm('Are you sure you want to delete this item?')) {
                items = items.filter(item => item.id !== itemId);
                saveItems();
                renderItems();
            }
        }
    };

    
    reportBtn.addEventListener('click', openModal);
    closeModal.addEventListener('click', hideModal);
    itemForm.addEventListener('submit', handleFormSubmit);
    searchForm.addEventListener('submit', handleSearch);
    itemGallery.addEventListener('click', handleDelete);
    searchInput.addEventListener('input', () => {
        // if the search bar is cleared, show all items again
        if (searchInput.value === '') {
            renderItems();
        }
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    renderItems();
});