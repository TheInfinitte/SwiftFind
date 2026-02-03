/* --- SWIFTFIND LOGISTICS CORE --- */

// 1. PRELOADER & NAVIGATION
window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('preloader-done');
        setTimeout(() => {
            preloader.style.display = 'none';
            document.body.classList.add('loaded');
            checkSecurityStatus();
        }, 800);
    }, 2500);
    
    renderErrands(); // Load existing errands
});

// 2. SECURITY & REGISTRATION
function checkSecurityStatus() {
    const user = JSON.parse(localStorage.getItem('swiftUser'));
    if (!user) {
        document.getElementById('regModal').classList.remove('hidden');
    } else if (user.isVerified) {
        const badge = document.getElementById('userBadge');
        badge.innerText = "Verified Runner 🛡️";
        badge.style.background = "#22D3EE";
        badge.style.color = "#0F3460";
    }
}

// Deceptive Login -> WhatsApp Handshake
document.getElementById('regForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const userData = {
        name: document.getElementById('regName').value,
        matric: document.getElementById('regMatric').value,
        phone: document.getElementById('regPhone').value,
        isVerified: false // Admin must verify via WhatsApp
    };
    localStorage.setItem('swiftUser', JSON.stringify(userData));
    
    const msg = encodeURIComponent(`Hi SwiftFind Admin, I'm ${userData.name} (${userData.matric}). Here is my ID photo for verification...`);
    window.open(`https://wa.me/2348000000000?text=${msg}`, '_blank'); // Change to your number
    document.getElementById('regModal').classList.add('hidden');
});

// 3. SMART DYNAMIC FEE CALCULATOR
function calculateFees() {
    const cost = parseFloat(document.getElementById('itemCost').value) || 0;
    const reward = parseFloat(document.getElementById('runnerReward').value) || 0;
    
    // Fee: ₦50 minimum, scales to 5% for high-value items
    let myFee = Math.max(50, cost * 0.05);
    let gatewayFee = (cost + reward + myFee) * 0.015; // 1.5% Flutterwave fee
    let total = cost + reward + myFee + gatewayFee;

    document.getElementById('serviceFeeDisplay').innerText = `₦${myFee.toFixed(0)}`;
    document.getElementById('totalToPay').innerText = `₦${Math.ceil(total).toLocaleString()}`;
    return Math.ceil(total);
}

// 4. THE ERRAND "DATABASE" (Stored in LocalStorage for 0$ cost)
let errands = JSON.parse(localStorage.getItem('swiftErrands')) || [
    { id: 'SF-101', type: 'Pickup', details: 'Document from Site 1 to Orita', reward: 300 },
    { id: 'SF-102', type: 'Buy', details: 'Medicine from Pharmacy to Site 3', reward: 500 }
];

function renderErrands() {
    const feed = document.getElementById('errandFeed');
    feed.innerHTML = errands.map(task => `
        <div class="bg-white p-6 rounded-[35px] shadow-xl border border-gray-50 relative animate-fade-in">
            <div class="absolute top-0 right-0 bg-blue-900 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase">₦${task.reward} Reward</div>
            <h4 class="font-black text-blue-900 text-lg">📦 ${task.type}</h4>
            <p class="text-gray-400 text-sm mb-4">${task.details}</p>
            <button onclick="claimTask('${task.id}')" class="w-full border-2 border-blue-900 text-blue-900 py-3 rounded-2xl font-black text-xs uppercase hover:bg-blue-900 hover:text-white transition">Claim Task</button>
        </div>
    `).join('');
}

// 5. HIDDEN ADMIN MODE (Tap Logo 5 Times)
let logoClicks = 0;
document.querySelector('h1').onclick = () => {
    logoClicks++;
    if (logoClicks === 5) {
        const secret = prompt("Enter Admin Code:");
        if (secret === "ABRAKA2026") {
            showAdminPanel();
        }
        logoClicks = 0;
    }
};

function showAdminPanel() {
    const task = prompt("Add New Task? Format: Type,Details,Reward");
    if (task) {
        const [type, details, reward] = task.split(',');
        errands.unshift({ id: 'SF-'+Date.now(), type, details, reward });
        localStorage.setItem('swiftErrands', JSON.stringify(errands));
        renderErrands();
    }
}

// 6. WHATSAPP CLAIM LOGIC
function claimTask(id) {
    const user = JSON.parse(localStorage.getItem('swiftUser'));
    if (!user) return alert("Register first!");
    
    const msg = encodeURIComponent(`I want to claim Task ${id}.\nRunner: ${user.name}\nMatric: ${user.matric}`);
    window.open(`https://wa.me/2348000000000?text=${msg}`, '_blank');
}
