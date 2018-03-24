// TODO: Automatically focus search field on visible searchwidget
// TODO: Only register handler for links that have a widget
// TODO: Repair sidebar js after turbolinks integration happened now

document.addEventListener('click', function(event) {
  console.log('any click :D');
});

document.querySelectorAll('.sidebar__link')
        .forEach(function(clickedLink) {
          clickedLink.addEventListener('click', function(event) {
            document.querySelectorAll('.sidebar__link')
                    .forEach(function(iteratedLink) {
                      if(iteratedLink === clickedLink) {
                        iteratedLink.classList.toggle('active');
                      } else {
                        iteratedLink.classList.remove('active');
                      }
                    });
          });
        });

document.querySelectorAll('span[data-include-section]')
        .forEach(function(checkbox) {
          checkbox.addEventListener('click', function(event) {
            checkbox.classList.toggle('icon-checkbox');
            checkbox.classList.toggle('icon-checkbox-checked');

            checkbox.dataset.includeSection
          });
        });

document.querySelector('.sidebar__searchform button')
        .addEventListener('click', function(event) {
          const sections = [];
          document.querySelectorAll('span[data-include-section]')
                  .forEach(function(checkbox) {
                    if(checkbox.classList.contains('icon-checkbox-checked')) {
                      sections.push(checkbox.dataset.includeSection);
                    }
                  });

          document.querySelector('.sidebar__searchform input[name="bereiche"]')
                  .value = sections.join(',');
        });

document.querySelector('.sidebar__link__top')
        .addEventListener('click', function(event) {
          window.scrollBy(0, -window.scrollY);
        });
