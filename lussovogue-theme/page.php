<?php get_header(); ?>

<main class="site-main">
  <div class="container" style="padding: 60px 24px; max-width: 900px;">
    <?php while ( have_posts() ) : the_post(); ?>
      <article id="page-<?php the_ID(); ?>" <?php post_class(); ?>>
        <h1 class="page-title" style="font-family: var(--font-serif); font-size: 2.5rem; margin-bottom: 32px;"><?php the_title(); ?></h1>
        <div class="page-content" style="line-height: 1.8; color: #333;">
          <?php the_content(); ?>
        </div>
      </article>
    <?php endwhile; ?>
  </div>
</main>

<?php get_footer(); ?>
