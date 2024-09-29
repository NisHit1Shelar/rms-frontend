let selectedItems = [];

// Load the menu dynamically from a JSON file
async function loadMenu() {
    try {
        const response = await fetch('menu.json');
        const menuData = await response.json();

        let menuHtml = '';
        for (const [category, subcategories] of Object.entries(menuData)) {
            menuHtml += `
                <div class="menu-category" onclick="toggleSubMenu('${category}')">
                    ${category}
                </div>
                <div id="submenu-${category}" class="submenu">`;

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

// Toggle Submenu Visibility
function toggleSubMenu(category) {
    const submenu = document.getElementById(`submenu-${category}`);
    submenu.style.display = submenu.style.display === 'none' || submenu.style.display === '' ? 'block' : 'none';
}

function addItem(itemId, itemName, itemPrice) {
    const existingItem = selectedItems.find(orderItem => orderItem.id === itemId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        selectedItems.push({ id: itemId, name: itemName, price: itemPrice, quantity: 1 });
    }
    renderOrder();
}

function renderOrder() {
    const orderItemsContainer = document.getElementById('orderItems');
    let totalAmount = 0;
    orderItemsContainer.innerHTML = '';

    selectedItems.forEach(orderItem => {
        totalAmount += orderItem.price * orderItem.quantity;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${orderItem.name}</td>
            <td>${orderItem.quantity}</td>
            <td>₹${orderItem.price * orderItem.quantity}</td>
        `;
        orderItemsContainer.appendChild(row);
    });

    document.getElementById('totalAmount').innerText = totalAmount;
}

function placeOrder() {
    const tableId = prompt("Enter table number:");
    if (!tableId) {
        alert('Please enter a table number');
        return;
    }

    const totalAmount = document.getElementById('totalAmount').innerText;

    fetch(`https://rms-backend-express.onrender.com/api/update-bill/${tableId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            table: tableId,
            total: totalAmount,
            items: selectedItems
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Order placed successfully!');
        selectedItems = [];
        renderOrder();
    })
    .catch(error => {
        console.error('Error placing order:', error);
        alert('Failed to place the order.');
    });
}



function resetOrder() {
    selectedItems = [];
    renderOrder();
}
function refreshBill(tableId) {
    fetch(`https://rms-backend-express.onrender.com/api/get-bill/${tableId}`)
        .then(response => response.json())
        .then(data => {
            // Clear current bill
            const billItemsContainer = document.getElementById('orderItems');
            let total = 0;

            billItemsContainer.innerHTML = '';  // Clear the bill

            // Add items to the bill
            data.items.forEach(item => {
                total += item.price * item.quantity;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price * item.quantity}</td>
                `;
                billItemsContainer.appendChild(row);
            });

            // Update the total
            document.getElementById('totalAmount').innerText = total;
        })
        .catch(error => {
            console.error('Error fetching bill:', error);
        });
}


function addToOrder() {
    const tableId = prompt("Enter table number:");
    if (!tableId) {
        alert('Please enter a table number');
        return;
    }

    // Replace this with the correct calculation of total amount if necessary
    let newTotalAmount = document.getElementById('totalAmount').innerText;

    fetch(`https://rms-backend-express.onrender.com/api/update-bill/${tableId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            items: selectedItems,  // Array of items with their details
            total: newTotalAmount  // Calculate the new total amount
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Order updated:', data);

        // Show alert when order is successfully added
        alert('Order added successfully!');

        // Clear the order or refresh the bill if needed
        selectedItems = []; // Clear selected items after adding the order
        renderOrder();  // Refresh the order display
        refreshBill(tableId);  // Update the bill display in the UI
    })
    .catch(error => {
        console.error('Error updating order:', error);
        alert('Failed to add the order.');
    });
}

// Call the function to load the menu on page load
loadMenu();
