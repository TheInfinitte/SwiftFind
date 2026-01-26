/* SWIFT FIND CENTRAL LOGIC - MERGED & UPGRADED */

// --- CONFIGURATION ---
const ADMIN_PHONE = "234XXXXXXXXXX"; // <--- CHANGE THIS to your WhatsApp number (e.g., 2348012345678)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SEARCH FILTER LOGIC ---
    const searchInput = document.getElementById('searchInput');
    const products = document.querySelectorAll('.product-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            products.forEach(product => {
                const name = product.getAttribute('data-name').toLowerCase();
                if (name.includes(value)) {
                    product.style.display = "block";
                } else {
                    product.style.display = "none";
                }
            });
        });
    }

    // --- 2. MERCHANT FORM LOGIC ---
    const popForm = document.getElementById('popForm');
    const successModal = document.getElementById('successModal');

    if (popForm && successModal) {
        popForm.addEventListener('submit', function(e) {
            e.preventDefault();
            successModal.classList.remove('hidden');
        });
    }
});

// --- 3. PRODUCT MODAL CONTROLS ---

function openPop(name, price, amount, detail) {
    document.getElementById('modalTitle').innerText = name;
    document.getElementById('modalPrice').innerText = price;
    document.getElementById('modalDetail').innerText = detail;

    const payBtn = document.getElementById('modalPayButton');
    payBtn.onclick = function() {
        makePayment(amount, name);
    };

    document.getElementById('productModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closePop() {
    document.getElementById('productModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// --- 4. UPGRADED FLUTTERWAVE GATEWAY ---

function makePayment(amount, productName) {
    // Generate a unique reference for THIS specific attempt
    const uniqueRef = "SF-" + Date.now();

    FlutterwaveCheckout({
        public_key: "FLWPUBK_TEST-b521df3186db29fcd49996bc2ebc22a2-X", 
        tx_ref: uniqueRef,
        amount: amount,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        customer: {
            email: "student@abraka.com", 
            phone_number: "08012345678",
            name: "Swift Find Buyer",
        },
        customizations: {
            title: "Swift Find Marketplace",
            description: "Payment for " + productName,
            logo: "https://your-logo-url.com/logo.png",
        },
        callback: function (data) {
            console.log("Payment successful!", data);

            // 1. Prepare the WhatsApp Verification Message
            const message = `🚀 *PAYMENT VERIFIED*\n\n` +
                          `I just paid for: *${productName}*\n` +
                          `Amount: *₦${amount}*\n` +
                          `Ref ID: _${uniqueRef}_\n\n` +
                          `Please confirm so I can collect my item!`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${ADMIN_PHONE}?text=${encodedMessage}`;

            // 2. Close the modal and let the user know
            closePop();
            
            // 3. Redirect to WhatsApp automatically
            alert("Payment Confirmed! Redirecting to WhatsApp to verify your receipt.");
            window.location.href = whatsappURL;
        },
        onclose: function() {
            console.log("Payment window closed");
        }
    });
}