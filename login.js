(function () {
  const MAX_TILES = 100;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?@&';
  const TILE_SIZE = 48;
  const JITTER = 4;
  const DRIFT_SPEED = 0.3;
  const DAMPING = 0.98;
  const FRICTION = 0.94;
  const REPULSE_RADIUS = 120;
  const REPULSE_STRENGTH = 2.5;

  const playground = document.getElementById('tile-playground');
  const dropZone = document.getElementById('drop-zone');
  const dropLabel = document.getElementById('drop-zone-label');
  const reqUpper = document.getElementById('req-upper');
  const reqNumber = document.getElementById('req-number');
  const reqSymbol = document.getElementById('req-symbol');
  const btnClear = document.getElementById('btn-clear');
  const btnSpawn = document.getElementById('btn-spawn');
  const btnSubmit = document.getElementById('btn-submit');
  const loginError = document.getElementById('login-error');
  const usernameInput = document.getElementById('username');
  const loginWrapper = document.querySelector('.login-wrapper');

  const tiles = [];
  const passwordTiles = [];
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
    return tiles.length + passwordTiles.length;
  }

  function spawnTile() {
    if (tileCount() >= MAX_TILES) return null;
    const el = document.createElement('div');
    el.className = 'tile';
    el.textContent = randomChar();

    const headerH = document.querySelector('.header').offsetHeight;
    const x = Math.random() * (window.innerWidth - TILE_SIZE);
    const y = headerH + Math.random() * (window.innerHeight - headerH - TILE_SIZE);

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

    const dzRect = dropZone.getBoundingClientRect();
    if (
      cx >= dzRect.left && cx <= dzRect.right &&
      cy >= dzRect.top && cy <= dzRect.bottom
    ) {
      dropTileInZone(tile);
    } else {
      tile.momentum = true;
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
    reqUpper.classList.toggle('met', hasUpper);
    reqNumber.classList.toggle('met', hasNumber);
    reqSymbol.classList.toggle('met', hasSymbol);
  }

  // --- Clear ---
  btnClear.addEventListener('click', function () {
    while (passwordTiles.length) {
      var t = passwordTiles.pop();
      dropZone.removeChild(t.el);
    }
    updateDropZone();
    updateRequirements();
    loginError.textContent = '';
  });

  // --- Spawn more ---
  btnSpawn.addEventListener('click', function () {
    spawnBatch(8);
  });

  // --- Submit ---
  btnSubmit.addEventListener('click', function () {
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
    if (!hasUpper || !hasNumber || !hasSymbol) {
      loginError.textContent = 'Password does not meet all requirements!';
      return;
    }
    sessionStorage.setItem('blursedAuth', 'true');
    window.location.href = 'secret.html';
  });

  // --- Physics loop ---
  function physicsTick() {
    const headerH = document.querySelector('.header').offsetHeight;
    const maxX = window.innerWidth - TILE_SIZE;
    const maxY = window.innerHeight - TILE_SIZE;

    // Get login wrapper bounding rect for collision
    const wrapperRect = loginWrapper.getBoundingClientRect();
    // Pad slightly so tiles don't overlap the edge
    const pad = 4;
    const wr = {
      left: wrapperRect.left - pad,
      right: wrapperRect.right + pad,
      top: wrapperRect.top - pad,
      bottom: wrapperRect.bottom + pad,
    };

    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      if (dragging && dragging.tile === t) continue;

      // --- Cursor repulsion ---
      const tileCX = t.x + TILE_SIZE / 2;
      const tileCY = t.y + TILE_SIZE / 2;
      const dx = tileCX - mouseX;
      const dy = tileCY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

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

      // --- Bounce off login wrapper ---
      const tRight = t.x + TILE_SIZE;
      const tBottom = t.y + TILE_SIZE;

      // Only deflect if the tile overlaps the wrapper rect
      if (tRight > wr.left && t.x < wr.right && tBottom > wr.top && t.y < wr.bottom) {
        // Find the smallest penetration axis to resolve
        const overlapLeft = tRight - wr.left;
        const overlapRight = wr.right - t.x;
        const overlapTop = tBottom - wr.top;
        const overlapBottom = wr.bottom - t.y;

        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if (minOverlap === overlapLeft) {
          t.x = wr.left - TILE_SIZE;
          t.vx = -Math.abs(t.vx) * 0.6;
        } else if (minOverlap === overlapRight) {
          t.x = wr.right;
          t.vx = Math.abs(t.vx) * 0.6;
        } else if (minOverlap === overlapTop) {
          t.y = wr.top - TILE_SIZE;
          t.vy = -Math.abs(t.vy) * 0.6;
        } else {
          t.y = wr.bottom;
          t.vy = Math.abs(t.vy) * 0.6;
        }
      }

      // Bounce off edges
      if (t.x < 0) { t.x = 0; t.vx = Math.abs(t.vx); }
      if (t.x > maxX) { t.x = maxX; t.vx = -Math.abs(t.vx); }
      if (t.y < headerH) { t.y = headerH; t.vy = Math.abs(t.vy); }
      if (t.y > maxY) { t.y = maxY; t.vy = -Math.abs(t.vy); }

      t.el.style.left = t.x + 'px';
      t.el.style.top = t.y + 'px';
    }

    requestAnimationFrame(physicsTick);
  }

  // --- Init ---
  spawnBatch(20);
  requestAnimationFrame(physicsTick);
})();
