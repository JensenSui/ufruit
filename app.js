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

// Reveal Animations on Scroll
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
};

const options = {
    threshold: 0.1
};

const observer = new IntersectionObserver(revealOnScroll, options);

revealElements.forEach(element => {
    observer.observe(element);
});

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

// Dynamic Data Connection (Firestore)
document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (typeof firebase !== 'undefined') {
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('products').get();
            
            if (snapshot.empty) {
                productsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--text-muted);">
                        <i data-lucide="package-open" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>No products found in the database. Please add them in the Firebase Console.</p>
                    </div>
                `;
                lucide.createIcons();
                return;
            }
            
            let html = '';
            snapshot.forEach(doc => {
                const data = doc.data();
                html += `
                <div class="card reveal active" style="cursor: pointer;" onclick="openModal('${data.tag || 'Fresh'}', '${data.title || 'Product'}', '${data.desc || ''}', '${data.price || '$0.00'}', '${data.image || 'assets/hero.png'}')">
                    <div class="card-image">
                        <img src="${data.image || 'assets/hero.png'}" alt="${data.title || 'Product'}">
                    </div>
                    <div class="card-content">
                        <span class="card-tag">${data.tag || 'Fresh'}</span>
                        <h3>${data.title || 'Product'}</h3>
                        <p>${data.desc || ''}</p>
                        <span class="card-link" style="margin-top: 1rem;">View Details <i data-lucide="arrow-right"></i></span>
                    </div>
                </div>
                `;
            });
            productsGrid.innerHTML = html;
            lucide.createIcons();
            
        } catch (error) {
            console.error("Error fetching products: ", error);
            productsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--primary-red);">Failed to load products. Check console for details.</div>`;
        }
    } else {
        productsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Firebase SDK not loaded. This is expected when running outside of Firebase Hosting or Emulators.</div>`;
    }
});
