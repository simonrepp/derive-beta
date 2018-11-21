const moment = require('moment');

const timecode = seconds => moment.utc(seconds * 1000).format('mm:ss');

// TODO: audio notice explaining that user can navigate further while listening

class AudioEngine {
  static initialize() {
    this.audio = new Audio();
    this.sidebarButton = document.querySelector('.sidebar__link_playback');
    this.sidebarIcon = document.querySelector('.sidebar__playback_icon');

    this.audio.addEventListener('ended', this.reset);
    this.sidebarButton.addEventListener('click', this.playOrPause);

    this.initialized = true;
  }

  static loading = () => {
    if(this.audio.dataset.src === this.radio.dataset.src) {
      this.text.innerHTML = 'Wird geladen ...';
    }
  }

  static play(src = null) {
    if(src) {
      this.audio.dataset.src = src;
      this.audio.src = src;
      this.sidebarButton.title = `Du hörst: ${this.radio.dataset.title}`;
    }

    if(this.radio.dataset.src === this.audio.dataset.src) {
      this.icon.classList.remove('icon-play');
      this.icon.classList.add('icon-pause');
    }

    this.sidebarButton.classList.remove('sidebar__link_disabled');
    this.sidebarIcon.classList.remove('icon-play');
    this.sidebarIcon.classList.add('icon-pause');

    this.audio.play();
  }

  static playOrPause = event => {
    if(event.target === this.button && this.radio.dataset.src !== this.audio.dataset.src) {
      this.play(this.radio.dataset.src);
    } else {
      if(this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    }
  }

  static pause() {
    if(this.radio.dataset.src === this.audio.dataset.src) {
      this.icon.classList.add('icon-play');
      this.icon.classList.remove('icon-pause');
    }

    this.sidebarIcon.classList.add('icon-play');
    this.sidebarIcon.classList.remove('icon-pause');

    this.audio.pause();
  }

  static register() {
    if(!this.initialized) {
      this.initialize();
    }

    this.button = document.querySelector('.radio__button');
    this.icon = document.querySelector('.radio__playback_icon');
    this.progress = document.querySelector('.radio__seekbar_progress');
    this.radio = document.querySelector('.radio');
    this.seekbar = document.querySelector('.radio__seekbar');
    this.text = document.querySelector('.radio__seekbar_text');

    this.button.addEventListener('click', this.playOrPause);
    this.audio.addEventListener('loadstart', this.loading);
    this.audio.addEventListener('loadeddata', this.update);
    this.audio.addEventListener('timeupdate', this.update);
    this.seekbar.addEventListener('click', this.seek);

    if(this.audio.dataset.src === this.radio.dataset.src) {
      if(!this.audio.paused) {
        this.icon.classList.remove('icon-play');
        this.icon.classList.add('icon-pause');
      }

      this.update()
    }

    document.addEventListener('turbolinks:visit', this.unregister);
  }

  static reset = () => {
    this.pause();

    this.audio.currentTime = 0;
  }

  static seek = event => {
    if(this.audio.dataset.src === this.radio.dataset.src) {
      const bounds = this.seekbar.getBoundingClientRect();
      const newTime = Math.floor(((event.screenX - bounds.left) / (bounds.right - bounds.left)) * this.audio.duration);

      this.audio.currentTime = newTime;

      this.update();
    } else {
      this.play(this.radio.dataset.src);
    }
  }

  static unregister = () => {
    document.removeEventListener('turbolinks:visit', this.unregister);

    this.button.removeEventListener('click', this.playOrPause);
    this.audio.removeEventListener('loadstart', this.loading);
    this.audio.removeEventListener('loadeddata', this.update);
    this.audio.removeEventListener('timeupdate', this.update);
    this.seekbar.removeEventListener('click', this.seek);
  }

  static update = () => {
    if(this.audio.dataset.src === this.radio.dataset.src) {
      this.text.innerHTML = `${timecode(this.audio.currentTime)} / ${timecode(this.audio.duration)}`;
      this.progress.style.width = `${(this.audio.currentTime / this.audio.duration) * 100}%`;
    }
  }
}

module.exports = AudioEngine;
