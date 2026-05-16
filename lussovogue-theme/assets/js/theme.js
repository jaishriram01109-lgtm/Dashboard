/* Lusso Vogue - Theme JS */
(function($) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // --- Sticky Header ---
    var header = document.getElementById('siteHeader');
    var backTop = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
      if (header) header.classList.toggle('scrolled', window.scrollY > 10);
      if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);
    });

    // --- Back to Top ---
    if (backTop) {
      backTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // --- Search Toggle ---
    var searchBar    = document.getElementById('searchBar');
    var searchToggle = document.getElementById('searchToggle');
    if (searchToggle && searchBar) {
      searchToggle.addEventListener('click', function() {
        searchBar.classList.toggle('open');
        if (searchBar.classList.contains('open')) {
          var inp = searchBar.querySelector('input');
          if (inp) inp.focus();
        }
      });
    }

    // --- Mobile Menu ---
    var hamburger = document.getElementById('hamburger');
    var mainNav   = document.getElementById('mainNav');
    var overlay   = document.getElementById('mobileOverlay');

    function closeMobileNav() {
      if (!hamburger || !mainNav || !overlay) return;
      hamburger.classList.remove('active');
      mainNav.classList.remove('mobile-open');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (hamburger) {
      hamburger.addEventListener('click', function() {
        var isOpen = mainNav.classList.toggle('mobile-open');
        hamburger.classList.toggle('active', isOpen);
        overlay.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
    }
    if (overlay) overlay.addEventListener('click', closeMobileNav);

    // Mobile nav styles
    var mobileStyle = document.createElement('style');
    mobileStyle.textContent = '\
      @media (max-width: 900px) {\
        .main-nav.mobile-open {\
          display: flex !important; flex-direction: column;\
          position: fixed; top: 0; left: 0; width: 300px; height: 100vh;\
          background: #fff; z-index: 1001; padding: 80px 0 32px;\
          overflow-y: auto; box-shadow: 4px 0 20px rgba(0,0,0,0.15);\
        }\
        .main-nav.mobile-open > ul { flex-direction: column; gap: 0; }\
        .main-nav.mobile-open > ul > li > a { padding: 14px 24px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }\
        .mega-menu { position: static !important; transform: none !important; flex-direction: column !important;\
          min-width: unset !important; border: none !important; box-shadow: none !important;\
          opacity: 1 !important; visibility: visible !important; display: none;\
          border-top: none !important; background: #f8f8f0 !important; }\
        .has-dropdown:hover .mega-menu { display: flex; }\
        .mega-col { padding: 12px 32px !important; }\
      }';
    document.head.appendChild(mobileStyle);

    // --- Hero Slider ---
    var slides   = document.querySelectorAll('.hero-slide');
    var dots     = document.querySelectorAll('.dot');
    var current  = 0;
    var autoPlay = null;

    function goToSlide(index) {
      if (!slides.length) return;
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('active');
      current = ((index % slides.length) + slides.length) % slides.length;
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function startAutoPlay() {
      autoPlay = setInterval(function() { goToSlide(current + 1); }, 5000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlay);
      startAutoPlay();
    }

    var nextBtn = document.getElementById('sliderNext');
    var prevBtn = document.getElementById('sliderPrev');
    if (nextBtn) nextBtn.addEventListener('click', function() { goToSlide(current + 1); resetAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', function() { goToSlide(current - 1); resetAutoPlay(); });

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        goToSlide(parseInt(this.dataset.index, 10));
        resetAutoPlay();
      });
    });

    if (slides.length > 1) startAutoPlay();

    // --- Product Filter Tabs ---
    var tabBtns      = document.querySelectorAll('.tab-btn');
    var productCards = document.querySelectorAll('.product-card[data-cat]');

    tabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        tabBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var tab = btn.dataset.tab;
        productCards.forEach(function(card) {
          card.style.display = (tab === 'all' || card.dataset.cat === tab) ? '' : 'none';
        });
      });
    });

    // --- Wishlist Toggle (demo, replaced by YITH plugin when active) ---
    document.querySelectorAll('.action-btn').forEach(function(btn) {
      var icon = btn.querySelector('i.fa-heart, i.fa-regular');
      if (!icon) return;
      btn.addEventListener('click', function() {
        if (icon.classList.contains('fa-regular')) {
          icon.classList.replace('fa-regular', 'fa-solid');
          btn.style.background = '#800020';
          btn.style.color = '#fff';
        } else {
          icon.classList.replace('fa-solid', 'fa-regular');
          btn.style.background = '';
          btn.style.color = '';
        }
      });
    });

    // --- Update cart count via AJAX after WC add-to-cart ---
    $(document.body).on('added_to_cart', function() {
      $.post(lussoVogue.ajaxUrl, { action: 'lussovogue_cart_count', nonce: lussoVogue.nonce }, function(res) {
        if (res.success) {
          var badge = document.querySelector('.cart-count');
          if (badge) badge.textContent = res.data.count;
        }
      });
    });

    // --- Newsletter (static fallback, override with Mailchimp plugin) ---
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm && !newsletterForm.dataset.plugin) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var inp = this.querySelector('input[type=email]');
        var btn = this.querySelector('button[type=submit]');
        btn.textContent = 'Subscribed!';
        btn.style.background = '#800020';
        if (inp) inp.value = '';
        setTimeout(function() {
          btn.textContent = 'Subscribe';
          btn.style.background = '';
        }, 3000);
      });
    }

  });

})(jQuery);
