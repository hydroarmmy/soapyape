/* Client-side site search: no server needed. Reads window.SOAPYAPE_SEARCH (search-data.js). */
(function(){
  var data = window.SOAPYAPE_SEARCH || [];
  var form = document.querySelector('form.search');
  if (!form) return;
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
