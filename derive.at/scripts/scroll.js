let scrolled = false;

const addScrollListener = function() {
  const header = document.querySelector('.header');
  const layoutScroll = document.querySelector('.layout__scroll');
  const linkTop = document.querySelector('.sidebar__link__top');

  layoutScroll.addEventListener('scroll', function() {
    if(layoutScroll.scrollTop < 100) {
      if(scrolled) {
        header.classList.remove('compact');
        linkTop.classList.remove('active');
        scrolled = false;
      }
    } else if(!scrolled) {
      header.classList.add('compact');
      linkTop.classList.add('active');
      scrolled = true;
    }
  });
};

addScrollListener();

document.addEventListener("turbolinks:render", addScrollListener);
