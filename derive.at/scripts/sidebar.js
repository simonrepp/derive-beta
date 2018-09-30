let audio;
let radioNoticeShown = false;

document.addEventListener('click', function(event) {
  if(event.button !== 0) {
    return;
  }

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

    if(audio) {
      if(audio.paused) {
        audio.play();
      } else {
        audio.pause();
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

  const sectionCheckboxes = document.querySelectorAll('span[data-section]');
  for(let checkbox of sectionCheckboxes) {
    if(checkbox.contains(event.target)) {
      const section = checkbox.dataset.section;

      if(checkbox.classList.contains('icon-checkbox')) {
        search.sections[section] = true;

        for(let checkboxReiterated of sectionCheckboxes) {
          if(checkboxReiterated.dataset.section === section) {
            checkboxReiterated.classList.remove('icon-checkbox');
            checkboxReiterated.classList.add('icon-checkbox-checked');
          }
        }
      } else {
        search.sections[section] = false;

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

document.addEventListener('submit', function(event) {
  const pageSearchform = document.querySelector('.search__searchform');
  const sidebarSearchform = document.querySelector('.sidebar__searchform');
  if(event.target === sidebarSearchform || event.target === pageSearchform) {
    event.preventDefault();

    search.error = null;
    search.pending = false;
    search.query = event.target.querySelector('input[name="query"]').value;
    search.results = null;

    if(!location.hostname.match(/derive\.at|urbanize\.at/)) {
      search.error = 'Die Suche ist beim lokalen Testen nicht verfügbar da sie auf PHP angewiesen ist.';
      renderSearch();
    } else if(search.query.length < 1) {
      search.error = 'Mindestens zwei Buchstaben erforderlich.';
      renderSearch();
    } else {

      search.pending = true;

      let request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if(request.readyState == XMLHttpRequest.DONE) {
          if(request.status == 200) {
            const results = JSON.parse(request.responseText);

            console.log('yiha', results);
            search.results = results;

            renderSearch();
          } else if(request.status == 400) {
            search.error = 'Fehlercode 400 - Falsche Parameter in der Anfrage an die API';
          } else {
            search.error = 'Fehlercode ' + request.status;
          }

          search.pending = false;
        }
      };

      const sections = Object.keys(search.sections).filter(section => search.sections[section]).join(',');

      const url = '/api/search/?query=' + encodeURI(search.query) + '&sections=' + sections;

      request.open('GET', url, true);

      request.send();
    }

    Turbolinks.visit('/suche/');
  }
});

document.addEventListener('play', function(event) {
  if(event.target.tagName === 'AUDIO') {
    const previousAudio = audio;

    audio = event.target;

    if(previousAudio && previousAudio !== audio) {
      previousAudio.pause();
    }

    const radioPlaybackControl = document.querySelector('.sidebar__link__playback');
    radioPlaybackControl.title = 'Du hörst: ' + event.target.dataset.title;
    radioPlaybackControl.classList.remove('sidebar__link--disabled');

    const icon = radioPlaybackControl.querySelector('.sidebar__playback-icon');

    icon.classList.remove('icon-play');
    icon.classList.add('icon-pause');

    if(!radioNoticeShown) {
      document.querySelector('.radio__notice').classList.add('radio__notice--shown');
      // TODO: Fade out message
      radioNoticeShown = true;
    }
  }
}, true);

document.addEventListener('pause', function(event) {
  if(audio && event.target === audio) {
    const icon = document.querySelector('.sidebar__playback-icon');

    icon.classList.add('icon-play');
    icon.classList.remove('icon-pause');
  }
}, true);

document.addEventListener('ended', function(event) {
  if(audio && event.target === audio) {
    audio.currentTime = 0;

    const icon = document.querySelector('.sidebar__playback-icon');
    icon.classList.remove('icon-pause');
    icon.classList.add('icon-play');
  }
}, true);

document.addEventListener('turbolinks:click', function(event) {
  if(audio) {
    document.querySelector('#persistent_audio').append(audio);
  }
});

document.addEventListener('turbolinks:before-render', function(event) {
  if(audio) {
    const radio = event.data.newBody.querySelector('.featured__radio audio');

    if(radio && radio.src === audio.src) {
      radio.parentNode.replaceChild(audio, radio);
    }
  }
});
