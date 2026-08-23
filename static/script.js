// ---------------- THEME TOGGLE LOGIC ----------------
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

// Apply saved theme on page load
if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

// Toggle theme on click
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    let theme = 'light';
    if (document.body.classList.contains('dark-theme')) {
        theme = 'dark';
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
    localStorage.setItem('theme', theme);
    loadItems(); // Reload charts to update text colors
});

// ---------------- REST OF THE LOGIC ----------------
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

document.getElementById('searchInput')?.addEventListener('input', function(e) {
    const searchText = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#inventoryTable tr');
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(searchText) ? '' : 'none';
    });
});

document.addEventListener('DOMContentLoaded', loadItems);

let categoryChartInstance = null;
let stockChartInstance = null;

async function loadItems() {
    const response = await fetch('/api/items');
    const items = await response.json();
    const tbody = document.getElementById('inventoryTable');
    tbody.innerHTML = '';

    let totalQty = 0;
    let totalValue = 0;
    let categoryMap = {};
    let stockMap = {};

    items.forEach(item => {
        totalQty += item.quantity;
        totalValue += item.quantity * item.price;
        
        categoryMap[item.category] = (categoryMap[item.category] || 0) + item.quantity;
        stockMap[item.name] = item.quantity;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td><span>${item.category}</span></td>
            <td>₹${item.price}</td>
            <td>
                <input type="number" id="qty_${item.id}" value="${item.quantity}" style="width:60px; padding:5px; text-align:center; background:var(--input-bg); color:var(--text); border:1px solid var(--border);">
            </td>
            <td>
                <button class="action-btn btn-update" onclick="updateQty(${item.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="action-btn btn-delete" onclick="deleteItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('totalCount').innerText = items.length;
    document.getElementById('totalQty').innerText = totalQty;
    document.getElementById('totalValue').innerText = `₹${totalValue}`;

    renderCharts(categoryMap, stockMap);
}

function renderCharts(categories, stocks) {
    const isDark = document.body.classList.contains('dark-theme');
    const textColor = isDark ? '#ffffff' : '#333333';
    
    // Set global Chart defaults based on theme
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    // 1. Category Doughnut Chart
    const ctxCat = document.getElementById('categoryChart').getContext('2d');
    if(categoryChartInstance) categoryChartInstance.destroy();

    categoryChartInstance = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                label: 'Quantity',
                data: Object.values(categories),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 2. Stock Bar Chart
    const ctxStock = document.getElementById('stockChart').getContext('2d');
    if(stockChartInstance) stockChartInstance.destroy();

    stockChartInstance = new Chart(ctxStock, {
        type: 'bar',
        data: {
            labels: Object.keys(stocks),
            datasets: [{
                label: 'Stock Quantity',
                data: Object.values(stocks),
                backgroundColor: '#36A2EB',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
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
    loadItems(); 
    
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
