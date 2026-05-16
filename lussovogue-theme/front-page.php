<?php get_header(); ?>

<!-- ===== HERO SLIDER ===== -->
<section class="hero">
  <div class="hero-slider" id="heroSlider">
    <?php
    // ACF repeater or fallback static slides
    $slides = [];
    if ( function_exists( 'have_rows' ) && have_rows( 'hero_slides', 'option' ) ) {
      while ( have_rows( 'hero_slides', 'option' ) ) {
        the_row();
        $slides[] = [
          'tag'   => get_sub_field( 'tag' ),
          'title' => get_sub_field( 'title' ),
          'desc'  => get_sub_field( 'description' ),
          'btn1'  => [ 'text' => get_sub_field( 'btn1_text' ), 'url' => get_sub_field( 'btn1_url' ) ],
          'btn2'  => [ 'text' => get_sub_field( 'btn2_text' ), 'url' => get_sub_field( 'btn2_url' ) ],
          'image' => get_sub_field( 'image' ),
          'bg'    => get_sub_field( 'bg_color' ) ?: 'linear-gradient(to right, #000 40%, #800020 100%)',
        ];
      }
    }

    // Default slides fallback
    if ( empty( $slides ) ) {
      $slides = [
        [
          'tag'   => 'New Season',
          'title' => 'Redefine <em>Elegance</em>',
          'desc'  => 'Curated luxury fashion for the modern individual. Explore our latest collection.',
          'btn1'  => [ 'text' => 'Shop Men',   'url' => '#' ],
          'btn2'  => [ 'text' => 'Shop Women', 'url' => '#' ],
          'image' => '',
          'bg'    => 'linear-gradient(to right, #000 40%, #800020 100%)',
        ],
        [
          'tag'   => 'Festive Edit',
          'title' => 'Celebrate <em>in Style</em>',
          'desc'  => 'Premium ethnic and fusion wear for every special occasion.',
          'btn1'  => [ 'text' => 'Explore Collection', 'url' => '#' ],
          'btn2'  => [ 'text' => 'View Lookbook',      'url' => '#' ],
          'image' => '',
          'bg'    => 'linear-gradient(to right, #800020 40%, #1a0008 100%)',
        ],
        [
          'tag'   => 'Sale is Live',
          'title' => 'Up to <em>50% Off</em>',
          'desc'  => 'Premium fashion at unbeatable prices. Limited time offer.',
          'btn1'  => [ 'text' => 'Shop Sale', 'url' => '#' ],
          'btn2'  => [],
          'image' => '',
          'bg'    => 'linear-gradient(to right, #1a1a1a 40%, #800020 100%)',
        ],
      ];
    }

    foreach ( $slides as $i => $slide ) :
      $active = $i === 0 ? ' active' : '';
    ?>
    <div class="hero-slide<?php echo esc_attr( $active ); ?>" style="background: <?php echo esc_attr( $slide['bg'] ); ?>">
      <div class="hero-content">
        <p class="hero-tag"><?php echo esc_html( $slide['tag'] ); ?></p>
        <h1><?php echo wp_kses( $slide['title'], [ 'em' => [], 'br' => [] ] ); ?></h1>
        <p class="hero-desc"><?php echo esc_html( $slide['desc'] ); ?></p>
        <div class="hero-btns">
          <?php if ( ! empty( $slide['btn1']['text'] ) ) : ?>
            <a href="<?php echo esc_url( $slide['btn1']['url'] ?: '#' ); ?>" class="btn btn-primary"><?php echo esc_html( $slide['btn1']['text'] ); ?></a>
          <?php endif; ?>
          <?php if ( ! empty( $slide['btn2']['text'] ) ) : ?>
            <a href="<?php echo esc_url( $slide['btn2']['url'] ?: '#' ); ?>" class="btn btn-outline"><?php echo esc_html( $slide['btn2']['text'] ); ?></a>
          <?php endif; ?>
        </div>
      </div>
      <div class="hero-image-box">
        <?php if ( ! empty( $slide['image'] ) ) : ?>
          <img src="<?php echo esc_url( $slide['image']['url'] ); ?>" alt="<?php echo esc_attr( $slide['image']['alt'] ); ?>" />
        <?php else : ?>
          <div class="placeholder-img hero-placeholder">
            <i class="fa-solid fa-shirt"></i>
          </div>
        <?php endif; ?>
      </div>
    </div>
    <?php endforeach; ?>
  </div>

  <div class="slider-controls">
    <button class="slider-prev" id="sliderPrev"><i class="fa fa-chevron-left"></i></button>
    <div class="slider-dots" id="sliderDots">
      <?php foreach ( $slides as $i => $slide ) : ?>
        <span class="dot <?php echo $i === 0 ? 'active' : ''; ?>" data-index="<?php echo esc_attr( $i ); ?>"></span>
      <?php endforeach; ?>
    </div>
    <button class="slider-next" id="sliderNext"><i class="fa fa-chevron-right"></i></button>
  </div>
</section>

<!-- ===== CATEGORY STRIP ===== -->
<section class="category-strip">
  <div class="container">
    <div class="strip-grid">
      <a href="#" class="strip-item"><div class="strip-icon"><i class="fa-solid fa-shirt"></i></div><span><?php esc_html_e( 'Shirts', 'lussovogue' ); ?></span></a>
      <a href="#" class="strip-item"><div class="strip-icon"><i class="fa-solid fa-vest"></i></div><span><?php esc_html_e( 'Blazers', 'lussovogue' ); ?></span></a>
      <a href="#" class="strip-item"><div class="strip-icon"><i class="fa-solid fa-person-dress"></i></div><span><?php esc_html_e( 'Dresses', 'lussovogue' ); ?></span></a>
      <a href="#" class="strip-item"><div class="strip-icon"><i class="fa-solid fa-gem"></i></div><span><?php esc_html_e( 'Ethnic', 'lussovogue' ); ?></span></a>
      <a href="#" class="strip-item"><div class="strip-icon"><i class="fa-solid fa-tags"></i></div><span><?php esc_html_e( 'Sale', 'lussovogue' ); ?></span></a>
      <a href="#" class="strip-item"><div class="strip-icon"><i class="fa-solid fa-star"></i></div><span><?php esc_html_e( 'New In', 'lussovogue' ); ?></span></a>
    </div>
  </div>
</section>

<!-- ===== SHOP BY CATEGORY ===== -->
<section class="section shop-category">
  <div class="container">
    <div class="section-header">
      <p class="section-tag"><?php esc_html_e( 'Explore', 'lussovogue' ); ?></p>
      <h2><?php esc_html_e( 'Shop By Category', 'lussovogue' ); ?></h2>
    </div>
    <div class="category-grid">
      <?php
      $categories = get_terms( [
        'taxonomy'   => 'product_cat',
        'hide_empty' => true,
        'number'     => 5,
        'exclude'    => get_option( 'default_product_cat' ),
      ] );
      $cat_icons = [ 'fa-shirt', 'fa-person-dress', 'fa-star', 'fa-gem', 'fa-tags' ];
      $cat_sizes = [ 'cat-large', 'cat-large', 'cat-small', 'cat-small', 'cat-small' ];

      if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) :
        foreach ( $categories as $idx => $cat ) :
          $thumb_id  = get_term_meta( $cat->term_id, 'thumbnail_id', true );
          $thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'category-card' ) : '';
          $cat_url   = get_term_link( $cat );
          $size      = $cat_sizes[ $idx ] ?? 'cat-small';
      ?>
      <a href="<?php echo esc_url( $cat_url ); ?>" class="cat-card <?php echo esc_attr( $size ); ?>">
        <div class="cat-image <?php echo $thumb_url ? '' : 'placeholder-img'; ?>">
          <?php if ( $thumb_url ) : ?>
            <img src="<?php echo esc_url( $thumb_url ); ?>" alt="<?php echo esc_attr( $cat->name ); ?>" />
          <?php else : ?>
            <i class="fa-solid <?php echo esc_attr( $cat_icons[ $idx ] ?? 'fa-shirt' ); ?>"></i>
            <span><?php echo esc_html( $cat->name ); ?></span>
          <?php endif; ?>
        </div>
        <div class="cat-label">
          <h3><?php echo esc_html( $cat->name ); ?></h3>
          <span><?php esc_html_e( 'Shop Now', 'lussovogue' ); ?> <i class="fa fa-arrow-right"></i></span>
        </div>
      </a>
      <?php endforeach;
      else : ?>
        <!-- Fallback when no WC categories -->
        <a href="#" class="cat-card cat-large"><div class="cat-image placeholder-img"><i class="fa-solid fa-shirt"></i><span>Men's</span></div><div class="cat-label"><h3>Men's</h3><span>Shop Now <i class="fa fa-arrow-right"></i></span></div></a>
        <a href="#" class="cat-card cat-large"><div class="cat-image placeholder-img"><i class="fa-solid fa-person-dress"></i><span>Women's</span></div><div class="cat-label"><h3>Women's</h3><span>Shop Now <i class="fa fa-arrow-right"></i></span></div></a>
        <a href="#" class="cat-card cat-small"><div class="cat-image placeholder-img"><i class="fa-solid fa-star"></i><span>New Arrivals</span></div><div class="cat-label"><h3>New Arrivals</h3><span>Shop Now <i class="fa fa-arrow-right"></i></span></div></a>
        <a href="#" class="cat-card cat-small"><div class="cat-image placeholder-img"><i class="fa-solid fa-gem"></i><span>Festive Wear</span></div><div class="cat-label"><h3>Festive Wear</h3><span>Shop Now <i class="fa fa-arrow-right"></i></span></div></a>
        <a href="#" class="cat-card cat-small"><div class="cat-image placeholder-img"><i class="fa-solid fa-tags"></i><span>Sale</span></div><div class="cat-label"><h3>Sale</h3><span>Shop Now <i class="fa fa-arrow-right"></i></span></div></a>
      <?php endif; ?>
    </div>
  </div>
</section>

<!-- ===== NEW ARRIVALS ===== -->
<section class="section products-section">
  <div class="container">
    <div class="section-header">
      <p class="section-tag"><?php esc_html_e( 'Just Dropped', 'lussovogue' ); ?></p>
      <h2><?php esc_html_e( 'New Arrivals', 'lussovogue' ); ?></h2>
      <div class="product-tabs">
        <button class="tab-btn active" data-tab="all"><?php esc_html_e( 'All', 'lussovogue' ); ?></button>
        <button class="tab-btn" data-tab="men"><?php esc_html_e( 'Men', 'lussovogue' ); ?></button>
        <button class="tab-btn" data-tab="women"><?php esc_html_e( 'Women', 'lussovogue' ); ?></button>
      </div>
    </div>

    <?php
    $new_arrivals = new WP_Query( [
      'post_type'      => 'product',
      'posts_per_page' => 8,
      'orderby'        => 'date',
      'order'          => 'DESC',
      'tax_query'      => [
        [ 'taxonomy' => 'product_visibility', 'field' => 'name', 'terms' => 'exclude-from-catalog', 'operator' => 'NOT IN' ],
      ],
    ] );
    ?>

    <div class="products-grid">
      <?php if ( $new_arrivals->have_posts() ) :
        while ( $new_arrivals->have_posts() ) : $new_arrivals->the_post();
          global $product;
          $cats = wp_get_post_terms( get_the_ID(), 'product_cat', [ 'fields' => 'names' ] );
          $cat_slug = wp_get_post_terms( get_the_ID(), 'product_cat', [ 'fields' => 'slugs' ] );
          $gender = 'all';
          foreach ( $cat_slug as $s ) {
            if ( str_contains( $s, 'men' ) || str_contains( $s, 'male' ) ) {
              $gender = str_contains( $s, 'women' ) ? 'women' : 'men';
              break;
            }
            if ( str_contains( $s, 'women' ) || str_contains( $s, 'female' ) ) { $gender = 'women'; break; }
          }
          ?>
          <div class="product-card" data-cat="<?php echo esc_attr( $gender ); ?>">
            <div class="product-image">
              <a href="<?php the_permalink(); ?>">
                <?php if ( has_post_thumbnail() ) : ?>
                  <?php the_post_thumbnail( 'product-card' ); ?>
                <?php else : ?>
                  <div class="placeholder-img product-placeholder"><i class="fa-solid fa-shirt"></i></div>
                <?php endif; ?>
              </a>
              <div class="product-badges">
                <span class="badge badge-new"><?php esc_html_e( 'New', 'lussovogue' ); ?></span>
                <?php if ( $product->is_on_sale() ) : ?>
                  <span class="badge badge-sale"><?php esc_html_e( 'Sale', 'lussovogue' ); ?></span>
                <?php endif; ?>
              </div>
              <div class="product-actions">
                <?php if ( class_exists( 'YITH_WCWL' ) ) : ?>
                  <?php echo do_shortcode( '[yith_wcwl_add_to_wishlist product_id="' . get_the_ID() . '"]' ); ?>
                <?php else : ?>
                  <button class="action-btn" title="Wishlist"><i class="fa-regular fa-heart"></i></button>
                <?php endif; ?>
                <a href="<?php the_permalink(); ?>" class="action-btn" title="View"><i class="fa-regular fa-eye"></i></a>
              </div>
              <?php woocommerce_template_loop_add_to_cart(); ?>
            </div>
            <div class="product-info">
              <p class="product-cat"><?php echo esc_html( implode( ' · ', array_slice( $cats, 0, 2 ) ) ); ?></p>
              <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
              <div class="product-price">
                <?php echo $product->get_price_html(); ?>
              </div>
            </div>
          </div>
        <?php endwhile; wp_reset_postdata(); ?>
      <?php else : ?>
        <p class="no-products"><?php esc_html_e( 'No products found. Add products in WooCommerce.', 'lussovogue' ); ?></p>
      <?php endif; ?>
    </div>

    <div class="view-all-wrap">
      <a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>" class="btn btn-dark"><?php esc_html_e( 'View All Products', 'lussovogue' ); ?></a>
    </div>
  </div>
</section>

<!-- ===== BRAND BANNER ===== -->
<section class="brand-banner">
  <div class="brand-banner-content">
    <p class="section-tag light"><?php esc_html_e( 'Our Story', 'lussovogue' ); ?></p>
    <h2><?php esc_html_e( 'Fashion That Speaks', 'lussovogue' ); ?><br /><em><?php esc_html_e( 'Without Words', 'lussovogue' ); ?></em></h2>
    <p><?php esc_html_e( 'At Lusso Vogue, we believe that style is a language. Every piece in our collection is crafted with precision, designed to make you feel confident, powerful, and effortlessly chic.', 'lussovogue' ); ?></p>
    <a href="<?php echo esc_url( get_permalink( get_page_by_path( 'about' ) ) ?: '#' ); ?>" class="btn btn-outline-light"><?php esc_html_e( 'Discover Our Story', 'lussovogue' ); ?></a>
  </div>
</section>

<!-- ===== BEST SELLERS ===== -->
<section class="section products-section bg-cream">
  <div class="container">
    <div class="section-header">
      <p class="section-tag"><?php esc_html_e( 'Fan Favourites', 'lussovogue' ); ?></p>
      <h2><?php esc_html_e( 'Best Sellers', 'lussovogue' ); ?></h2>
    </div>
    <?php
    $bestsellers = new WP_Query( [
      'post_type'      => 'product',
      'posts_per_page' => 5,
      'meta_key'       => 'total_sales',
      'orderby'        => 'meta_value_num',
      'order'          => 'DESC',
    ] );
    ?>
    <div class="products-grid products-grid-5">
      <?php if ( $bestsellers->have_posts() ) :
        while ( $bestsellers->have_posts() ) : $bestsellers->the_post();
          global $product;
          $cats = wp_get_post_terms( get_the_ID(), 'product_cat', [ 'fields' => 'names' ] );
          ?>
          <div class="product-card">
            <div class="product-image">
              <a href="<?php the_permalink(); ?>">
                <?php if ( has_post_thumbnail() ) : ?>
                  <?php the_post_thumbnail( 'product-card' ); ?>
                <?php else : ?>
                  <div class="placeholder-img product-placeholder"><i class="fa-solid fa-star"></i></div>
                <?php endif; ?>
              </a>
              <div class="product-badges"><span class="badge badge-hot"><?php esc_html_e( 'Best Seller', 'lussovogue' ); ?></span></div>
              <div class="product-actions">
                <button class="action-btn"><i class="fa-regular fa-heart"></i></button>
                <a href="<?php the_permalink(); ?>" class="action-btn"><i class="fa-regular fa-eye"></i></a>
              </div>
              <?php woocommerce_template_loop_add_to_cart(); ?>
            </div>
            <div class="product-info">
              <p class="product-cat"><?php echo esc_html( implode( ' · ', array_slice( $cats, 0, 2 ) ) ); ?></p>
              <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
              <div class="product-price"><?php echo $product->get_price_html(); ?></div>
            </div>
          </div>
        <?php endwhile; wp_reset_postdata(); ?>
      <?php else : ?>
        <p class="no-products"><?php esc_html_e( 'No bestsellers yet.', 'lussovogue' ); ?></p>
      <?php endif; ?>
    </div>
  </div>
</section>

<!-- ===== INSTAGRAM SECTION ===== -->
<section class="section instagram-section">
  <div class="container">
    <div class="section-header">
      <p class="section-tag"><?php esc_html_e( 'Follow Us', 'lussovogue' ); ?></p>
      <h2>@lussovogue</h2>
      <p class="section-sub"><?php esc_html_e( 'Tag us in your photos for a chance to be featured', 'lussovogue' ); ?></p>
    </div>
    <div class="insta-grid">
      <?php for ( $i = 0; $i < 6; $i++ ) : ?>
      <div class="insta-item">
        <div class="placeholder-img insta-placeholder"><i class="fa-brands fa-instagram"></i></div>
        <div class="insta-overlay"><i class="fa-brands fa-instagram"></i></div>
      </div>
      <?php endfor; ?>
    </div>
    <p class="insta-note"><?php esc_html_e( 'Connect an Instagram plugin (e.g. Smash Balloon) to show real posts here.', 'lussovogue' ); ?></p>
  </div>
</section>

<?php get_footer(); ?>
