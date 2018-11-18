module.exports = () => {
  window.audio = null;
  window.radioNoticeShown = false;

  document.addEventListener('click', event => {
    if(event.button !== 0)
      return;

    const widgetToggles = document.querySelectorAll('.sidebar__widget-toggle');
    for(let toggleLink of widgetToggles) {
      if(toggleLink.contains(event.target)) {

        for(let toggleLinkReiterated of widgetToggles) {
          if(toggleLinkReiterated === toggleLink) {
            toggleLinkReiterated.classList.toggle('active');
          } else {
            toggleLinkReiterated.classList.remove('active');
          }
        }

        if(toggleLink.classList.contains('sidebar__link__search')) {
          const queryInput = document.querySelector('input[name="query"]');
          queryInput.focus();
        }

        return;
      }
    }

    const radioPlaybackControl = document.querySelector('.sidebar__link__playback');
    if(radioPlaybackControl.contains(event.target)) {
      const icon = radioPlaybackControl.querySelector('.sidebar__playback-icon');

      icon.classList.toggle('icon-play');
      icon.classList.toggle('icon-pause');

      if(window.audio) {
        if(window.audio.paused) {
          window.audio.play();
        } else {
          window.audio.pause();
        }
      }

      return;
    }

    const toTopLink = document.querySelector('.sidebar__link__top');
    if(toTopLink.contains(event.target)) {
      const layoutScroll = document.querySelector('.layout__scroll');

      layoutScroll.scrollBy(0, -layoutScroll.scrollTop);

      return;
    }


    const filterToggleButton = document.querySelector('button[data-toggle-filters]');
    if(filterToggleButton && filterToggleButton.contains(event.target)) {
      const filters = document.querySelector('.search__filters');
      filters.classList.toggle('shown');
      return;
    }

    const sectionCheckboxes = document.querySelectorAll('span[data-section]');
    for(let checkbox of sectionCheckboxes) {
      if(checkbox.contains(event.target)) {
        const section = checkbox.dataset.section;

        if(checkbox.classList.contains('icon-checkbox')) {
          window.search.sections[section] = true;

          for(let checkboxReiterated of sectionCheckboxes) {
            if(checkboxReiterated.dataset.section === section) {
              checkboxReiterated.classList.remove('icon-checkbox');
              checkboxReiterated.classList.add('icon-checkbox-checked');
            }
          }
        } else {
          window.search.sections[section] = false;

          for(let checkboxReiterated of sectionCheckboxes) {
            if(checkboxReiterated.dataset.section === section) {
              checkboxReiterated.classList.remove('icon-checkbox-checked');
              checkboxReiterated.classList.add('icon-checkbox');
            }
          }
        }

        return;
      }
    }
  });

  document.addEventListener('submit', event => {
    const pageSearchform = document.querySelector('.search__searchform');
    const sidebarSearchform = document.querySelector('.sidebar__searchform');
    if(event.target === sidebarSearchform || event.target === pageSearchform) {
      event.preventDefault();

      window.search.error = null;
      window.search.pending = false;
      window.search.query = event.target.querySelector('input[name="query"]').value;
      window.search.results = null;

      if(!location.hostname.match(/derive\.at|urbanize\.at/)) {
        window.search.error = 'Die Suche ist beim lokalen Testen nicht verfügbar da sie auf PHP angewiesen ist.';
        window.renderSearch();
      } else if(window.search.query.length < 1) {
        window.search.error = 'Mindestens zwei Buchstaben erforderlich.';
        window.renderSearch();
      } else {

        window.search.pending = true;

        let request = new XMLHttpRequest();
        request.onreadystatechange = function() {
          if(request.readyState == XMLHttpRequest.DONE) {
            if(request.status == 200) {
              const results = JSON.parse(request.responseText);

              window.search.results = results;

              window.renderSearch();
            } else if(request.status == 400) {
              window.search.error = 'Fehlercode 400 - Falsche Parameter in der Anfrage an die API';
            } else {
              window.search.error = 'Fehlercode ' + request.status;
            }

            window.search.pending = false;
          }
        };

        const sections = Object.keys(window.search.sections).filter(section => window.search.sections[section]).join(',');

        const url = '/api/search/?query=' + encodeURI(window.search.query) + '&sections=' + sections;

        request.open('GET', url, true);

        request.send();
      }

      Turbolinks.visit('/suche/');
    }
  });

  document.addEventListener('play', event => {
    if(event.target.tagName === 'AUDIO') {
      const previousAudio = window.audio;

      window.audio = event.target;

      if(previousAudio && previousAudio !== window.audio) {
        previousAudio.pause();
      }

      const radioPlaybackControl = document.querySelector('.sidebar__link__playback');
      radioPlaybackControl.title = 'Du hörst: ' + event.target.dataset.title;
      radioPlaybackControl.classList.remove('sidebar__link--disabled');

      const icon = radioPlaybackControl.querySelector('.sidebar__playback-icon');

      icon.classList.remove('icon-play');
      icon.classList.add('icon-pause');

      if(!window.radioNoticeShown) {
        document.querySelector('.radio__notice').classList.add('radio__notice--shown');
        // TODO: Fade out message
        window.radioNoticeShown = true;
      }
    }
  }, true);

  document.addEventListener('pause', event => {
    if(window.audio && event.target === window.audio) {
      const icon = document.querySelector('.sidebar__playback-icon');

      icon.classList.add('icon-play');
      icon.classList.remove('icon-pause');
    }
  }, true);

  document.addEventListener('ended', event => {
    if(window.audio && event.target === window.audio) {
      window.audio.currentTime = 0;

      const icon = document.querySelector('.sidebar__playback-icon');
      icon.classList.remove('icon-pause');
      icon.classList.add('icon-play');
    }
  }, true);

  document.addEventListener('turbolinks:click', event => {
    if(window.audio) {
      document.querySelector('#persistent_audio').append(window.audio);
    }
  });

  document.addEventListener('turbolinks:before-render', event => {
    if(window.audio) {
      const radio = event.data.newBody.querySelector('.featured__radio audio');

      if(radio && radio.src === window.audio.src) {
        radio.parentNode.replaceChild(window.audio, radio);
      }
    }
  });
};
