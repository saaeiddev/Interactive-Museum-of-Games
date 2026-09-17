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
  card.style.setProperty('--ry', `${((px - 0.5) * 14).toFixed(2)}deg`);
  card.style.setProperty('--rx', `${((0.5 - py) * 10).toFixed(2)}deg`);
  card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
  card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
}

function wireTilt(cards) {
  cards.forEach((card, index) => {
    card.style.setProperty('--delay', `${Math.min(index * 70, 420)}ms`);
    resetTilt(card);
    card.addEventListener('pointermove', event => {
      if (event.target.closest?.('.console-viewport')) return;
      tiltFromPointer(event, card);
    });
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

function setCoverWithFallback(img, sources) {
  if (!img || !sources?.length) return;
  let index = 0;
  img.referrerPolicy = 'no-referrer';
  img.onerror = () => {
    index += 1;
    if (index < sources.length) img.src = sources[index];
    else img.onerror = null;
  };
  img.src = sources[0];
}

function repairGameCovers() {
  setCoverWithFallback(document.querySelector('.game-card--sonic img'), [
    'https://upload.wikimedia.org/wikipedia/en/b/ba/Sonic_the_Hedgehog_1_Genesis_box_art.jpg',
    'https://en.wikipedia.org/wiki/Special:Redirect/file/Sonic_the_Hedgehog_1_Genesis_box_art.jpg'
  ]);

  setCoverWithFallback(document.querySelector('.game-card--tmnt img'), [
    'https://gamefaqs.gamespot.com/a/box/8/1/5/39815_front.jpg',
    'https://turtlepedia.fandom.com/wiki/Special:Redirect/file/TMNT-nes.jpg'
  ]);

  setCoverWithFallback(document.querySelector('.game-card--wile img'), [
    'https://www.gamesdatabase.org/Media/SYSTEM/Sega_Game_Gear/Box/big/Desert_Speedtrap_Starring_Road_Runner_And_Wile_E._Coyote_-_1993_-_Sega.jpg',
    'https://gamefaqs.gamespot.com/a/box/4/8/1/48481_front.jpg'
  ]);
}

function injectConsoleGallery() {
  if (!document.querySelector('link[href*="consoles.css"]')) {
    const consoleStyles = document.createElement('link');
    consoleStyles.rel = 'stylesheet';
    consoleStyles.href = './consoles.css?v=20260911-4';
    document.head.appendChild(consoleStyles);
  }

  if (!document.querySelector('link[href*="consoles-3d.css"]')) {
    const console3DStyles = document.createElement('link');
    console3DStyles.rel = 'stylesheet';
    console3DStyles.href = './consoles-3d.css?v=20260917-1';
    document.head.appendChild(console3DStyles);
  }

  const consolesAnchor = document.querySelector('#consoles');
  const gamesGallery = document.querySelector('#games');
  if (!consolesAnchor || !gamesGallery || document.querySelector('.console-gallery')) return;

  const consoleGallery = document.createElement('section');
  consoleGallery.className = 'console-gallery';
  consoleGallery.id = 'console-collection';
  consoleGallery.setAttribute('aria-labelledby', 'consoles-gallery-title');
  consoleGallery.innerHTML = `
    <div class="console-gallery-head">
      <div>
        <p class="section-kicker">ICONIC HARDWARE • INTERACTIVE 3D</p>
        <h3 id="consoles-gallery-title">Nostalgic Console Collection</h3>
      </div>
      <p>Interactive 3D-style exhibits inspired by the original silhouettes of classic hardware. Move your pointer across each object to inspect it.</p>
    </div>
    <div class="console-grid">
      <article class="console-card" tabindex="0" data-console-card aria-label="Original PlayStation 3D exhibit">
        <div class="console-card-shell"><div class="console-card-glow"></div><div class="console-stage"><div class="console-viewport" data-console-model="ps1" role="img" aria-label="Interactive real-time 3D model of an original PlayStation console"></div></div><div class="console-meta"><span class="console-era">SONY • 1994</span><h4>PlayStation</h4><p>The original grey icon that helped define the 3D era.</p></div></div>
      </article>
      <article class="console-card" tabindex="0" data-console-card aria-label="Nintendo Entertainment System 3D exhibit">
        <div class="console-card-shell"><div class="console-card-glow"></div><div class="console-stage"><div class="console-viewport" data-console-model="nes" role="img" aria-label="Interactive real-time 3D model of a Nintendo Entertainment System console"></div></div><div class="console-meta"><span class="console-era">NINTENDO • 1983/1985</span><h4>Nintendo Entertainment System</h4><p>Cartridges, pixel worlds and an unmistakable retro silhouette.</p></div></div>
      </article>
      <article class="console-card" tabindex="0" data-console-card aria-label="PSP 3D exhibit">
        <div class="console-card-shell"><div class="console-card-glow"></div><div class="console-stage"><div class="console-viewport" data-console-model="psp" role="img" aria-label="Interactive real-time 3D model of a Sony PSP handheld"></div></div><div class="console-meta"><span class="console-era">SONY • 2004</span><h4>PSP</h4><p>A glossy portable console that put ambitious 3D games in your hands.</p></div></div>
      </article>
    </div>
    <p style="margin:18px 0 0;color:#77879a;font-size:10px;letter-spacing:.12em">CONSOLE WING • BUILD 20260911.4</p>`;

  gamesGallery.parentNode.insertBefore(consoleGallery, gamesGallery);
  wireTilt([...consoleGallery.querySelectorAll('[data-console-card]')]);

  import('./consoles-3d.js?v=20260917-1').catch(error => {
    console.error('Unable to load real-time console models:', error);
    consoleGallery.querySelectorAll('.console-viewport').forEach(viewport => viewport.classList.add('has-fallback'));
  });
}

function initMuseumCards() {
  repairGameCovers();

  const gameCards = [...document.querySelectorAll('[data-game-card]')];
  wireTilt(gameCards);

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

  injectConsoleGallery();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMuseumCards, { once: true });
else initMuseumCards();

reducedMotion.addEventListener?.('change', event => {
  if (event.matches) document.querySelectorAll('[data-game-card],[data-console-card]').forEach(card => {
    resetTilt(card);
    card.classList.add('is-visible');
  });
});
