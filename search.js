(function () {
  // ── Constants ──────────────────────────────────
  var DECOY_COUNT = 40;
  var LIGHT_RADIUS = 82;
  var currentTerm = '';

  // ── DOM refs ───────────────────────────────────
  var contentArea = document.getElementById('content-area');
  var searchInput = document.getElementById('search-input');
  var btnSearch   = document.getElementById('btn-search');
  var statusText  = document.getElementById('status-text');
  var locationUrl = document.getElementById('location-url');
  var darkOverlay = document.getElementById('dark-overlay');
  var magnifier   = document.getElementById('magnifier');

  var isHunting = false;
  var torchOn = false;

  // ── Search button ─────────────────────────────

  btnSearch.addEventListener('click', function () {
    var term = searchInput.value.trim().toLowerCase();
    if (!term) return;
    currentTerm = term;
    statusText.textContent = 'Searching...';
    setTimeout(function () { startHunt(term); }, 10);
  });

  // ── Decoy generators (structural only) ────────

  function swapAdjacent(word) {
    if (word.length < 2) return word + word[0];
    var i = Math.floor(Math.random() * (word.length - 1));
    var a = word.split('');
    var t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
    return a.join('');
  }

  function duplicate(word) {
    var i = Math.floor(Math.random() * word.length);
    return word.slice(0, i) + word[i] + word.slice(i);
  }

  function remove(word) {
    if (word.length < 2) return word + 'x';
    var i = Math.floor(Math.random() * word.length);
    return word.slice(0, i) + word.slice(i + 1);
  }

  function reverse(word) {
    return word.split('').reverse().join('');
  }

  function shuffle(word) {
    if (word.length < 4) return word.split('').reverse().join('');
    var mid = word.slice(1, -1).split('');
    for (var i = mid.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = mid[i]; mid[i] = mid[j]; mid[j] = t;
    }
    var r = word[0] + mid.join('') + word[word.length - 1];
    return r === word ? word[0] + mid.reverse().join('') + word[word.length - 1] : r;
  }

  function replaceOne(word) {
    var abc = 'abcdefghijklmnopqrstuvwxyz';
    var i = Math.floor(Math.random() * word.length);
    var c = abc[Math.floor(Math.random() * 26)];
    if (c === word[i]) c = abc[(abc.indexOf(c) + 1) % 26];
    return word.slice(0, i) + c + word.slice(i + 1);
  }

  function insertChar(word) {
    var abc = 'abcdefghijklmnopqrstuvwxyz';
    var i = Math.floor(Math.random() * (word.length + 1));
    return word.slice(0, i) + abc[Math.floor(Math.random() * 26)] + word.slice(i);
  }

  function rotate(word) {
    var n = 1 + Math.floor(Math.random() * (word.length - 1));
    return word.slice(n) + word.slice(0, n);
  }

  var generators = [swapAdjacent, duplicate, remove, reverse, shuffle,
                    replaceOne, insertChar, rotate];

  function generateDecoys(word, count) {
    var seen = {};
    seen[word] = true;
    var decoys = [];
    var attempts = 0;
    while (decoys.length < count && attempts < count * 20) {
      var gen = generators[Math.floor(Math.random() * generators.length)];
      var d = gen(word).trim();
      if (d.length > 0 && !seen[d] && d !== word) {
        seen[d] = true;
        decoys.push(d);
      }
      attempts++;
    }
    return decoys;
  }

  // ── Hunt ───────────────────────────────────────

  function startHunt(term) {
    // ── Pick up the magnifying glass from the search button ──
    document.body.classList.add('hunt-active');
    document.body.style.overflow = 'hidden';
    locationUrl.textContent = 'http://home.solscape.com/search?q=' + encodeURIComponent(term);

    // The 🔎 vanishes from the button — you've taken it
    btnSearch.style.color = 'transparent';
    searchInput.value = 'you must search for... ' + term;
    searchInput.style.fontWeight = 'bold';

    // Magnifier appears at the button and follows the mouse from now on
    var btnRect = btnSearch.getBoundingClientRect();
    magnifier.classList.remove('hidden');
    magnifier.style.transition = 'none';
    magnifier.style.opacity = '1';
    magnifier.style.transform = 'translate(-50%, -50%)';
    magnifier.style.left = (btnRect.left + btnRect.width / 2) + 'px';
    magnifier.style.top  = (btnRect.top  + btnRect.height / 2) + 'px';

    torchOn = true
    // ── Dim the page (magnifier keeps following mouse) ──────
    setTimeout(function () {
      darkOverlay.classList.remove('hidden');
      darkOverlay.style.opacity = '0';
      darkOverlay.style.webkitMaskImage = 'none';
      darkOverlay.style.maskImage = 'none';
      darkOverlay.classList.add('dimming');
      darkOverlay.offsetHeight; // reflow
      darkOverlay.style.opacity = '1';

      darkOverlay.addEventListener('transitionend', function onDimmed(e) {
        if (e.propertyName !== 'opacity') return;
        darkOverlay.removeEventListener('transitionend', onDimmed);
        darkOverlay.classList.remove('dimming');

        // ── Place words on existing page + activate ───────────
        contentArea.style.position = 'relative';
        var fieldW = contentArea.offsetWidth;
        var fieldH = contentArea.offsetHeight;

        var wordLayer = document.createElement('div');
        wordLayer.id = 'word-layer';
        contentArea.appendChild(wordLayer);

        var decoys = generateDecoys(term, DECOY_COUNT);
        var all = decoys.map(function (d) { return { text: d, isTarget: false }; });
        all.push({ text: term, isTarget: true });

        // Shuffle
        for (var i = all.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = all[i]; all[i] = all[j]; all[j] = t;
        }

        // Place words with collision avoidance
        var placed = [];

        all.forEach(function (w) {
          var el = document.createElement('span');
          el.textContent = w.text;
          el.className = w.isTarget ? 'target-word' : 'decoy-word';
          el.style.fontSize = (15 + Math.floor(Math.random() * 7)) + 'px';
          el.style.visibility = 'hidden';
          el.style.position = 'absolute';
          wordLayer.appendChild(el);
          var ew = el.offsetWidth, eh = el.offsetHeight;

          var px = 0, py = 0, ok = false, att = 0;
          while (att < 300 && !ok) {
            px = Math.random() * (fieldW - ew - 40) + 20;
            py = Math.random() * (fieldH - eh - 40) + 20;
            ok = true;
            for (var k = 0; k < placed.length; k++) {
              var p = placed[k];
              if (px < p.x + p.w + 14 && px + ew + 14 > p.x &&
                  py < p.y + p.h + 14 && py + eh + 14 > p.y) {
                ok = false; break;
              }
            }
            att++;
          }

          el.style.visibility = '';
          el.style.left = px + 'px';
          el.style.top  = py + 'px';
          placed.push({ x: px, y: py, w: ew, h: eh });

          if (w.isTarget) {
            el.addEventListener('click', function () {
              window.location.href = 'search-result.html?q=' + encodeURIComponent(term);
            });
          }
        });

        // Clear mask so spotlight works fresh on first mousemove
        darkOverlay.style.webkitMaskImage = '';
        darkOverlay.style.maskImage = '';

        // Activate hunt
        isHunting = true;
        statusText.textContent = 'Searching for: ' + term;
      });
    }, 350);
  }

  // ── Fallback click handler (bulletproof) ──────

  document.addEventListener('click', function (e) {
    if (!isHunting || !currentTerm) return;
    var tw = document.querySelector('.target-word');
    if (!tw) return;
    var r = tw.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top  && e.clientY <= r.bottom) {
      window.location.href = 'search-result.html?q=' + encodeURIComponent(currentTerm);
    }
  });

  // ── Light cursor ──────────────────────────────

  function updateLight(x, y) {
    magnifier.style.left = x + 'px';
    magnifier.style.top  = y + 'px';
    var m = 'radial-gradient(circle ' + LIGHT_RADIUS + 'px at ' + x + 'px ' + y + 'px, ' +
            'transparent 40%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.8) 85%, rgba(0,0,0,1) 100%)';
    darkOverlay.style.webkitMaskImage = m;
    darkOverlay.style.maskImage = m;
  }

  document.addEventListener('mousemove', function (e) {
    if (torchOn) updateLight(e.clientX, e.clientY);
  });

  document.addEventListener('touchmove', function (e) {
    if (!isHunting) return;
    var t = e.touches[0];
    updateLight(t.clientX, t.clientY);
  }, { passive: true });
})();
