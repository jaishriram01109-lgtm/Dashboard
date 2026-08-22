<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="profile" href="https://gmpg.org/xfn/11">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- ===== ANNOUNCEMENT BAR ===== -->
<div class="announcement-bar">
  <div class="announcement-track">
    <span><?php echo esc_html( get_theme_mod( 'announcement_text', 'Free Shipping on Orders Above ₹999 &nbsp;|&nbsp; Use Code: LUSSO10 for 10% Off &nbsp;|&nbsp; New Collection Now Live' ) ); ?> &nbsp;|&nbsp; Free Shipping on Orders Above ₹999 &nbsp;|&nbsp; Use Code: LUSSO10 for 10% Off &nbsp;|&nbsp; New Collection Now Live &nbsp;|&nbsp;</span>
    <span aria-hidden="true">Free Shipping on Orders Above ₹999 &nbsp;|&nbsp; Use Code: LUSSO10 for 10% Off &nbsp;|&nbsp; New Collection Now Live &nbsp;|&nbsp;</span>
  </div>
</div>

<!-- ===== HEADER ===== -->
<header class="site-header" id="siteHeader">
  <div class="header-inner container">

    <button class="hamburger" id="hamburger" aria-label="<?php esc_attr_e( 'Open Menu', 'lussovogue' ); ?>">
      <span></span><span></span><span></span>
    </button>

    <div class="logo">
      <?php lussovogue_logo(); ?>
    </div>

    <nav class="main-nav" id="mainNav" aria-label="<?php esc_attr_e( 'Primary Navigation', 'lussovogue' ); ?>">
      <ul>
        <li class="has-dropdown">
          <a href="<?php echo esc_url( get_term_link( 'mens', 'product_cat' ) ?: '#' ); ?>">
            <?php esc_html_e( 'Men', 'lussovogue' ); ?> <i class="fa fa-chevron-down"></i>
          </a>
          <div class="mega-menu">
            <div class="mega-col">
              <h4><?php esc_html_e( 'Clothing', 'lussovogue' ); ?></h4>
              <?php
              wp_nav_menu( [
                'theme_location' => 'men',
                'container'      => false,
                'fallback_cb'    => function() {
                  echo '<ul>
                    <li><a href="#">Shirts</a></li>
                    <li><a href="#">Blazers</a></li>
                    <li><a href="#">Trousers</a></li>
                    <li><a href="#">Suits</a></li>
                    <li><a href="#">Kurtas</a></li>
                  </ul>';
                },
              ] );
              ?>
            </div>
            <div class="mega-col">
              <h4><?php esc_html_e( 'Occasion', 'lussovogue' ); ?></h4>
              <ul>
                <li><a href="#"><?php esc_html_e( 'Formal', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Casual', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Festive', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Wedding', 'lussovogue' ); ?></a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4><?php esc_html_e( 'Shop By', 'lussovogue' ); ?></h4>
              <ul>
                <li><a href="<?php echo esc_url( wc_get_endpoint_url( 'new-arrivals', '', wc_get_page_permalink( 'shop' ) ) ); ?>"><?php esc_html_e( 'New Arrivals', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Best Sellers', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Sale', 'lussovogue' ); ?></a></li>
              </ul>
            </div>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="<?php echo esc_url( get_term_link( 'womens', 'product_cat' ) ?: '#' ); ?>">
            <?php esc_html_e( 'Women', 'lussovogue' ); ?> <i class="fa fa-chevron-down"></i>
          </a>
          <div class="mega-menu">
            <div class="mega-col">
              <h4><?php esc_html_e( 'Western', 'lussovogue' ); ?></h4>
              <?php
              wp_nav_menu( [
                'theme_location' => 'women',
                'container'      => false,
                'fallback_cb'    => function() {
                  echo '<ul>
                    <li><a href="#">Dresses</a></li>
                    <li><a href="#">Tops</a></li>
                    <li><a href="#">Co-ords</a></li>
                    <li><a href="#">Jumpsuits</a></li>
                  </ul>';
                },
              ] );
              ?>
            </div>
            <div class="mega-col">
              <h4><?php esc_html_e( 'Ethnic', 'lussovogue' ); ?></h4>
              <ul>
                <li><a href="#"><?php esc_html_e( 'Sarees', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Lehengas', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Kurtas', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Salwar Suits', 'lussovogue' ); ?></a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4><?php esc_html_e( 'Shop By', 'lussovogue' ); ?></h4>
              <ul>
                <li><a href="#"><?php esc_html_e( 'New Arrivals', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Best Sellers', 'lussovogue' ); ?></a></li>
                <li><a href="#"><?php esc_html_e( 'Sale', 'lussovogue' ); ?></a></li>
              </ul>
            </div>
          </div>
        </li>

        <li><a href="#"><?php esc_html_e( 'New Arrivals', 'lussovogue' ); ?></a></li>
        <li><a href="#"><?php esc_html_e( 'Collections', 'lussovogue' ); ?></a></li>
        <li><a href="#" class="sale-link"><?php esc_html_e( 'Sale', 'lussovogue' ); ?></a></li>
      </ul>
    </nav>

    <div class="header-actions">
      <button class="icon-btn search-toggle" id="searchToggle" aria-label="<?php esc_attr_e( 'Search', 'lussovogue' ); ?>">
        <i class="fa fa-search"></i>
      </button>
      <?php if ( class_exists( 'WooCommerce' ) ) : ?>
        <a href="<?php echo esc_url( get_permalink( get_option( 'woocommerce_myaccount_page_id' ) ) ); ?>" class="icon-btn" aria-label="<?php esc_attr_e( 'My Account', 'lussovogue' ); ?>">
          <i class="fa-regular fa-user"></i>
        </a>
        <a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="icon-btn cart-btn" aria-label="<?php esc_attr_e( 'Cart', 'lussovogue' ); ?>">
          <i class="fa-solid fa-bag-shopping"></i>
          <span class="cart-count"><?php echo WC()->cart ? WC()->cart->get_cart_contents_count() : 0; ?></span>
        </a>
      <?php endif; ?>
    </div>
  </div>

  <!-- Search Bar -->
  <div class="search-bar" id="searchBar">
    <div class="search-inner">
      <form role="search" method="get" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <input type="search" name="s" placeholder="<?php esc_attr_e( 'Search for products...', 'lussovogue' ); ?>" value="<?php echo get_search_query(); ?>" />
        <?php if ( class_exists( 'WooCommerce' ) ) : ?>
          <input type="hidden" name="post_type" value="product" />
        <?php endif; ?>
        <button type="submit"><i class="fa fa-search"></i></button>
      </form>
    </div>
  </div>
</header>

<div class="mobile-overlay" id="mobileOverlay"></div>
