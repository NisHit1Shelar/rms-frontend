function loadBill() {
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('table');

    if (!tableId) {
        alert('No table ID found in the URL');
        return;
    }

    // Fetch the bill details from the backend
    fetch(`https://rms-backend-express.onrender.com/api/get-bill/${tableId}`)
    .then(response => response.json())
    .then(data => {
        if (!data || !data.items) {
            alert('No bill found for this table');
            return;
        }

        const billItemsContainer = document.getElementById('bill-items-tbody');
        let total = 0;

        billItemsContainer.innerHTML = '';  // Clear current bill

        // Render bill items in the table
        data.items.forEach(item => {
            total += item.price * item.quantity;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="text-lg font-semibold text-gray-700 text-center">${item.name}</td>
                <td class="text-lg font-semibold text-gray-700 text-center">${item.quantity}</td>
                <td class="text-lg font-semibold text-gray-700 text-center">₹${item.price * item.quantity}</td>
            `;
            billItemsContainer.appendChild(row);
        });

        // Update total amount
        document.getElementById('totalAmount').innerText = total;

        // Set the UPI payment link with the total amount
        document.getElementById('payNowButton').href = `upi://pay?pa=nishitsshelar@oksbi&pn=Nishit%20Shelar&am=${total}&cu=INR`;
    })
    .catch(error => {
        console.error('Error fetching the bill:', error);
        alert('Failed to load bill');
    });
}

loadBill();
