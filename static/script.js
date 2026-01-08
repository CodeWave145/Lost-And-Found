document.addEventListener('DOMContentLoaded', () => {
    const reportBtn = document.getElementById('report-btn');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const itemForm = document.getElementById('item-form');
    const itemGallery = document.getElementById('item-gallery');
    const emptyMessage = document.getElementById('empty-message');

    const escapeHTML = (str = '') =>
        String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    async function fetchReports() {
        try {
            const res = await fetch('/api/reports');
            const items = await res.json();
            renderItems(items);
        } catch (err) {
            console.error("Gallery Load Error:", err);
        }
    }

    function renderItems(items) {
        itemGallery.innerHTML = '';
        if (!items || items.length === 0) {
            emptyMessage.style.display = 'block';
            return;
        }
        emptyMessage.style.display = 'none';

        items.forEach(item => {
            const imageMarkup = item.imgurl 
                ? `<img src="${item.imgurl}" alt="item">`
                : '<div class="placeholder-image">No Image</div>';

            const card = `
                <div class="item-card">
                    <span class="item-date">${escapeHTML(item.date)}</span>
                    <button class="delete-btn" onclick="handleDelete(${item.id})">&times;</button>
                    ${imageMarkup}
                    <div class="item-card-content">
                        <span class="status-badge status-${item.status}">${item.status.toUpperCase()}</span>
                        <h3>${escapeHTML(item.name)}</h3>
                        <p>📍 ${escapeHTML(item.location)}</p>
                        <p>${escapeHTML(item.description)}</p>
                        <p><strong>Contact:</strong> ${escapeHTML(item.contact)}</p>
                    </div>
                </div>`;
            itemGallery.insertAdjacentHTML('beforeend', card);
        });
    }

    window.handleDelete = async (id) => {
        if (!confirm('Delete this item?')) return;
        try {
            await fetch(`/api/report/${id}`, { method: 'DELETE' });
            fetchReports();
        } catch (err) {
            alert("Delete failed");
        }
    };

    itemForm.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const formData = new FormData(itemForm);
        
        const payload = new FormData();
        // itemName matches HTML name="itemName"
        payload.append('itemname', formData.get('itemName'));
        payload.append('description', formData.get('description'));
        payload.append('location', formData.get('location'));
        payload.append('isFound', formData.get('status') === 'found' ? '1' : '0');
        payload.append('contact', formData.get('contact'));

        // Matches your HTML id="image-input"
        const fileInput = document.getElementById('image-input');
        if (fileInput && fileInput.files[0]) {
            payload.append('image', fileInput.files[0]);
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Saving...";

        try {
            const res = await fetch('/api/report', { method: 'POST', body: payload });
            if (res.ok) {
                modal.style.display = 'none';
                itemForm.reset();
                fetchReports();
            } else {
                alert("Server error. Check PythonAnywhere logs.");
            }
        } catch (err) {
            alert("Error saving report");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit Report";
        }
    };

    reportBtn.onclick = () => modal.style.display = 'block';
    closeModal.onclick = () => modal.style.display = 'none';
    fetchReports();
});