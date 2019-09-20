const Turbolinks = require('turbolinks');

Turbolinks.start();

window.Turbolinks = Turbolinks;

window.filterEvents = () => {
  const activeDate = document.querySelector('.active_date');
  const activeCategory = document.querySelector('.active_category');

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

  const dateOption = document.querySelector(`a[data-date="${search.has('date') ? search.get('date') : 'all'}"]`);
  const categoryOption = document.querySelector(`a[data-category="${search.has('category') ? search.get('category') : 'all'}"]`);

  window.updateFilter(dateOption, false);
  window.updateFilter(categoryOption, false);

  window.filterEvents();
};

document.addEventListener('turbolinks:render', window.initFilters);

window.initFilters();
