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
