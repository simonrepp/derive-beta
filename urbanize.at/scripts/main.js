const Turbolinks = require('turbolinks');

Turbolinks.start();

window.Turbolinks = Turbolinks;

window.filterEvents = () => {
  const activeDate = document.querySelector('.active_date');
  const activeCategory = document.querySelector('.active_category');
  const activeQuery = document.querySelector('.active_query');

  const queryRegex = activeQuery.value === '' ? null : new RegExp(activeQuery.value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');

  let displayAny = false;
  for(const event of document.querySelectorAll('.event_filterable')) {
    let display = true;

    if(activeDate.dataset.value &&
       activeDate.dataset.value !== 'all' &&
       event.dataset.date !== activeDate.dataset.value) {
      display = false;
    }

    if(activeCategory.dataset.value &&
       activeCategory.dataset.value !== 'all' &&
       event.dataset.category !== activeCategory.dataset.value) {
      display = false;
    }

    if(queryRegex !== null) {
      const { searchText } = JSON.parse(event.querySelector('.search_text').innerHTML);

      if(!queryRegex.test(searchText)) {
        display = false;
      }
    }

    displayAny = displayAny || display;

    event.style.display = display ? 'block' : 'none';
  }

  document.querySelector('.no_results').style.display = displayAny ? 'none' : 'block';
};

window.updateFilter = (option, apply = true) => {
  if(option.dataset.date) {
    const activeDate = document.querySelector('.active_date');

    activeDate.dataset.value = option.dataset.date;

    if(option.dataset.date === 'all') {
      activeDate.innerHTML = '';
    } else {
      activeDate.innerHTML = ': ' + option.innerHTML;
    }
  }

  if(option.dataset.category) {
    const activeCategory = document.querySelector('.active_category');

    activeCategory.dataset.value = option.dataset.category;

    if(option.dataset.category === 'all') {
      activeCategory.innerHTML = '';
    } else {
      activeCategory.innerHTML = ': ' + option.innerHTML;
    }
  }

  if(apply) {
    window.filterEvents();
  }
};

window.initFilters = () => {
  if(window.location.pathname !== '/programm/') return;

  const search = new URLSearchParams(window.location.search);

  const dateOption = document.querySelector(`a[data-date="${search.has('datum') ? search.get('datum') : 'all'}"]`);
  const categoryOption = document.querySelector(`a[data-category="${search.has('kategorie') ? search.get('kategorie') : 'all'}"]`);

  window.updateFilter(dateOption, false);
  window.updateFilter(categoryOption, false);

  window.filterEvents();
};

const WIDTH = 920;

window.resizeBanners = () => {
  const logoLarge = document.querySelector('.banner_large .logo');

  if(logoLarge) {
    const width = document.documentElement.clientWidth;

    if(width > 1350) {
      logoLarge.style.transform = `scale(1.07) rotateZ(0.001deg)`;
    } else {
      logoLarge.style.transform = `scale(${(width / WIDTH) * 0.7}) rotateZ(0.001deg)`;
    }


  } else {
    const logoSmall = document.querySelector('.banner_small_accent .logo, .banner_small_white .logo');

    if(logoSmall) {
      const width = document.documentElement.clientWidth;

      if(width > 500) {
        logoSmall.style.transform = `scale(0.33) rotateZ(0.001deg)`;
      } else {
        logoSmall.style.transform = `scale(${(width / WIDTH) * 0.7}) rotateZ(0.001deg)`;
      }
    }
  }
};

window.fadeMobileMenuBackdrop = () => {
  const backdrop = document.querySelector('.alignment_mobile .backdrop');

  if (window.scrollY < 60) {
    backdrop.style.opacity = 0;
  } else {
    backdrop.style.opacity = 1;
  }
};

window.addEventListener('scroll', window.fadeMobileMenuBackdrop);
window.addEventListener('resize', window.resizeBanners);
document.addEventListener('DOMContentLoaded', window.resizeBanners);
document.addEventListener('turbolinks:render', window.resizeBanners);
document.addEventListener('turbolinks:render', window.initFilters);

window.resizeBanners();
window.initFilters();
