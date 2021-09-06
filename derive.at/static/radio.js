const timecode = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

function registerRadio() {
    const audio = document.querySelector('.radio__audio');
    const button = document.querySelector('.radio__button');
    const icon = document.querySelector('.radio__playback_icon');
    const progress = document.querySelector('.radio__seekbar_progress');
    const radio = document.querySelector('.radio');
    const seekbar = document.querySelector('.radio__seekbar');
    const text = document.querySelector('.radio__seekbar_text');

    function play() {
        icon.classList.remove('icon-play');
        icon.classList.add('icon-pause');
        audio.play();
    }
    
    function pause() {
        icon.classList.add('icon-play');
        icon.classList.remove('icon-pause');
        audio.pause();
    }

    function playOrPause() {
        if(audio.paused) {
            play();
        } else {
            pause();
        }
    }

    function reset() {
        pause();
        audio.currentTime = 0;
    }

    function seek(event) {
        const bounds = seekbar.getBoundingClientRect();
        const newTime = Math.floor(((event.clientX - bounds.left) / (bounds.right - bounds.left)) * audio.duration);

        audio.currentTime = newTime;

        update();
    }

    function update() {
        text.innerHTML = `${timecode(audio.currentTime)} / ${timecode(audio.duration)}`;
        progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    }

    audio.addEventListener('ended', reset);
    audio.addEventListener('loadeddata', update);
    audio.addEventListener('timeupdate', update);
    button.addEventListener('click', playOrPause);
    seekbar.addEventListener('click', seek);
}

window.addEventListener('DOMContentLoaded', registerRadio);