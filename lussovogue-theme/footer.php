<!-- ===== USP STRIP ===== -->
<section class="usp-strip">
  <div class="container">
    <div class="usp-grid">
      <div class="usp-item">
        <i class="fa-solid fa-truck-fast"></i>
        <div>
          <h4><?php esc_html_e( 'Free Shipping', 'lussovogue' ); ?></h4>
          <p><?php esc_html_e( 'On orders above ₹999', 'lussovogue' ); ?></p>
        </div>
      </div>
      <div class="usp-item">
        <i class="fa-solid fa-rotate-left"></i>
        <div>
          <h4><?php esc_html_e( 'Easy Returns', 'lussovogue' ); ?></h4>
          <p><?php esc_html_e( '15-day hassle-free returns', 'lussovogue' ); ?></p>
        </div>
      </div>
      <div class="usp-item">
        <i class="fa-solid fa-shield-halved"></i>
        <div>
          <h4><?php esc_html_e( 'Secure Payment', 'lussovogue' ); ?></h4>
          <p><?php esc_html_e( '100% secure transactions', 'lussovogue' ); ?></p>
        </div>
      </div>
      <div class="usp-item">
        <i class="fa-solid fa-headset"></i>
        <div>
          <h4><?php esc_html_e( '24/7 Support', 'lussovogue' ); ?></h4>
          <p><?php esc_html_e( 'Dedicated customer care', 'lussovogue' ); ?></p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== NEWSLETTER ===== -->
<section class="newsletter-section">
  <div class="container">
    <div class="newsletter-inner">
      <div class="newsletter-text">
        <p class="section-tag light"><?php esc_html_e( 'Stay Updated', 'lussovogue' ); ?></p>
        <h2><?php esc_html_e( 'Join the Lusso Club', 'lussovogue' ); ?></h2>
        <p><?php esc_html_e( 'Subscribe for exclusive offers, new arrivals & style inspiration.', 'lussovogue' ); ?></p>
      </div>
      <form class="newsletter-form" id="newsletterForm">
        <?php wp_nonce_field( 'lussovogue_nonce', 'newsletter_nonce' ); ?>
        <div class="form-row">
          <input type="email" name="email" placeholder="<?php esc_attr_e( 'Enter your email address', 'lussovogue' ); ?>" required />
          <button type="submit" class="btn btn-primary"><?php esc_html_e( 'Subscribe', 'lussovogue' ); ?></button>
        </div>
        <p class="form-note"><?php esc_html_e( 'By subscribing you agree to our Privacy Policy. Unsubscribe anytime.', 'lussovogue' ); ?></p>
      </form>
    </div>
  </div>
</section>

<!-- ===== FOOTER ===== -->
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">

      <div class="footer-brand">
        <div class="footer-logo">
          <?php lussovogue_logo(); ?>
        </div>
        <p><?php esc_html_e( 'Premium fashion for the modern individual. Crafted with passion, delivered with purpose.', 'lussovogue' ); ?></p>
        <div class="social-links">
          <?php $instagram = get_theme_mod( 'social_instagram', '#' ); ?>
          <?php $facebook  = get_theme_mod( 'social_facebook',  '#' ); ?>
          <?php $twitter   = get_theme_mod( 'social_twitter',   '#' ); ?>
          <?php $pinterest = get_theme_mod( 'social_pinterest', '#' ); ?>
          <?php $youtube   = get_theme_mod( 'social_youtube',   '#' ); ?>
          <a href="<?php echo esc_url( $instagram ); ?>" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="<?php echo esc_url( $facebook );  ?>" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="<?php echo esc_url( $twitter );   ?>" aria-label="Twitter"><i class="fa-brands fa-x-twitter"></i></a>
          <a href="<?php echo esc_url( $pinterest ); ?>" aria-label="Pinterest"><i class="fa-brands fa-pinterest-p"></i></a>
          <a href="<?php echo esc_url( $youtube );   ?>" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
        </div>
      </div>

      <div class="footer-col">
        <h4><?php esc_html_e( 'Shop', 'lussovogue' ); ?></h4>
        <ul>
          <?php if ( class_exists( 'WooCommerce' ) ) : ?>
            <li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( "Men's Collection", 'lussovogue' ); ?></a></li>
            <li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( "Women's Collection", 'lussovogue' ); ?></a></li>
            <li><a href="#"><?php esc_html_e( 'New Arrivals', 'lussovogue' ); ?></a></li>
            <li><a href="#"><?php esc_html_e( 'Best Sellers', 'lussovogue' ); ?></a></li>
            <li><a href="#"><?php esc_html_e( 'Sale', 'lussovogue' ); ?></a></li>
          <?php endif; ?>
        </ul>
      </div>

      <div class="footer-col">
        <h4><?php esc_html_e( 'Help', 'lussovogue' ); ?></h4>
        <ul>
          <li><a href="#"><?php esc_html_e( 'Track My Order', 'lussovogue' ); ?></a></li>
          <li><a href="#"><?php esc_html_e( 'Returns & Exchanges', 'lussovogue' ); ?></a></li>
          <li><a href="#"><?php esc_html_e( 'Shipping Policy', 'lussovogue' ); ?></a></li>
          <li><a href="#"><?php esc_html_e( 'Size Guide', 'lussovogue' ); ?></a></li>
          <li><a href="#"><?php esc_html_e( 'FAQs', 'lussovogue' ); ?></a></li>
          <li><a href="#"><?php esc_html_e( 'Contact Us', 'lussovogue' ); ?></a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4><?php esc_html_e( 'Company', 'lussovogue' ); ?></h4>
        <ul>
          <li><a href="#"><?php esc_html_e( 'About Us', 'lussovogue' ); ?></a></li>
          <li><a href="#"><?php esc_html_e( 'Privacy Policy', 'lussovogue' ); ?></a></li>
          <li><a href="#"><?php esc_html_e( 'Terms of Service', 'lussovogue' ); ?></a></li>
          <li><a href="#"><?php esc_html_e( 'Sustainability', 'lussovogue' ); ?></a></li>
        </ul>
        <div class="footer-contact">
          <h4><?php esc_html_e( 'Contact', 'lussovogue' ); ?></h4>
          <?php $email = get_theme_mod( 'contact_email', 'hello@lussovogue.com' ); ?>
          <?php $phone = get_theme_mod( 'contact_phone', '+91 98765 43210' ); ?>
          <p><i class="fa fa-envelope"></i> <?php echo esc_html( $email ); ?></p>
          <p><i class="fa fa-phone"></i> <?php echo esc_html( $phone ); ?></p>
        </div>
      </div>

    </div>

    <div class="footer-bottom">
      <p>&copy; <?php echo esc_html( date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. <?php esc_html_e( 'All rights reserved.', 'lussovogue' ); ?></p>
      <div class="payment-icons">
        <span class="pay-icon">UPI</span>
        <span class="pay-icon">VISA</span>
        <span class="pay-icon">COD</span>
        <span class="pay-icon">EMI</span>
      </div>
    </div>
  </div>
</footer>

<button class="back-to-top" id="backToTop" aria-label="<?php esc_attr_e( 'Back to top', 'lussovogue' ); ?>">
  <i class="fa fa-chevron-up"></i>
</button>

<?php wp_footer(); ?>
</body>
</html>
