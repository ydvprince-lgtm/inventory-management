// Load items on page load
document.addEventListener('DOMContentLoaded', loadItems);

async function loadItems() {
    const response = await fetch('/api/items');
    const items = await response.json();
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';

    items.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>$${item.price}</td>
            <td>
                <input type="number" id="qty_${item.id}" value="${item.quantity}" style="width:50px;">
                <button onclick="updateQty(${item.id})">Update</button>
            </td>
            <td><button onclick="deleteItem(${item.id})" class="delete-btn">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function addItem() {
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;

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
}

async function updateQty(id) {
    const newQty = document.getElementById(`qty_${id}`).value;
    await fetch(`/api/update/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({quantity: newQty})
    });
    loadItems();
}

async function deleteItem(id) {
    if(confirm("Are you sure you want to delete this product?")) {
        await fetch(`/api/delete/${id}`, { method: 'DELETE' });
        loadItems();
    }
}