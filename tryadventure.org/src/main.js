import { parse, AdventureParseError } from '../../adventurejs/adventure.js';

let doc = null;
const editor = document.querySelector('#editor');
const log = document.querySelector('#log');
let locale = location.hash.length > 0 ? location.hash.substr(1) : 'en';

const lookup = () => {
  try {
    const lookup = doc.lookup(editor.selectionStart);

    if(lookup) {
      log.innerHTML = `<b>lookup()</b><br/><br/>=&gt; ${lookup.zone}<br/><br/>${lookup.element.inspect()}`;
    }
  } catch(err) {
    console.log(err)

    if(err instanceof AdventureParseError) {
      log.innerHTML = err;
    }
  }
};

editor.addEventListener('click', lookup);
editor.addEventListener('focus', lookup);
editor.addEventListener('keyup', event => {
  if(['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
    lookup();
  }
});

const refresh = () => {
  const input = editor.value;

  try {
    doc = parse(input, locale);

    log.innerHTML = `<b>inspect()</b><br/><br/>${doc.inspect()}<br/><br/><b>raw()</b><br/><br/>${JSON.stringify(doc.raw(), null, 2)}`;
  } catch(err) {
    if(err instanceof AdventureParseError) {
      log.innerHTML = err;
    }
  }
};

window.addEventListener('hashchange', () => {
  locale = location.hash.length > 0 ? location.hash.substr(1) : 'en';
  console.log(locale);
  refresh();
});

editor.addEventListener('input', refresh);

refresh();
