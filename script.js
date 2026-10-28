const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const typingTarget = document.querySelector('[data-typing]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-link, .nav-cv').forEach((link) => {
  link.addEventListener('click', () => {
    nav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const phrases = ['Ingénieur Géomaticien', 'AI Enthusiast', 'GeoAI Explorer'];
let phraseIndex = 0;
let characterIndex = 0;
let deleting = false;

const typePhrase = () => {
  if (!typingTarget || prefersReducedMotion) return;
  const phrase = phrases[phraseIndex];
  typingTarget.textContent = deleting ? phrase.slice(0, characterIndex--) : phrase.slice(0, characterIndex++);

  let delay = deleting ? 42 : 78;
  if (!deleting && characterIndex > phrase.length) {
    delay = 1500;
    deleting = true;
  } else if (deleting && characterIndex < 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    characterIndex = 0;
    delay = 420;
  }
  window.setTimeout(typePhrase, delay);
};
if (typingTarget && prefersReducedMotion) typingTarget.textContent = phrases[0];
if (!prefersReducedMotion) typePhrase();

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav-link')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));

const projectCarousel = document.querySelector('[data-project-carousel]');
if (projectCarousel) {
  const track = projectCarousel.querySelector('.project-list');
  const originalCards = [...projectCarousel.querySelectorAll('.project-card')];
  const realCount = originalCards.length;
  const count = projectCarousel.querySelector('[data-project-count]');
  const progress = projectCarousel.querySelector('[data-project-progress]');
  const prev = projectCarousel.querySelector('[data-project-prev]');
  const next = projectCarousel.querySelector('[data-project-next]');
  let projectIndex = 0;
  let projectTimer;

  // Clone the first card so the last-to-first transition never visibly jumps back.
  track.appendChild(originalCards[0].cloneNode(true));

  const renderProject = (instant = false) => {
    track.style.transition = instant ? 'none' : '';
    track.style.transform = `translateX(-${projectIndex * 100}%)`;
    const visibleIndex = projectIndex === realCount ? 0 : projectIndex;
    if (count) count.textContent = `${String(visibleIndex + 1).padStart(2, '0')} / ${String(realCount).padStart(2, '0')}`;
    if (progress) progress.style.transform = `scaleX(${(visibleIndex + 1) / realCount})`;
  };

  const goTo = (index) => {
    projectIndex = (index + realCount) % realCount;
    renderProject();
  };

  const advance = () => {
    if (projectIndex === realCount - 1) {
      projectIndex = realCount;
      renderProject();
      window.setTimeout(() => {
        projectIndex = 0;
        renderProject(true);
        requestAnimationFrame(() => { track.style.transition = ''; });
      }, 760);
    } else {
      projectIndex += 1;
      renderProject();
    }
  };

  const startProjectLoop = () => {
    if (prefersReducedMotion) return;
    window.clearInterval(projectTimer);
    projectTimer = window.setInterval(advance, 2000);
  };
  const stopProjectLoop = () => window.clearInterval(projectTimer);

  prev?.addEventListener('click', () => { goTo(projectIndex - 1); startProjectLoop(); });
  next?.addEventListener('click', () => { advance(); startProjectLoop(); });
  projectCarousel.addEventListener('mouseenter', stopProjectLoop);
  projectCarousel.addEventListener('mouseleave', startProjectLoop);
  projectCarousel.addEventListener('focusin', stopProjectLoop);
  projectCarousel.addEventListener('focusout', startProjectLoop);
  renderProject(true);
  startProjectLoop();
}
