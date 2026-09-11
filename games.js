const gameCards = [...document.querySelectorAll('[data-game-card]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function resetTilt(card) {
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
  card.style.setProperty('--mx', '50%');
  card.style.setProperty('--my', '50%');
}

function tiltFromPointer(event, card) {
  if (reducedMotion.matches) return;
  const rect = card.getBoundingClientRect();
  const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
  const ry = (px - 0.5) * 14;
  const rx = (0.5 - py) * 10;
  card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
  card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
  card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
  card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
}

gameCards.forEach((card, index) => {
  card.style.setProperty('--delay', `${Math.min(index * 70, 420)}ms`);
  resetTilt(card);

  card.addEventListener('pointermove', event => tiltFromPointer(event, card));
  card.addEventListener('pointerleave', () => resetTilt(card));
  card.addEventListener('blur', () => resetTilt(card));
  card.addEventListener('focus', () => {
    if (!reducedMotion.matches) {
      card.style.setProperty('--rx', '-2deg');
      card.style.setProperty('--ry', '3deg');
    }
  });
});

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  gameCards.forEach(card => observer.observe(card));
} else {
  gameCards.forEach(card => card.classList.add('is-visible'));
}

reducedMotion.addEventListener?.('change', event => {
  if (event.matches) gameCards.forEach(card => {
    resetTilt(card);
    card.classList.add('is-visible');
  });
});

// Nostalgic console wing — injected here so the existing museum structure stays untouched.
const consoleStyles = document.createElement('link');
consoleStyles.rel = 'stylesheet';
consoleStyles.href = './consoles.css';
document.head.appendChild(consoleStyles);

const consolesAnchor = document.querySelector('#consoles');
const gamesGallery = document.querySelector('#games');
if (consolesAnchor && gamesGallery && !document.querySelector('.console-gallery')) {
  const consoleGallery = document.createElement('section');
  consoleGallery.className = 'console-gallery';
  consoleGallery.setAttribute('aria-labelledby', 'consoles-gallery-title');
  consoleGallery.innerHTML = `
    <div class="console-gallery-head">
      <div>
        <p class="section-kicker">ICONIC HARDWARE • INTERACTIVE 3D</p>
        <h3 id="consoles-gallery-title">The consoles we grew up with.</h3>
      </div>
      <p>Move your pointer across each exhibit to inspect it in 3D. Every object is built from layered web geometry with animated museum lighting.</p>
    </div>
    <div class="console-grid">
      <article class="console-card" tabindex="0" data-console-card aria-label="Original PlayStation 3D exhibit">
        <div class="console-card-shell">
          <div class="console-card-glow" aria-hidden="true"></div>
          <div class="console-stage" aria-hidden="true">
            <div class="museum-object">
              <div class="ps1">
                <div class="ps1-base"></div><div class="ps1-lid"></div><span class="ps1-btn left"></span><span class="ps1-btn right"></span><span class="ps1-port p1"></span><span class="ps1-port p2"></span>
                <div class="ps1-controller"><span class="pad"></span><span class="buttons"></span></div>
              </div>
            </div>
          </div>
          <div class="console-meta"><span class="console-era">SONY • 1994</span><h4>PlayStation</h4><p>The machine that made 3D gaming feel like the future.</p></div>
        </div>
      </article>
      <article class="console-card" tabindex="0" data-console-card aria-label="Nintendo Entertainment System 3D exhibit">
        <div class="console-card-shell">
          <div class="console-card-glow" aria-hidden="true"></div>
          <div class="console-stage" aria-hidden="true">
            <div class="museum-object">
              <div class="nes"><div class="nes-body"></div><div class="nes-door"></div><div class="nes-stripe"></div><div class="nes-controller"><span class="nes-red"></span></div></div>
            </div>
          </div>
          <div class="console-meta"><span class="console-era">NINTENDO • 1983/1985</span><h4>Nintendo Entertainment System</h4><p>Cartridges, pixel worlds and one of gaming's most iconic silhouettes.</p></div>
        </div>
      </article>
      <article class="console-card" tabindex="0" data-console-card aria-label="PSP 3D exhibit">
        <div class="console-card-shell">
          <div class="console-card-glow" aria-hidden="true"></div>
          <div class="console-stage" aria-hidden="true">
            <div class="museum-object">
              <div class="psp"><div class="psp-screen"></div><div class="psp-dpad"></div><div class="psp-stick"></div><div class="psp-buttons"></div><div class="psp-logo">PSP</div></div>
            </div>
          </div>
          <div class="console-meta"><span class="console-era">SONY • 2004</span><h4>PSP</h4><p>Console-scale ambition in a pocket-sized, glossy black handheld.</p></div>
        </div>
      </article>
    </div>`;
  gamesGallery.parentNode.insertBefore(consoleGallery, gamesGallery);

  const consoleCards = [...consoleGallery.querySelectorAll('[data-console-card]')];
  consoleCards.forEach(card => {
    resetTilt(card);
    card.addEventListener('pointermove', event => tiltFromPointer(event, card));
    card.addEventListener('pointerleave', () => resetTilt(card));
    card.addEventListener('blur', () => resetTilt(card));
    card.addEventListener('focus', () => {
      if (!reducedMotion.matches) {
        card.style.setProperty('--rx', '-2deg');
        card.style.setProperty('--ry', '4deg');
      }
    });
  });
}
