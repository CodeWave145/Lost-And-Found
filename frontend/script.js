const themeToggle = document.getElementById('theme-toggle');
const reportBtn = document.getElementById('report-btn');
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal');/*
const modalLogin = document.getElementById('modal-login');
const closeModalLoginBtn = document.getElementById('close-modal-login');
const loginButton = document.getElementById('login');
const loginForm = document.getElementById('login-form');*/
const itemForm = document.getElementById('item-form');
const itemGallery = document.getElementById('item-gallery');
const emptyMessage = document.getElementById('empty-message');
const imageInput = document.getElementById('image');
/*
loginButton.addEventListener('click', () => {
    modalLogin.classList.add('active');
});

closeModalLoginBtn.addEventListener('click', () => {
    modalLogin.classList.remove('active');
});

modalLogin.addEventListener('click', (e) => {
    if (e.target === modalLogin) {
        modalLogin.classList.remove('active');
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const roll = document.getElementById('roll').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!roll || !phone) {
        alert('Please fill in all required fields');
        return;
    }
    console.log('Login attempt with:');
    console.log('Roll Number:', roll);
    console.log('Phone Number:', phone);
    
    modalLogin.classList.remove('active');
    loginForm.reset();
});
*/

itemForm.addEventListener('submit', async   (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value.trim();
    const description = document.getElementById('description').value.trim();
    const status = document.getElementById('status').value;
    const contact = document.getElementById('contact').value.trim();
    const imageInput = document.getElementById('image');
    
    if (!name || !description || !status) {
        alert('Please fill in all required fields');
        return;
    }
    const newItem = {
        id: Date.now(),
        name: name,
        description: description,
        status: status,
        contact: contact,
        timestamp: Date.now(),
        image : null
    };
    if (imageInput.files && imageInput.files[0]) {
            const file = imageInput.files[0];
            
            // check file size (limit to 1MB to avoid localStorage issues)
            if (file.size > 1024 * 1024) {
                alert('Image size must be less than 1MB');
                return;
            }
            
            try {
                const base64Image = await fileToBase64(file);
                newItem.image = base64Image;
            } catch (error) {
                console.error('Error processing image:', error);
                alert('Error processing image. Please try again.');
                return;
            }
        }
        
        // get existing items, add new item, and save
        const items = getItems();
        items.push(newItem);
        saveItems(items);
        
        renderItems();
        
        itemForm.reset();
        modal.classList.remove('active');
        
        showSuccessMessage();
    });

// helper function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
// for light and dark themes
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// button for dark mode
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});


reportBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

function getItems() {
    const items = localStorage.getItem('lostFoundItems');
    return items ? JSON.parse(items) : [];
}

function saveItems(items) {
    localStorage.setItem('lostFoundItems', JSON.stringify(items));
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}
/*
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    card.innerHTML = `
        <div class="item-header">
            <h3>${escapeHtml(item.name)}</h3>
            <span class="status-badge ${item.status}">${item.status}</span>
        </div>
        <p>${escapeHtml(item.description)}</p>
        ${item.contact ? `<p class="item-contact">Contact: ${escapeHtml(item.contact)}</p>` : ''}
        <p class="item-date">Reported: ${formatDate(item.timestamp)}</p>
    `;
    
    return card;
}
    DELETE THIS LATER
*/
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderItems() {
    const items = getItems();
    
    itemGallery.innerHTML = '';

    if (items.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    } else {
        emptyMessage.style.display = 'none';
    }
    
    // create and add item cards (newest first)
    items.reverse().forEach(item => {
        const card = createItemCard(item);
        itemGallery.appendChild(card);
    });
}
/*
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // get form values
    const name = document.getElementById('item-name').value.trim();
    const description = document.getElementById('description').value.trim();
    const status = document.getElementById('status').value;
    const contact = document.getElementById('contact').value.trim();
    
    if (!name || !description || !status) {
        alert('Please fill in all required fields');
        return;
    }
    
    // create new item object
    const newItem = {
        id: Date.now(),
        name: name,
        description: description,
        status: status,
        contact: contact,
        timestamp: Date.now()
    };
    
    // get existing items, add new item, and save
    const items = getItems();
    items.push(newItem);
    saveItems(items);
    

    renderItems();
    
    itemForm.reset();
    modal.classList.remove('active');
    
    showSuccessMessage();
});
*/
function showSuccessMessage() {
    const successMsg = document.createElement('div');
    successMsg.textContent = 'Item reported successfully!';
    successMsg.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--badge-found);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(successMsg);
    
    // remove after 3 seconds
    setTimeout(() => {
        successMsg.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => successMsg.remove(), 300);
    }, 3000);
}


// initialize theme and render items on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    renderItems();
});

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    card.innerHTML = `
        <div class="item-header">
            <h3>${escapeHtml(item.name)}</h3>
            <div>
                <span class="status-badge ${item.status}">${item.status}</span>
            </div>
        </div>
        ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.name)}" class="item-image">` : ''}
            
        <p>${escapeHtml(item.description)}</p>
        ${item.contact ? `<p class="item-contact">Contact: ${escapeHtml(item.contact)}</p>` : ''}
        <p class="item-date">Reported: ${formatDate(item.timestamp)}</p>
        <button class="delete-btn" data-id="${item.id}" style="
            margin-top: 1rem;
            background: var(--badge-lost);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
        ">Delete</button>
    `;
    
    // add delete functionality
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        deleteItem(item.id);
    });
    
    return card;
}

function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        let items = getItems();
        items = items.filter(item => item.id !== itemId);
        saveItems(items);
        renderItems();
    }
}