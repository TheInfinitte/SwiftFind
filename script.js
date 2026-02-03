// 1. SMART PRELOADER & INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const magnifier = document.getElementById('magnifier');
    magnifier.classList.add('magnifier-active');

    setTimeout(() => {
        preloader.classList.add('preloader-done');
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.classList.add('loaded');
            checkUserStatus(); // See if they've registered before
        }, 800);
    }, 2000);
});

// 2. CHECK VERIFICATION (LOCALSTORAGE)
function checkUserStatus() {
    const user = JSON.parse(localStorage.getItem('swiftUser'));
    const badge = document.getElementById('userBadge');
    
    if (!user) {
        document.getElementById('regModal').classList.remove('hidden');
    } else {
        badge.innerText = `Verified: ${user.matric}`;
        badge.classList.add('verified-badge');
    }
}

// 3. REGISTRATION & WHATSAPP HANDSHAKE
document.getElementById('regForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const matric = document.getElementById('regMatric').value;
    const phone = document.getElementById('regPhone').value;

    const userData = { name, matric, phone };
    localStorage.setItem('swiftUser', JSON.stringify(userData));

    // Redirect to WhatsApp for ID Verification
    const adminNum = "2348000000000"; // REPLACE WITH YOUR NUMBER
    const msg = encodeURIComponent(`Hi SwiftFind, I'm registering.\nName: ${name}\nMatric: ${matric}\nI'm attaching my ID card photo below...`);
    
    document.getElementById('regModal').classList.add('hidden');
    window.open(`https://wa.me/${adminNum}?text=${msg}`, '_blank');
    checkUserStatus();
});

// 4. SMART FEE CALCULATOR (SCALING FEE)
function calculateFees() {
    const itemCost = parseFloat(document.getElementById('itemCost').value) || 0;
    const reward = parseFloat(document.getElementById('runnerReward').value) || 0;
    
    // Fee Logic: ₦50 minimum, or 5% of item cost for higher values
    let serviceFee = Math.max(50, itemCost * 0.05);
    let total = itemCost + reward + serviceFee;

    document.getElementById('serviceFeeDisplay').innerText = `₦${serviceFee.toFixed(0)}`;
    document.getElementById('totalToPay').innerText = `₦${total.toLocaleString()}`;
    return total;
}

// 5. PAYMENT & POSTING
function processPayment() {
    const total = calculateFees();
    const user = JSON.parse(localStorage.getItem('swiftUser'));

    if(!user) return alert("Please register first!");

    FlutterwaveCheckout({
        public_key: "YOUR_PUBLIC_KEY", // FROM FLUTTERWAVE DASHBOARD
        tx_ref: "SF-" + Math.floor(Math.random() * 1000000),
        amount: total,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        customer: {
            email: "student@swiftfind.com",
            phone_number: user.phone,
            name: user.name,
        },
        callback: function (data) {
            // After Payment, Send Summary to Admin WhatsApp
            const details = document.getElementById('taskDetails').value;
            const adminMsg = encodeURIComponent(`PAID ORDER!\nUser: ${user.name}\nTask: ${details}\nTotal: ₦${total}`);
            window.open(`https://wa.me/2348000000000?text=${adminMsg}`, '_blank');
            alert("Payment Successful! Your task is now live.");
            document.getElementById('requestModal').classList.add('hidden');
        }
    });
}

function openRequestForm() { document.getElementById('requestModal').classList.remove('hidden'); }
function claimTask(id) {
    const user = JSON.parse(localStorage.getItem('swiftUser'));
    const msg = encodeURIComponent(`I want to claim Errand ${id}. My Matric: ${user.matric}`);
    window.open(`https://wa.me/2348000000000?text=${msg}`, '_blank');
}
