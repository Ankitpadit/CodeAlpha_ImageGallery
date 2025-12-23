
document.addEventListener('DOMContentLoaded', () => {
  const gallery = Array.from(document.querySelectorAll('.gallery-item'));
  const featuredImage = document.getElementById('featuredImage');
  const featuredCaption = document.getElementById('featuredCaption');
  const featPrev = document.getElementById('featPrev');
  const featNext = document.getElementById('featNext');


  const lb = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  const categoryBtns = document.querySelectorAll('.category-btn');
  const imageFilterSelect = document.getElementById('imageFilter');

  let currentIndex = 0;

  const items = gallery.map(el => {
    const img = el.querySelector('img');
    const caption = el.querySelector('figcaption')?.innerText || '';
    const category = el.dataset.category || 'uncategorized';
    return {
      el,
      src: img.src,
      alt: img.alt || caption,
      caption,
      category
    };
  });


  function showFeatured(index){
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    featuredImage.style.opacity = 0;
    // small delay for fade
    setTimeout(() => {
      featuredImage.src = item.src.replace('/600/400','/1000/600'); // try to use larger source if available
      featuredImage.alt = item.alt;
      featuredCaption.textContent = `${item.caption} — ${capitalize(item.category)}`;
      featuredImage.style.opacity = 1;
      // sync filter
      applyCssFilterToAll();
    }, 160);
  }

  featPrev.addEventListener('click', () => showFeatured(currentIndex - 1));
  featNext.addEventListener('click', () => showFeatured(currentIndex + 1));


  items.forEach((it, idx) => {
    it.el.addEventListener('click', () => {
      openLightbox(idx);
    });
  });


  function openLightbox(index){
    index = (index + items.length) % items.length;
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    showLightbox(index);
    // focus close for accessibility
    lbClose.focus();
  }
  function closeLightbox(){
    lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  function showLightbox(index){
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    // Use bigger image if possible
    lbImage.src = item.src.replace('/600/400','/1200/800');
    lbImage.alt = item.alt;
    lbCaption.textContent = `${item.caption} — ${capitalize(item.category)}`;
    applyCssFilterToAll();
  }
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => showLightbox(currentIndex - 1));
  lbNext.addEventListener('click', () => showLightbox(currentIndex + 1));


  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightbox(currentIndex - 1);
      if (e.key === 'ArrowRight') showLightbox(currentIndex + 1);
    } else {
      // when not in lightbox allow left/right to change featured
      if (e.key === 'ArrowLeft') showFeatured(currentIndex - 1);
      if (e.key === 'ArrowRight') showFeatured(currentIndex + 1);
    }
  });


  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });


  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');
      const cat = btn.dataset.category;
      filterCategory(cat);
    });
  });

  function filterCategory(category){
    items.forEach(it => {
      if (category === 'all' || it.category === category) {
        it.el.classList.remove('hidden');
      } else {
        it.el.classList.add('hidden');
      }
    });
    // If the featured image is filtered out, jump to the next available
    const visible = items.findIndex(it => !it.el.classList.contains('hidden'));
    if (visible >= 0) showFeatured(visible);
  }


  imageFilterSelect.addEventListener('change', applyCssFilterToAll);

  function applyCssFilterToAll(){
    const filterValue = imageFilterSelect.value;

    document.querySelectorAll('.gallery-item img').forEach(img => {
      img.style.filter = filterValue === 'none' ? '' : filterValue;
    });

    featuredImage.style.filter = filterValue === 'none' ? '' : filterValue;
    lbImage.style.filter = filterValue === 'none' ? '' : filterValue;
  }

  function capitalize(s='') {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }


  showFeatured(0);
  applyCssFilterToAll();

  // Optional: lazy-loading via intersection observer for better perf
  if ('IntersectionObserver' in window) {
    const imgs = document.querySelectorAll('.gallery-item img');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          io.unobserve(img);
        }
      });
    }, {rootMargin: '200px'});

    imgs.forEach(img => io.observe(img));
  }
});
