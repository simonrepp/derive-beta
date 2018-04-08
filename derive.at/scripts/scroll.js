const addScrollListener = function() {
  const layoutScroll = document.querySelector('.layout__scroll');
  const header = document.querySelector('.header');
  const linkTop = document.querySelector('.sidebar__link__top');
  let scrollActive = false;

  const pagination = document.querySelector('.pagination');
  let paginationDocked = false;

  // TODO: Check/set *docked state for scroll and pagination on addScrollListener (because might be in middle of page after turbolink render ?)

  layoutScroll.addEventListener('scroll', function() {
    if(layoutScroll.scrollTop === 0) {
      if(scrollActive) {
        header.classList.remove('compact');
        linkTop.classList.remove('active');
        scrollActive = false;
      }
    } else if(!scrollActive) {
      header.classList.add('compact');
      linkTop.classList.add('active');
      scrollActive = true;
    }

    if(pagination) {
      if(pagination.getBoundingClientRect().top === 100) {
        if(!paginationDocked) {
          pagination.classList.add('pagination--docked');
          paginationDocked = true;
        }
      } else if(paginationDocked) {
        pagination.classList.remove('pagination--docked');
        paginationDocked = false;
      }
    }
  });
};

addScrollListener();

document.addEventListener("turbolinks:render", addScrollListener);
