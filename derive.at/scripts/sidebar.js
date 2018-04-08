document.addEventListener('click', function(event) {

  const widgetToggles = document.querySelectorAll('.sidebar__widget-toggle');
  for(let toggleLink of widgetToggles) {
    if(toggleLink.contains(event.target)) {
      console.log('a toggle link for sure');

      for(let toggleLinkReiterated of widgetToggles) {
        if(toggleLinkReiterated === toggleLink) {
          toggleLinkReiterated.classList.toggle('active');
        } else {
          toggleLinkReiterated.classList.remove('active');
        }
      }

      if(toggleLink.classList.contains('sidebar__link__search')) {
        const queryInput = document.querySelector('input[name="begriff"]');
        queryInput.focus();
      }

      return;
    }
  }

  const toTopLink = document.querySelector('.sidebar__link__top');
  if(toTopLink.contains(event.target)) {
    const layoutScroll = document.querySelector('.layout__scroll');
    
    layoutScroll.scrollBy(0, -layoutScroll.scrollTop);

    return;
  }

  const searchCheckboxes = document.querySelectorAll('span[data-include-section]');
  for(let checkbox of searchCheckboxes) {
    if(checkbox.contains(event.target)) {
      checkbox.classList.toggle('icon-checkbox');
      checkbox.classList.toggle('icon-checkbox-checked');

      return;
    }
  }

  const searchformSubmit = document.querySelector('.sidebar__searchform button');
  if(searchformSubmit.contains(event.target)) {
    const checkboxes = document.querySelectorAll('span[data-include-section]');
    const sections = [];

    for(let checkbox of checkboxes) {
      if(checkbox.classList.contains('icon-checkbox-checked')) {
        sections.push(checkbox.dataset.includeSection);
      }
    }

    const includedSections = document.querySelector('.sidebar__searchform input[name="bereiche"]');
    includedSections.value = sections.join(',');

    return;
  }
});
