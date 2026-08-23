// Toast function for notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchText = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#inventoryTable tr');
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(searchText) ? '' : 'none';
    });
});

// Load items on page load
document.addEventListener('DOMContentLoaded', loadItems);

async function loadItems() {
    const response = await fetch('/api/items');
    const items = await response.json();
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';

    let totalQty = 0;
    let totalValue = 0;

    items.forEach(item => {
        totalQty += item.quantity;
        totalValue += item.quantity * item.price;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td><span class="category-badge">${item.category}</span></td>
            <td>₹${item.price}</td>
            <td>
                <input type="number" id="qty_${item.id}" value="${item.quantity}" style="width:60px; padding:5px; text-align:center;">
            </td>
            <td>
                <button class="action-btn btn-update" onclick="updateQty(${item.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn btn-delete" onclick="deleteItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Update Stats
    document.getElementById('totalCount').innerText = items.length;
    document.getElementById('totalQty').innerText = totalQty;
    document.getElementById('totalValue').innerText = `₹${totalValue}`;
}

async function addItem() {
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;

    if(!name || !category || !price || !quantity) {
        showToast('Please fill all fields!', 'error');
        return;
    }

    await fetch('/api/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, category, price, quantity})
    });
    loadItems(); // Refresh table
    
    // Clear inputs
    document.getElementById('name').value = '';
    document.getElementById('category').value = '';
    document.getElementById('price').value = '';
    document.getElementById('quantity').value = '';
    
    showToast('Product Added Successfully!');
}

async function updateQty(id) {
    const newQty = document.getElementById(`qty_${id}`).value;
    await fetch(`/api/update/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({quantity: newQty})
    });
    loadItems();
    showToast('Quantity Updated!');
}

async function deleteItem(id) {
    if(confirm("Are you sure you want to delete this product?")) {
        await fetch(`/api/delete/${id}`, { method: 'DELETE' });
        loadItems();
        showToast('Product Deleted!');
    }
}
