/* Client-side site search: no server needed. Reads window.SOAPYAPE_SEARCH (search-data.js). */
(function(){
  var data = window.SOAPYAPE_SEARCH || [];
  var form = document.querySelector('form.search');
  if (!form) return;
  /* styles live here so the search works even if style.css is an older copy */
  var st = document.createElement('style');
  st.textContent = ".search{position:relative}\n.search input::-webkit-search-cancel-button,.search input::-webkit-search-decoration{-webkit-appearance:none;appearance:none}\n.search-results{position:absolute;top:calc(100% + 6px);right:0;z-index:40;width:max(260px,calc(230px*var(--s)));max-width:calc(100vw - 20px);margin:0;padding:4px;list-style:none;\n  background:#fff7e6;border:3px solid #16120f;border-radius:8px;box-shadow:0 4px 0 #4a2f25,inset 0 0 0 2px #e3c9a1;\n  font-family:\"Noto Sans Thai\",\"Pixelify Sans\",system-ui,sans-serif;font-size:14px;line-height:1.35;color:#3a2412}\n.search-results[hidden]{display:none}\n.search-results li{margin:0}\n.search-results a{display:grid;grid-template-columns:62px 1fr;gap:2px 8px;align-items:center;padding:7px 9px;border-radius:5px;color:inherit;text-decoration:none}\n.search-results li[aria-selected=\"true\"] a,.search-results a:hover{background:#fdebc8}\n.search-results .ttl{font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.search-results .dsc{grid-column:2;font-size:12px;color:#6b5444;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.search-results .badge{text-align:center;font-family:\"Pixelify Sans\",sans-serif;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:1px 7px;border:2px solid #16120f;border-radius:4px;color:#fff;background:#a8623a}\n.search-results .b-app{background:#2f7fd6}\n.search-results .b-asset{background:#7d4bc8}\n.search-results .b-game{background:#2e9a52}\n.search-results .b-page{background:#8a7560}\n.search-results .empty{padding:10px;color:#6b5444;text-align:center}\n@media (max-width:899px){.search-results{right:auto;left:0}}";
  document.head.appendChild(st);

  var input = form.querySelector('input');
  var list = document.createElement('ul');
  list.className = 'search-results'; list.id = 'search-results'; list.setAttribute('role','listbox'); list.hidden = true;
  form.appendChild(list);
  input.setAttribute('role','combobox'); input.setAttribute('aria-expanded','false');
  input.setAttribute('aria-controls','search-results'); input.setAttribute('autocomplete','off');
  input.setAttribute('aria-autocomplete','list');

  var base = (document.currentScript && document.currentScript.src) ? new URL('../../', document.currentScript.src) : new URL('/', location.href);
  var current = -1, shown = [];

  function norm(s){ return String(s||'').normalize('NFC').toLowerCase().trim(); }
  function score(item, q){
    var t = norm(item.title), best = 0;
    if (t === q) best = 100;
    else if (t.indexOf(q) === 0) best = 80;
    else if (t.split(/[\s\-_.]+/).some(function(w){ return w.indexOf(q) === 0; })) best = 65;
    else if (t.indexOf(q) > -1) best = 50;
    var rest = [item.type, item.desc].concat(item.keywords || []).map(norm);
    for (var i=0;i<rest.length;i++){
      if (rest[i] && rest[i].indexOf(q) > -1) best = Math.max(best, rest[i] === q ? 40 : 30);
    }
    return best;
  }
  function search(q){
    q = norm(q); if (!q) return [];
    return data.map(function(it){ return {it:it, s:score(it,q)}; })
      .filter(function(x){ return x.s > 0; })
      .sort(function(a,b){ return b.s - a.s; })
      .slice(0,6).map(function(x){ return x.it; });
  }
  function hrefOf(it){ return it.external ? it.url : (it.url.charAt(0)==='/' ? new URL(it.url.slice(1), base).href : it.url); }

  function open(it){
    var url = hrefOf(it);
    if (it.external) window.open(url, '_blank', 'noopener'); else location.href = url;
  }
  function setCurrent(i){
    var lis = list.children;
    if (current > -1 && lis[current]) lis[current].setAttribute('aria-selected','false');
    current = i;
    if (i > -1 && lis[i]) { lis[i].setAttribute('aria-selected','true'); input.setAttribute('aria-activedescendant', lis[i].id); lis[i].scrollIntoView({block:'nearest'}); }
    else input.removeAttribute('aria-activedescendant');
  }
  function close(){ list.hidden = true; input.setAttribute('aria-expanded','false'); setCurrent(-1); }
  function render(){
    var q = input.value;
    list.textContent = '';
    if (!norm(q)) { close(); return; }
    shown = search(q);
    if (!shown.length){
      var li = document.createElement('li'); li.className = 'empty'; li.setAttribute('role','presentation');
      li.textContent = 'No results / ไม่พบผลลัพธ์'; list.appendChild(li);
    } else {
      shown.forEach(function(it, i){
        var li = document.createElement('li'); li.id = 'sr-' + i; li.setAttribute('role','option'); li.setAttribute('aria-selected','false');
        var a = document.createElement('a'); a.href = hrefOf(it);
        if (it.external){ a.target = '_blank'; a.rel = 'noopener'; }
        var b = document.createElement('span'); b.className = 'badge b-' + norm(it.type); b.textContent = it.type;
        var t = document.createElement('span'); t.className = 'ttl'; t.textContent = it.title;
        a.appendChild(b); a.appendChild(t);
        if (it.desc){ var d = document.createElement('span'); d.className = 'dsc'; d.textContent = it.desc; a.appendChild(d); }
        li.appendChild(a); list.appendChild(li);
        li.addEventListener('mousemove', function(){ if (current !== i) setCurrent(i); });
      });
    }
    list.hidden = false; input.setAttribute('aria-expanded','true'); current = -1;
  }

  input.addEventListener('input', render);
  input.addEventListener('focus', function(){ if (norm(input.value)) render(); });
  input.addEventListener('keydown', function(e){
    if (e.key === 'ArrowDown'){ e.preventDefault(); if (list.hidden) render(); if (shown.length) setCurrent((current + 1) % shown.length); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); if (shown.length) setCurrent(current <= 0 ? shown.length - 1 : current - 1); }
    else if (e.key === 'Escape'){ close(); input.blur(); }
    else if (e.key === 'Enter'){
      e.preventDefault();
      var pick = shown[current > -1 ? current : 0];
      if (!list.hidden && pick) open(pick);
    }
  });
  form.addEventListener('submit', function(e){ e.preventDefault(); });
  document.addEventListener('click', function(e){ if (!form.contains(e.target)) close(); });
})();
