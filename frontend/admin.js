let currentOrder = []; // To store existing bill items
let totalAmount = 0;

// Function to generate table grids dynamically
function generateTableGrid() {
    const tableCount = 10; // Example: dynamic table count, can be changed later
    const tableGridContainer = document.getElementById('tableGrid');
    tableGridContainer.innerHTML = ''; // Clear previous grids

    for (let i = 1; i <= tableCount; i++) {
        const tableElement = document.createElement('div');
        tableElement.classList.add('table-grid');
        tableElement.innerText = `Table ${i}`;
        tableElement.onclick = () => selectTable(i);
        tableGridContainer.appendChild(tableElement);
    }
}

// Function to load menu from JSON
async function loadMenu() {
    try {
        const response = await fetch('menu.json');
        const menuData = await response.json();

        let menuHtml = '';
        for (const [category, subcategories] of Object.entries(menuData)) {
            menuHtml += `<div class="menu-category" onclick="toggleSubMenu('${category}')">${category}</div>`;
            menuHtml += `<div id="submenu-${category}" class="submenu" style="display: none;">
                            <button class="close-btn" onclick="closeSubMenu('${category}')">X</button>`; // Add Close Button

            for (const [subCategory, items] of Object.entries(subcategories)) {
                let subcategoryClass = subCategory === 'Veg' ? 'subcategory-header' : 'non-veg-header';

                menuHtml += `<h3 class="${subcategoryClass}">${subCategory}</h3>`;

                items.forEach(item => {
                    menuHtml += `
                        <div class="menu-item">
                            <span>${item.name} - ₹${item.price}</span>
                            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" 
                                onclick="addItem(${item.id}, '${item.name}', ${item.price})">Add</button>
                        </div>`;
                });
            }
            menuHtml += `</div>`; // Close submenu
        }

        document.getElementById('menuList').innerHTML = menuHtml;
    } catch (error) {
        console.error('Failed to load menu:', error);
    }
}

// Function to toggle submenu visibility
function toggleSubMenu(category) {
    const submenu = document.getElementById(`submenu-${category}`);
    if (!submenu) {
        console.error(`Submenu for ${category} not found`);
        return;
    }
    
    // Toggle visibility
    submenu.style.display = (submenu.style.display === 'block') ? 'none' : 'block';
}

// Function to close submenu
function closeSubMenu(category) {
    const submenu = document.getElementById(`submenu-${category}`);
    submenu.style.display = 'none';
}


// Function to select a table
function selectTable(tableId) {
    document.getElementById('selectedTable').innerText = tableId;
    document.getElementById('order-details').classList.remove('hidden');
    document.getElementById('menu-section').classList.remove('hidden');

    loadBill(tableId);  // Load bill for the selected table
    loadMenu();         // Load menu for modifying orders
}

// Function to load the bill for the selected table
function loadBill(tableId) {
    fetch(`https://rms-backend-express.onrender.com/api/get-bill/${tableId}`)
        .then(response => response.json())
        .then(data => {
            if (!data || !data.items) {
                alert('No bill found for this table');
                return;
            }

            currentOrder = data.items;  // Store current bill items
            totalAmount = 0;

            renderOrder(); // Render the current bill
        })
        .catch(error => {
            console.error('Error fetching the bill:', error);
            alert('Failed to load bill');
        });
}

// Add item to the current order
function addItem(itemId, itemName, itemPrice) {
    const existingItem = currentOrder.find(orderItem => orderItem.id === itemId);

    if (existingItem) {
        // If the item already exists in the bill, update the quantity
        existingItem.quantity++;
    } else {
        // Otherwise, add the new item to the order
        currentOrder.push({ id: itemId, name: itemName, price: itemPrice, quantity: 1 });
    }

    renderOrder();
}

// Remove item from order
function removeItem(itemId) {
    currentOrder = currentOrder.filter(orderItem => orderItem.id !== itemId);
    renderOrder();
}

// Render the current order
function renderOrder() {
    const orderItemsContainer = document.getElementById('orderItems');
    totalAmount = 0;
    orderItemsContainer.innerHTML = '';

    currentOrder.forEach(orderItem => {
        totalAmount += orderItem.price * orderItem.quantity;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${orderItem.name}</td>
            <td>${orderItem.quantity}</td>
            <td>₹${orderItem.price * orderItem.quantity}</td>
            <td><button class="bg-red-500 text-white px-2 rounded" onclick="removeItem(${orderItem.id})">Remove</button></td>`;
        orderItemsContainer.appendChild(row);
    });

    document.getElementById('totalAmount').innerText = totalAmount;
}

// Function to send KOT
function sendKOT() {
    alert("KOT sent to kitchen!");
}

// Function to update the bill
function updateBill() {
    const tableId = document.getElementById('selectedTable').innerText;

    fetch(`https://rms-backend-express.onrender.com/api/update-bill/${tableId}`, {
        method: 'PATCH',  // Use PATCH as the bill exists already
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: currentOrder, total: totalAmount })
    })
    .then(response => response.json())
    .then(data => {
        alert('Bill updated successfully!');
        currentOrder = [];  // Clear the order once updated
        renderOrder(); // Clear order from UI
    })
    .catch(error => {
        console.error('Error updating bill:', error);
        alert('Failed to update bill');
    });
}

// Reset the table to vacant
function resetTable() {
    currentOrder = [];
    renderOrder();
    alert("Table reset to vacant");
}

// Add event listeners to buttons
document.getElementById('sendKOTButton').addEventListener('click', sendKOT);
document.getElementById('updateBillButton').addEventListener('click', updateBill);
document.getElementById('resetTableButton').addEventListener('click', resetTable);

// Generate table grid on page load
generateTableGrid();
