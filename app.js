// Header Scroll Effect (Smart Sticky)
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const currentScroll = window.scrollY;
    
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Hide header on scroll down, show on scroll up
    if (currentScroll > lastScroll && currentScroll > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;
});

// Awwwards-Quality Reveal & Kinetic Typography on Scroll
const revealElements = document.querySelectorAll('.reveal');
const staggerHeadings = document.querySelectorAll('.stagger-heading');

const revealOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
};

const staggerOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
        }
    });
};

const options = { threshold: 0.1 };
const observer = new IntersectionObserver(revealOnScroll, options);
const staggerObserver = new IntersectionObserver(staggerOnScroll, { threshold: 0.2 });

revealElements.forEach(element => observer.observe(element));
staggerHeadings.forEach(heading => staggerObserver.observe(heading));

// Awwwards-Quality Spotlight Hover Tracking (reveal-hover-effect)
function attachSpotlightHover(cards) {
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Attach to existing cards on load and expose globally for dynamic product cards
document.addEventListener('DOMContentLoaded', () => {
    attachSpotlightHover(document.querySelectorAll('.card, .product-card'));
    setTimeout(() => attachSpotlightHover(document.querySelectorAll('.card, .product-card')), 800);
});
window.attachSpotlightHover = attachSpotlightHover;

// Smooth Scroll for Nav Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });
}

// Cart Simulation (Micro-interaction)
const addToCartButtons = document.querySelectorAll('.card-link');
addToCartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const originalText = button.innerHTML;
        button.innerHTML = 'Adding...';
        
        setTimeout(() => {
            button.innerHTML = 'Added to Cart ✓';
            button.style.color = '#689F38';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.color = '';
            }, 2000);
        }, 800);
    });
});

// EPOS 360 Store Integration Configuration
window.EPOS_CONFIG = {
    brandName: "my-fruit-selection-enterprise",
    accessKey: "957cf20ddf534cc6bab06382f486b48b",
    appId: "2102020273885390",
    orderPageUrl: "https://order.epos.com/page/my-fruit-selection-enterprise"
};

// Dynamic Data Connection (EPOS 360 POS, Google Sheets CSV, with Local Fallback)
window.GOOGLE_SHEET_CSV_URL = ""; 

document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    try {
        let products = [];

        // 1. Try EPOS 360 API / HTML Store Data if available
        if (window.EPOS_CONFIG && window.EPOS_CONFIG.accessKey) {
            try {
                const eposRes = await fetch(`https://order.epos.com/page/${window.EPOS_CONFIG.brandName}`);
                if (eposRes.ok) {
                    const eposHtml = await eposRes.text();
                    const jsonMatch = eposHtml.match(/extJson:\s*(\{.*?\})\s*,\s*brandName/s);
                    if (jsonMatch && jsonMatch[1]) {
                        const parsed = JSON.parse(jsonMatch[1]);
                        console.log('EPOS 360 Store connected!', parsed);
                    }
                }
            } catch (eposErr) {
                console.warn('EPOS live fetch info', eposErr);
            }
        }

        // 2. Try fetching from Google Sheet CSV first if configured
        if ((!products || products.length === 0) && window.GOOGLE_SHEET_CSV_URL) {
            try {
                const sheetRes = await fetch(window.GOOGLE_SHEET_CSV_URL);
                if (sheetRes.ok) {
                    const csvText = await sheetRes.text();
                    products = parseCSV(csvText);
                }
            } catch (sheetErr) {
                console.warn('Google Sheet fetch failed, falling back to local JSON', sheetErr);
            }
        }

        // 3. Fallback to local JSON database if empty
        if (!products || products.length === 0) {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Failed to fetch data');
            products = await response.json();
        }

        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--text-muted);">
                    <i data-lucide="package-open" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No products available right now.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        let html = '';
        products.forEach(data => {
            if (data.available === 'NO' || data.Available === 'NO') return; // Skip unavailable items

            html += `
            <div class="card border-gradient reveal active" style="cursor: pointer;" onclick="openModal('${escapeQuotes(data.tag || 'Fresh')}', '${escapeQuotes(data.title || 'Product')}', '${escapeQuotes(data.desc || '')}', '${escapeQuotes(data.price || 'RM 0.00')}', '${escapeQuotes(data.image || 'assets/hero.png')}')">
                <div class="card-image">
                    <img src="${data.image || 'assets/hero.png'}" alt="${data.title || 'Product'}">
                </div>
                <div class="card-content">
                    <span class="card-tag">${data.tag || 'Fresh'}</span>
                    <h3>${data.title || 'Product'}</h3>
                    <p>${data.desc || ''}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <span style="font-weight: 700; color: var(--primary-green); font-size: 1.2rem;">${data.price || 'RM 0.00'}</span>
                        <span class="card-link" style="margin-top: 0;">Order <i data-lucide="arrow-right"></i></span>
                    </div>
                </div>
            </div>
            `;
        });
        productsGrid.innerHTML = html;
        lucide.createIcons();
        if (window.attachSpotlightHover) {
            window.attachSpotlightHover(productsGrid.querySelectorAll('.card'));
        }

    } catch (error) {
        console.error("Error fetching products: ", error);
        productsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--primary-red);">Failed to load products.</div>`;
    }
});

// CSV Parser Helper
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const currentline = lines[i].split(',');
        if (currentline.length < headers.length) continue;
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            let val = currentline[j] ? currentline[j].trim().replace(/^"|"$/g, '') : '';
            obj[headers[j]] = val;
        }
        result.push(obj);
    }
    return result;
}

function escapeQuotes(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// WhatsApp Cart Checkout Helper
function checkoutViaWhatsApp() {
    const title = document.getElementById('modalTitle') ? document.getElementById('modalTitle').innerText : 'Fruit Package';
    const price = document.getElementById('modalPrice') ? document.getElementById('modalPrice').innerText : '';
    
    const message = `Hi FRÜIT! 🍊 I'd like to order:\n- *${title}* (${price})\n\nPlease advise on delivery to my address!`;
    const whatsappUrl = `https://wa.me/60122135938?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}
