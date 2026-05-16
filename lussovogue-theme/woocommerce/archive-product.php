<?php
defined( 'ABSPATH' ) || exit;
get_header();
?>

<main class="wc-main">
  <div class="container">

    <?php do_action( 'woocommerce_before_main_content' ); ?>

    <!-- Shop Header -->
    <div class="shop-header">
      <div class="shop-header-left">
        <?php woocommerce_breadcrumb(); ?>
        <h1 class="shop-title">
          <?php woocommerce_page_title(); ?>
        </h1>
      </div>
      <div class="shop-header-right">
        <?php woocommerce_catalog_ordering(); ?>
      </div>
    </div>

    <div class="shop-layout">

      <!-- Sidebar Filters -->
      <aside class="shop-sidebar">
        <?php dynamic_sidebar( 'shop-sidebar' ); ?>
        <?php if ( ! is_active_sidebar( 'shop-sidebar' ) ) : ?>
          <div class="widget">
            <h3 class="widget-title"><?php esc_html_e( 'Categories', 'lussovogue' ); ?></h3>
            <?php the_widget( 'WC_Widget_Product_Categories' ); ?>
          </div>
          <div class="widget">
            <h3 class="widget-title"><?php esc_html_e( 'Filter by Price', 'lussovogue' ); ?></h3>
            <?php the_widget( 'WC_Widget_Price_Filter' ); ?>
          </div>
        <?php endif; ?>
      </aside>

      <!-- Products Grid -->
      <div class="shop-products">
        <?php if ( woocommerce_product_loop() ) : ?>
          <?php woocommerce_product_loop_start(); ?>
          <?php while ( have_posts() ) : the_post(); ?>
            <?php wc_get_template_part( 'content', 'product' ); ?>
          <?php endwhile; ?>
          <?php woocommerce_product_loop_end(); ?>
          <div class="wc-pagination">
            <?php woocommerce_pagination(); ?>
          </div>
        <?php else : ?>
          <?php do_action( 'woocommerce_no_products_found' ); ?>
        <?php endif; ?>
      </div>
    </div>

    <?php do_action( 'woocommerce_after_main_content' ); ?>
  </div>
</main>

<?php get_footer(); ?>
