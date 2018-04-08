let audio;
let radioNoticeShown = false;

document.addEventListener('click', function(event) {
  if(event.button !== 0) {
    return;
  }

  // TODO: Make the No69 widget toggle into a direct link to issue page when
  //       vertical height on device is too small to display the widget
  //       possible solve by having two links and blending with css media queries instead

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
        const queryInput = document.querySelector('input[name="begriff"]');
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
    document.querySelector('.sidebar__link__playback')
            .append(audio);
  }
});

document.addEventListener('turbolinks:before-render', function(event) {
  if(audio) {
    const radio = event.data.newBody.querySelector('.feature__radio audio');

    if(radio && radio.src === audio.src) {
      radio.parentNode.replaceChild(audio, radio);
    }
  }
});
