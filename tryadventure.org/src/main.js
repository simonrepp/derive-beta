import { parse, AdventureParseError } from '../../adventurejs/adventure.js';

const htmlEscape = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;'
};

const escape = string => string.replace(/[&<>"'\/]/g, c => htmlEscape[c]);

let doc = null;
const editor = document.querySelector('#editor');
const lookupLog = document.querySelector('#lookup');
const parseLog = document.querySelector('#parse');
let locale = location.hash.length > 0 ? location.hash.substr(1) : 'en';

const lookup = () => {
  if(!doc) { return; }

  try {
    const lookup = doc.lookup(editor.selectionStart);

    if(lookup) {
      lookupLog.innerHTML = `<b>lookup()</b><br/><br/>=&gt; ${lookup.zone}<br/><br/>${escape(lookup.element.inspect())}`;
    }
  } catch(err) {
    if(err instanceof AdventureParseError) {
      lookupLog.innerHTML = err;
    } else {
      lookupLog.innerHTML = err;
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
    doc = parse(input, locale, 'html');

    parseLog.innerHTML = `<b>inspect()</b><br/><br/>${escape(doc.inspect())}<br/><br/><b>raw()</b><br/><br/>${escape(JSON.stringify(doc.raw(), null, 2))}`;
  } catch(err) {
    if(err instanceof AdventureParseError) {
      parseLog.innerHTML = err;
    } else {
      parseLog.innerHTML = err;
    }
  }
};

window.addEventListener('hashchange', () => {
  locale = location.hash.length > 0 ? location.hash.substr(1) : 'en';
  refresh();
  lookup();
});

editor.addEventListener('input', refresh);

refresh();