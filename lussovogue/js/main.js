// ===== LUSSO VOGUE - Main JS =====

document.addEventListener('DOMContentLoaded', () => {

  // --- Sticky Header Shadow ---
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
  });

  // --- Back to Top ---
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Search Toggle ---
  const searchBar = document.getElementById('searchBar');
  document.getElementById('searchToggle').addEventListener('click', () => {
    searchBar.classList.toggle('open');
    if (searchBar.classList.contains('open')) {
      searchBar.querySelector('input').focus();
    }
  });

  // --- Mobile Menu ---
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  const overlay = document.getElementById('mobileOverlay');

  const closeMobileNav = () => {
    hamburger.classList.remove('active');
    mainNav.classList.remove('mobile-open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('mobile-open');
    hamburger.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  overlay.addEventListener('click', closeMobileNav);

  // --- Hero Slider ---
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  let current = 0;
  let autoPlay;

  const goToSlide = (index) => {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  };

  const startAutoPlay = () => {
    autoPlay = setInterval(() => goToSlide(current + 1), 5000);
  };

  const resetAutoPlay = () => {
    clearInterval(autoPlay);
    startAutoPlay();
  };

  document.getElementById('sliderNext').addEventListener('click', () => {
    goToSlide(current + 1);
    resetAutoPlay();
  });

  document.getElementById('sliderPrev').addEventListener('click', () => {
    goToSlide(current - 1);
    resetAutoPlay();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
      resetAutoPlay();
    });
  });

  startAutoPlay();

  // --- Product Filter Tabs ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const productCards = document.querySelectorAll('.product-card[data-cat]');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tab = btn.dataset.tab;
      productCards.forEach(card => {
        if (tab === 'all' || card.dataset.cat === tab) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- Add to Cart (Demo) ---
  document.querySelectorAll('.add-to-cart-overlay').forEach(btn => {
    btn.addEventListener('click', () => {
      const cartCount = document.querySelector('.cart-count');
      const current = parseInt(cartCount.textContent) || 0;
      cartCount.textContent = current + 1;
      btn.textContent = 'Added!';
      btn.style.background = '#800020';
      setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.style.background = '';
      }, 1500);
    });
  });

  // --- Newsletter Form ---
  const form = document.querySelector('.newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const btn = form.querySelector('button');
      btn.textContent = 'Subscribed!';
      btn.style.background = '#800020';
      input.value = '';
      setTimeout(() => {
        btn.textContent = 'Subscribe';
        btn.style.background = '';
      }, 3000);
    });
  }

  // --- Wishlist Toggle (Demo) ---
  document.querySelectorAll('.action-btn').forEach(btn => {
    const icon = btn.querySelector('i');
    if (icon && icon.classList.contains('fa-heart')) {
      btn.addEventListener('click', () => {
        icon.classList.toggle('fa-regular');
        icon.classList.toggle('fa-solid');
        btn.style.background = icon.classList.contains('fa-solid') ? '#800020' : '';
        btn.style.color = icon.classList.contains('fa-solid') ? '#fff' : '';
      });
    }
  });

  // --- Mobile nav styles (injected for simplicity) ---
  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 900px) {
      .main-nav.mobile-open {
        display: flex !important;
        flex-direction: column;
        position: fixed;
        top: 0;
        left: 0;
        width: 300px;
        height: 100vh;
        background: #fff;
        z-index: 1001;
        padding: 80px 0 32px;
        overflow-y: auto;
        box-shadow: 4px 0 20px rgba(0,0,0,0.15);
      }
      .main-nav.mobile-open > ul {
        flex-direction: column;
        gap: 0;
      }
      .main-nav.mobile-open > ul > li > a {
        padding: 14px 24px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 14px;
      }
      .mega-menu {
        position: static !important;
        transform: none !important;
        flex-direction: column !important;
        min-width: unset !important;
        border: none !important;
        box-shadow: none !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: none;
        border-top: none !important;
        background: #f8f8f0 !important;
      }
      .has-dropdown:hover .mega-menu {
        display: flex;
      }
      .mega-col { padding: 12px 32px !important; }
    }
  `;
  document.head.appendChild(style);

});
