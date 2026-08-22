<?php
defined( 'ABSPATH' ) || exit;

define( 'LUSSOVOGUE_VERSION', '1.0.0' );
define( 'LUSSOVOGUE_DIR', get_template_directory() );
define( 'LUSSOVOGUE_URI', get_template_directory_uri() );

/* -------------------------------------------------------
   Theme Setup
------------------------------------------------------- */
function lussovogue_setup() {
	load_theme_textdomain( 'lussovogue', LUSSOVOGUE_DIR . '/languages' );

	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ] );
	add_theme_support( 'custom-logo', [
		'height'      => 80,
		'width'       => 200,
		'flex-height' => true,
		'flex-width'  => true,
	] );

	// WooCommerce
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	register_nav_menus( [
		'primary'    => __( 'Primary Menu', 'lussovogue' ),
		'men'        => __( 'Men\'s Menu', 'lussovogue' ),
		'women'      => __( 'Women\'s Menu', 'lussovogue' ),
		'footer'     => __( 'Footer Menu', 'lussovogue' ),
	] );

	add_image_size( 'product-card',  480, 600, true );
	add_image_size( 'hero-banner',  1440, 700, true );
	add_image_size( 'category-card', 720, 480, true );
}
add_action( 'after_setup_theme', 'lussovogue_setup' );

/* -------------------------------------------------------
   Enqueue Scripts & Styles
------------------------------------------------------- */
function lussovogue_scripts() {
	// Google Fonts
	wp_enqueue_style(
		'lussovogue-fonts',
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap',
		[],
		null
	);
	// Font Awesome
	wp_enqueue_style(
		'font-awesome',
		'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
		[],
		'6.5.0'
	);
	// Theme CSS
	wp_enqueue_style(
		'lussovogue-theme',
		LUSSOVOGUE_URI . '/assets/css/theme.css',
		[ 'lussovogue-fonts', 'font-awesome' ],
		LUSSOVOGUE_VERSION
	);

	// Theme JS
	wp_enqueue_script(
		'lussovogue-theme',
		LUSSOVOGUE_URI . '/assets/js/theme.js',
		[ 'jquery' ],
		LUSSOVOGUE_VERSION,
		true
	);

	wp_localize_script( 'lussovogue-theme', 'lussoVogue', [
		'ajaxUrl' => admin_url( 'admin-ajax.php' ),
		'nonce'   => wp_create_nonce( 'lussovogue_nonce' ),
		'cartUrl' => wc_get_cart_url(),
	] );

	if ( is_singular() && comments_open() ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'lussovogue_scripts' );

/* -------------------------------------------------------
   Widget Areas
------------------------------------------------------- */
function lussovogue_widgets_init() {
	register_sidebar( [
		'name'          => __( 'Shop Sidebar', 'lussovogue' ),
		'id'            => 'shop-sidebar',
		'before_widget' => '<div class="widget %2$s">',
		'after_widget'  => '</div>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	] );
	register_sidebar( [
		'name'          => __( 'Footer Column 1', 'lussovogue' ),
		'id'            => 'footer-1',
		'before_widget' => '<div class="widget %2$s">',
		'after_widget'  => '</div>',
		'before_title'  => '<h4 class="footer-widget-title">',
		'after_title'   => '</h4>',
	] );
}
add_action( 'widgets_init', 'lussovogue_widgets_init' );

/* -------------------------------------------------------
   WooCommerce Tweaks
------------------------------------------------------- */
// Remove default WC wrappers, use ours
remove_action( 'woocommerce_before_main_content', 'woocommerce_output_content_wrapper', 10 );
remove_action( 'woocommerce_after_main_content',  'woocommerce_output_content_wrapper_end', 10 );

add_action( 'woocommerce_before_main_content', function() {
	echo '<main class="wc-main"><div class="container">';
} );
add_action( 'woocommerce_after_main_content', function() {
	echo '</div></main>';
} );

// Products per page
add_filter( 'loop_shop_per_page', fn() => 16, 20 );

// Products per row (columns)
add_filter( 'loop_shop_columns', fn() => 4 );

// Remove default breadcrumb — optional
// remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );

/* -------------------------------------------------------
   Custom Logo Helper
------------------------------------------------------- */
function lussovogue_logo() {
	if ( has_custom_logo() ) {
		the_custom_logo();
	} else {
		echo '<a href="' . esc_url( home_url( '/' ) ) . '" class="logo-text-link">
			<span class="logo-main">LUSSO</span>
			<span class="logo-sub">VOGUE</span>
		</a>';
	}
}

/* -------------------------------------------------------
   Homepage Sections Helper — ACF / Custom Fields
   (Falls back to static content if ACF not installed)
------------------------------------------------------- */
function lussovogue_get_field( $key, $default = '' ) {
	if ( function_exists( 'get_field' ) ) {
		$val = get_field( $key );
		return $val ?: $default;
	}
	return $default;
}

/* -------------------------------------------------------
   AJAX: Mini Cart Count
------------------------------------------------------- */
add_action( 'wp_ajax_lussovogue_cart_count',        'lussovogue_cart_count' );
add_action( 'wp_ajax_nopriv_lussovogue_cart_count', 'lussovogue_cart_count' );
function lussovogue_cart_count() {
	wp_send_json_success( [ 'count' => WC()->cart->get_cart_contents_count() ] );
}
