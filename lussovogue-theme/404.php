<?php get_header(); ?>
<main class="site-main">
  <div class="container" style="padding:120px 24px; text-align:center;">
    <p class="section-tag"><?php esc_html_e('404 Error', 'lussovogue'); ?></p>
    <h1 style="font-family:var(--font-serif);font-size:3rem;margin-bottom:16px;"><?php esc_html_e('Page Not Found', 'lussovogue'); ?></h1>
    <p style="color:#666;margin-bottom:32px;"><?php esc_html_e('The page you are looking for does not exist.', 'lussovogue'); ?></p>
    <a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-dark"><?php esc_html_e('Back to Home', 'lussovogue'); ?></a>
  </div>
</main>
<?php get_footer(); ?>
