(function () {
  const MAX_TILES = 100;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?@&';
  const TILE_SIZE = 58;
  const JITTER = 4;
  const DRIFT_SPEED = 0.3;
  const DAMPING = 0.98;
  const FRICTION = 0.94;
  const REPULSE_RADIUS = 160;
  const REPULSE_STRENGTH = 1.6;

  const playground = document.getElementById('tile-playground');
  const dropZone = document.getElementById('drop-zone');
  const reqUpper = document.getElementById('req-upper');
  const reqNumber = document.getElementById('req-number');
  const reqSymbol = document.getElementById('req-symbol');
  const reqLength = document.getElementById('req-length');
  const btnSpawn = document.getElementById('btn-spawn');
  const btnSubmit = document.getElementById('btn-submit');
  const loginError = document.getElementById('login-error');
  const usernameInput = document.getElementById('username');
  const loginWrapper = document.querySelector('.login-wrapper');
  const homeLink = document.querySelector('.home-link');
  const darkToggle = document.querySelector('.blursed-toggle');

  const confirmSection = document.getElementById('confirm-section');
  const confirmDisplay = document.getElementById('confirm-display');
  const confirmZone = document.getElementById('confirm-zone');
  const btnClearTiles = document.getElementById('btn-clear-tiles');

  const tiles = [];
  const passwordTiles = [];
  const confirmTiles = [];
  let confirming = false;
  let savedPassword = '';
  let dragging = null;
  let mouseX = -9999;
  let mouseY = -9999;

  // Track mouse position globally
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    moveDrag(e.clientX, e.clientY);
  });

  function randomChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  function tileCount() {
    return tiles.length + passwordTiles.length + confirmTiles.length;
  }

  function spawnTile() {
    if (tileCount() >= MAX_TILES) return null;
    const el = document.createElement('div');
    el.className = 'tile';
    el.textContent = randomChar();

    const x = Math.random() * (window.innerWidth - TILE_SIZE);
    const y = Math.random() * (window.innerHeight - TILE_SIZE);

    el.style.left = x + 'px';
    el.style.top = y + 'px';

    playground.appendChild(el);

    const tile = {
      el: el,
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * DRIFT_SPEED * 2,
      vy: (Math.random() - 0.5) * DRIFT_SPEED * 2,
      momentum: false,
    };
    tiles.push(tile);
    bindTileDrag(tile);
    return tile;
  }

  function spawnBatch(n) {
    for (let i = 0; i < n; i++) spawnTile();
  }

  // --- Drag handling ---
  function bindTileDrag(tile) {
    const el = tile.el;

    function startDrag(cx, cy) {
      if (dragging) return;
      const r = el.getBoundingClientRect();
      dragging = { tile: tile, offsetX: cx - r.left, offsetY: cy - r.top };
      el.classList.add('dragging');
      tile.momentum = false;
    }

    function onMouseDown(e) {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    }
    function onTouchStart(e) {
      e.preventDefault();
      const t = e.touches[0];
      startDrag(t.clientX, t.clientY);
    }

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('touchstart', onTouchStart, { passive: false });
  }

  function moveDrag(cx, cy) {
    if (!dragging) return;
    const tile = dragging.tile;
    const jx = (Math.random() - 0.5) * JITTER * 2;
    const jy = (Math.random() - 0.5) * JITTER * 2;
    tile.x = cx - dragging.offsetX + jx;
    tile.y = cy - dragging.offsetY + jy;
    tile.el.style.left = tile.x + 'px';
    tile.el.style.top = tile.y + 'px';
    tile.vx = jx * 2;
    tile.vy = jy * 2;
  }

  function endDrag(cx, cy) {
    if (!dragging) return;
    const tile = dragging.tile;
    tile.el.classList.remove('dragging');

    if (confirming) {
      const czRect = confirmZone.getBoundingClientRect();
      if (
        cx >= czRect.left && cx <= czRect.right &&
        cy >= czRect.top && cy <= czRect.bottom
      ) {
        dropTileInConfirmZone(tile);
      } else {
        tile.momentum = true;
      }
    } else {
      const dzRect = dropZone.getBoundingClientRect();
      if (
        cx >= dzRect.left && cx <= dzRect.right &&
        cy >= dzRect.top && cy <= dzRect.bottom
      ) {
        dropTileInZone(tile);
      } else {
        tile.momentum = true;
      }
    }

    dragging = null;
  }

  document.addEventListener('mouseup', function (e) { endDrag(e.clientX, e.clientY); });
  document.addEventListener('touchmove', function (e) {
    if (dragging) e.preventDefault();
    const t = e.touches[0];
    mouseX = t.clientX;
    mouseY = t.clientY;
    moveDrag(t.clientX, t.clientY);
  }, { passive: false });
  document.addEventListener('touchend', function (e) {
    if (!dragging) return;
    const t = e.changedTouches[0];
    endDrag(t.clientX, t.clientY);
  });

  // --- Drop zone ---
  function dropTileInZone(tile) {
    const idx = tiles.indexOf(tile);
    if (idx !== -1) tiles.splice(idx, 1);
    playground.removeChild(tile.el);

    const el = document.createElement('div');
    el.className = 'tile tile-static';
    el.textContent = tile.el.textContent;
    dropZone.appendChild(el);

    const pwTile = { el: el, char: tile.el.textContent };
    passwordTiles.push(pwTile);

    el.addEventListener('click', function () {
      const i = passwordTiles.indexOf(pwTile);
      if (i !== -1) passwordTiles.splice(i, 1);
      dropZone.removeChild(el);
      updateDropZone();
      updateRequirements();
    });

    updateDropZone();
    updateRequirements();
  }

  function updateDropZone() {
    dropZone.classList.toggle('has-tiles', passwordTiles.length > 0);
  }

  function getPassword() {
    return passwordTiles.map(function (t) { return t.char; }).join('');
  }

  function updateRequirements() {
    const pw = getPassword();
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSymbol = /[!?@&]/.test(pw);
    const hasLength = pw.length >= 6;
    reqUpper.classList.toggle('met', hasUpper);
    reqNumber.classList.toggle('met', hasNumber);
    reqSymbol.classList.toggle('met', hasSymbol);
    reqLength.classList.toggle('met', hasLength);
  }

  // --- Confirm zone ---
  function dropTileInConfirmZone(tile) {
    const idx = tiles.indexOf(tile);
    if (idx !== -1) tiles.splice(idx, 1);
    playground.removeChild(tile.el);

    const el = document.createElement('div');
    el.className = 'tile tile-static';
    el.textContent = tile.el.textContent;
    confirmZone.appendChild(el);

    const cTile = { el: el, char: tile.el.textContent };
    confirmTiles.push(cTile);

    el.addEventListener('click', function () {
      const i = confirmTiles.indexOf(cTile);
      if (i !== -1) confirmTiles.splice(i, 1);
      confirmZone.removeChild(el);
      confirmZone.classList.toggle('has-tiles', confirmTiles.length > 0);
    });

    confirmZone.classList.toggle('has-tiles', confirmTiles.length > 0);
  }

  function getConfirmPassword() {
    return confirmTiles.map(function (t) { return t.char; }).join('');
  }

  function clearFloatingTiles() {
    while (tiles.length) {
      const t = tiles.pop();
      playground.removeChild(t.el);
    }
  }

  function enterConfirmMode(password) {
    confirming = true;
    savedPassword = password;
    confirmDisplay.textContent = password;
    confirmSection.style.display = '';
    dropZone.style.pointerEvents = 'none';
    dropZone.style.opacity = '0.5';
    clearFloatingTiles();
    loginError.textContent = '';
  }

  // --- Spawn more ---
  btnSpawn.addEventListener('click', function () {
    spawnBatch(8);
  });

  // --- Clear floating tiles ---
  btnClearTiles.addEventListener('click', function () {
    clearFloatingTiles();
  });

  // --- Submit ---
  btnSubmit.addEventListener('click', function () {
    if (confirming) {
      const confirmPw = getConfirmPassword();
      if (!confirmPw) {
        loginError.textContent = 'Drag tiles into the confirm password box.';
        return;
      }
      if (confirmPw !== savedPassword) {
        loginError.textContent = 'Passwords do not match! Try again.';
        while (confirmTiles.length) {
          const ct = confirmTiles.pop();
          confirmZone.removeChild(ct.el);
        }
        confirmZone.classList.remove('has-tiles');
        clearFloatingTiles();
        return;
      }
      sessionStorage.setItem('secretAuth', 'true');
      window.location.href = 'secret.html';
      return;
    }

    const user = usernameInput.value.trim();
    if (!user) {
      loginError.textContent = 'Enter a username. Literally anything.';
      return;
    }
    const pw = getPassword();
    if (!pw) {
      loginError.textContent = 'You need to drag some tiles into the password box.';
      return;
    }
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSymbol = /[!?@&]/.test(pw);
    const hasLength = pw.length >= 6;
    if (!hasUpper || !hasNumber || !hasSymbol || !hasLength) {
      loginError.textContent = 'Password does not meet all requirements!';
      return;
    }
    enterConfirmMode(pw);
  });

  // --- Collision helper ---
  function bounceOffRect(t, rect, pad) {
    const r = {
      left: rect.left - pad,
      right: rect.right + pad,
      top: rect.top - pad,
      bottom: rect.bottom + pad,
    };
    const tRight = t.x + TILE_SIZE;
    const tBottom = t.y + TILE_SIZE;
    if (tRight > r.left && t.x < r.right && tBottom > r.top && t.y < r.bottom) {
      const oL = tRight - r.left, oR = r.right - t.x;
      const oT = tBottom - r.top, oB = r.bottom - t.y;
      const min = Math.min(oL, oR, oT, oB);
      if (min === oL)      { t.x = r.left - TILE_SIZE; t.vx = -Math.abs(t.vx) * 0.6; }
      else if (min === oR) { t.x = r.right;            t.vx =  Math.abs(t.vx) * 0.6; }
      else if (min === oT) { t.y = r.top - TILE_SIZE;  t.vy = -Math.abs(t.vy) * 0.6; }
      else                 { t.y = r.bottom;            t.vy =  Math.abs(t.vy) * 0.6; }
    }
  }

  // --- Physics loop ---
  function physicsTick() {
    const maxX = window.innerWidth - TILE_SIZE;
    const maxY = window.innerHeight - TILE_SIZE;

    const wrapperRect = loginWrapper.getBoundingClientRect();
    const homeLinkRect = homeLink.getBoundingClientRect();
    const darkToggleRect = darkToggle.getBoundingClientRect();

    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      if (dragging && dragging.tile === t) continue;

      // --- Cursor repulsion ---
      const tileCX = t.x + TILE_SIZE / 2;
      const tileCY = t.y + TILE_SIZE / 2;
      const dx = tileCX - mouseX;
      const dy = tileCY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const isFleeing = dist < REPULSE_RADIUS;
      t.el.classList.toggle('fleeing', isFleeing);

      if (dist < REPULSE_RADIUS && dist > 1) {
        const force = REPULSE_STRENGTH * (1 - dist / REPULSE_RADIUS);
        t.vx += (dx / dist) * force;
        t.vy += (dy / dist) * force;
      }

      if (t.momentum) {
        t.vx *= FRICTION;
        t.vy *= FRICTION;
        if (Math.abs(t.vx) < 0.05 && Math.abs(t.vy) < 0.05) {
          t.momentum = false;
          t.vx = (Math.random() - 0.5) * DRIFT_SPEED * 2;
          t.vy = (Math.random() - 0.5) * DRIFT_SPEED * 2;
        }
      } else {
        t.vx += (Math.random() - 0.5) * 0.04;
        t.vy += (Math.random() - 0.5) * 0.04;
        t.vx *= DAMPING;
        t.vy *= DAMPING;
      }

      t.x += t.vx;
      t.y += t.vy;

      // --- Bounce off UI elements ---
      bounceOffRect(t, wrapperRect, 4);
      bounceOffRect(t, homeLinkRect, 4);
      bounceOffRect(t, darkToggleRect, 4);

      // Bounce off edges
      if (t.x < 0) { t.x = 0; t.vx = Math.abs(t.vx); }
      if (t.x > maxX) { t.x = maxX; t.vx = -Math.abs(t.vx); }
      if (t.y < 0) { t.y = 0; t.vy = Math.abs(t.vy); }
      if (t.y > maxY) { t.y = maxY; t.vy = -Math.abs(t.vy); }

      t.el.style.left = t.x + 'px';
      t.el.style.top = t.y + 'px';
    }

    requestAnimationFrame(physicsTick);
  }

  // --- Init ---
  spawnBatch(8);
  requestAnimationFrame(physicsTick);
})();
