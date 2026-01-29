/* 1. MAGNIFIER PRELOADER LOGIC
   Triggered only on page refresh/initial load.
*/
window.addEventListener('DOMContentLoaded', () => {
    const preloader = document.getElementById('preloader');
    const magnifier = document.getElementById('magnifier');
    
    // Start with the bouncing animation
    magnifier.classList.add('magnifier-bounce');

    // After 2.5 seconds, start the slide-and-reveal sequence
    setTimeout(() => {
        preloader.classList.add('preloader-sliding');
        
        // Completely remove preloader after animation is done
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.classList.add('loaded'); // Trigger ease-out
            }, 500);
        }, 1000);
    }, 2500);
});

/* 2. TAB SWITCHER
   Prevents preloader from running when just moving between sections.
*/
function switchTab(tab) {
    document.getElementById('marketSection').classList.toggle('hidden', tab !== 'market');
    document.getElementById('ridesSection').classList.toggle('hidden', tab !== 'rides');
    window.scrollTo({top: 0, behavior: 'smooth'});
}

/* 3. SMART MODAL & SWIPE GALLERY
   Injects images as "snap-items" for the swiping feature.
*/
function openProductModal(btn) {
    const card = btn.closest('.product-card');
    const title = card.querySelector('h4').innerText;
    const price = parseInt(card.dataset.price);
    const colors = card.dataset.colors;
    const images = card.dataset.images.split(',');

    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalColors').innerText = "COLORS: " + colors;
    document.getElementById('modalDisplayPrice').innerText = "₦" + price.toLocaleString();
    
    // Inject images with the snap class
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = images.map(img => `
        <div class="gallery-item h-64 overflow-hidden bg-gray-50 flex-shrink-0">
            <img src="${img.trim()}" class="w-full h-full object-cover">
        </div>
    `).join('');

    document.getElementById('productModal').classList.remove('hidden');
}

/* 4. SMART INQUIRY
   Tells you exactly which product they are looking at.
*/
function contactSeller() {
    const itemName = document.getElementById('modalTitle').innerText;
    const phone = "2348000000000"; // Replace with your WhatsApp
    const text = encodeURIComponent(`Hi SwiftFind! I'm interested in the "${itemName}". Is it available?`);
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

/* 5. SEARCH & FILTER */
function searchProducts() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.style.display = card.dataset.name.includes(input) ? "block" : "none";
    });
}

function filterCategory(cat) {
    let cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        card.style.display = (cat === 'all' || name.includes(cat)) ? "block" : "none";
    });
}

/* 6. ADMIN MODE */
let adminClicks = 0;
function handleAdminClick() {
    adminClicks++;
    if (adminClicks >= 5) {
        document.body.classList.toggle('admin-mode');
        alert("Admin Mode: Active");
        adminClicks = 0;
    }
}

function toggleSold(btn) {
    const card = btn.closest('.product-card');
    card.querySelector('.sold-indicator').classList.toggle('hidden');
    card.querySelector('.sold-indicator').classList.toggle('flex');
}

function closeModal() { document.getElementById('productModal').classList.add('hidden'); }
