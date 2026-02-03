// ==========================================
// [ADMIN CONFIGURATION]
// ==========================================
const ADMIN_WHATSAPP = "2348128085588"; // Replace with your real WhatsApp number
let WEEKLY_CODE = "ABRAKA2026"; // Change this whenever you want to reset verification

// ==========================================
// [1. SITE BOOT & PRELOADER]
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const magnifier = document.getElementById('magnifier');
    
    // Start the magnifier bouncing
    magnifier.classList.add('magnifier-anim');

    // After 2.5 seconds, hide preloader and reveal site
    setTimeout(() => {
        preloader.classList.add('preloader-off');
        document.getElementById('logoText').style.opacity = "1";
        
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.classList.add('loaded'); // Shows the main body
            checkUser(); // Check if they are logged in
            startLiveTicker(); // Start status bar updates
            renderTasks(); // Show errands on the feed
        }, 800);
    }, 2500);
});

// ==========================================
// [2. USER SECURITY & VERIFICATION]
// ==========================================
function checkUser() {
    const user = JSON.parse(localStorage.getItem('swiftUser'));
    const badge = document.getElementById('userBadge');
    
    if (!user) {
        document.getElementById('regModal').classList.remove('hidden');
    } else if (user.isVerified) {
        badge.innerText = "Verified Runner 🛡️";
        badge.classList.add('badge-verified');
    }
}

// Logic for when they click "Verify Identity"
function handleVerification() {
    const user = JSON.parse(localStorage.getItem('swiftUser'));
    if (!user) return;
    if (user.isVerified) return alert("You are already verified!");

    const input = prompt("Enter the Verification Code provided by Admin on WhatsApp:");
    if (input === WEEKLY_CODE) {
        user.isVerified = true;
        localStorage.setItem('swiftUser', JSON.stringify(user));
        alert("Success! Your Runner Badge is now Active.");
        location.reload();
    } else {
        alert("Invalid code. Message Admin to get verified.");
    }
}

// Handling the first-time registration
document.getElementById('regForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('regName').value,
        matric: document.getElementById('regMatric').value,
        phone: document.getElementById('regPhone').value,
        isVerified: false
    };
    localStorage.setItem('swiftUser', JSON.stringify(data));
    
    // Open WhatsApp to send ID
    const msg = encodeURIComponent(`Hi SwiftFind, I'm ${data.name} (${data.matric}). Sending my ID now...`);
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
    
    document.getElementById('regModal').classList.add('hidden');
});

// ==========================================
// [3. ERRAND BOARD ENGINE]
// ==========================================
// To add an order, use Admin Mode (tap logo 5 times)
let tasks = JSON.parse(localStorage.getItem('swiftTasks')) || [
    { id: '1', type: 'Pickup', details: 'Site 1 Gate to Ethiope', reward: 300 }
];

function renderTasks() {
    const feed = document.getElementById('errandFeed');
    feed.innerHTML = tasks.map(t => `
        <div class="bg-white p-6 rounded-[35px] shadow-xl relative border border-gray-50">
            <div class="absolute top-0 right-0 bg-blue-900 text-white px-4 py-1 rounded-bl-2xl text-[9px] font-black uppercase">₦${t.reward} Reward</div>
            <h4 class="font-black text-blue-900 text-lg">${t.type} Request</h4>
            <p class="text-gray-400 text-sm mb-4">${t.details}</p>
            <button onclick="claim('${t.id}')" class="w-full border-2 border-blue-900 text-blue-900 py-3 rounded-2xl font-black text-xs uppercase">Claim Errand</button>
        </div>
    `).join('');
}

// ==========================================
// [4. PAYMENTS & FEES]
// ==========================================
function calculateFees() {
    const item = parseFloat(document.getElementById('itemCost').value) || 0;
    const reward = parseFloat(document.getElementById('runnerReward').value) || 0;
    const fee = Math.max(50, item * 0.05); // 5% fee, but 50 Naira minimum
    const total = item + reward + fee;
    
    document.getElementById('serviceFeeDisplay').innerText = `₦${fee.toFixed(0)}`;
    document.getElementById('totalToPay').innerText = `₦${Math.ceil(total).toLocaleString()}`;
    return Math.ceil(total);
}

function processPayment() {
    const total = calculateFees();
    const user = JSON.parse(localStorage.getItem('swiftUser'));

    FlutterwaveCheckout({
        public_key: "FLWPUBK_TEST-b521df3186db29fcd49996bc2ebc22a2-X", // CHANGE TO YOUR LIVE KEY
        tx_ref: "SF-" + Date.now(),
        amount: total,
        currency: "NGN",
        customer: { email: "user@swiftfind.com", name: user.name, phone_number: user.phone },
        callback: (data) => {
            const desc = document.getElementById('taskDetails').value;
            // Send to WhatsApp BEFORE showing alert to avoid browser blocks
            const msg = encodeURIComponent(`🚀 PAID ORDER!\n\nName: ${user.name}\nTask: ${desc}\nPaid: ₦${total}`);
            window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
            
            setTimeout(() => {
                alert("Payment Successful! Message Admin to see it live.");
                closeRequestForm();
            }, 500);
        }
    });
}

// ==========================================
// [5. ADMIN DASHBOARD] - Hidden Control
// ==========================================
let taps = 0;
document.getElementById('brandLogo').onclick = () => {
    taps++;
    if (taps === 5) {
        const pin = prompt("Enter Admin PIN:");
        if (pin === WEEKLY_CODE) {
            const act = prompt("1: Add Task\n2: Reset Everything\n3: Remove Task (by ID)");
            
            if (act === "1") {
                const val = prompt("Format: Type,Details,Reward");
                if (val) {
                    const [type, details, reward] = val.split(',');
                    // We give it a unique ID based on the current time
                    tasks.unshift({ id: Date.now().toString(), type, details, reward });
                    localStorage.setItem('swiftTasks', JSON.stringify(tasks));
                    renderTasks();
                }
            } 
            else if (act === "2") {
                if(confirm("This will wipe all users and tasks. Sure?")) {
                    localStorage.clear();
                    location.reload();
                }
            }
            else if (act === "3") {
                const idToDelete = prompt("Enter the ID of the task to remove:");
                // Filter out the task that matches the ID
                tasks = tasks.filter(t => t.id !== idToDelete);
                localStorage.setItem('swiftTasks', JSON.stringify(tasks));
                renderTasks();
                alert("Task removed from local view.");
            }
        }
        taps = 0;
    }
};
// ==========================================
// [6. LIVE UPDATES]
// ==========================================
function startLiveTicker() {
    setInterval(() => {
        const n = Math.floor(Math.random() * 5) + 10;
        document.getElementById('liveRunners').innerText = `${n} Runners Online`;
    }, 8000);
}

function openRequestForm() { document.getElementById('requestModal').classList.remove('hidden'); }
function closeRequestForm() { document.getElementById('requestModal').classList.add('hidden'); }

function claim(id) {
    const user = JSON.parse(localStorage.getItem('swiftUser'));
    const msg = encodeURIComponent(`CLAIM: I want to run Task #${id}.\nMy Matric: ${user.matric}`);
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`, '_blank');
}
