<?php get_header(); ?>

<main class="site-main">
  <div class="container" style="padding: 60px 24px;">
    <?php if ( have_posts() ) : ?>
      <div class="products-grid">
        <?php while ( have_posts() ) : the_post(); ?>
          <article id="post-<?php the_ID(); ?>" <?php post_class( 'product-card' ); ?>>
            <?php if ( has_post_thumbnail() ) : ?>
              <div class="product-image"><a href="<?php the_permalink(); ?>"><?php the_post_thumbnail( 'product-card' ); ?></a></div>
            <?php endif; ?>
            <div class="product-info">
              <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
              <div><?php the_excerpt(); ?></div>
            </div>
          </article>
        <?php endwhile; ?>
      </div>
      <div style="text-align:center;margin-top:40px;"><?php the_posts_pagination(); ?></div>
    <?php else : ?>
      <p><?php esc_html_e( 'No content found.', 'lussovogue' ); ?></p>
    <?php endif; ?>
  </div>
</main>

<?php get_footer(); ?>
