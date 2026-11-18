/**
 * All motion for the site.
 *
 * Lifecycle with Astro's <ClientRouter />:
 *  - this module runs ONCE (first load). Persistent UI (header, menu, cursor, runner, curtain)
 *    is wired up here and survives navigations via `transition:persist`.
 *  - `astro:before-preparation` → curtain slides in while the next page is fetched
 *  - `astro:before-swap`        → kill every ScrollTrigger/tween of the old page
 *  - `astro:page-load`          → build the new page's animations, restore scroll, curtain out
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true }); // no jump when the mobile address bar hides

type El = HTMLElement;
const $ = <T extends Element = El>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = El>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

/* ------------------------------------------------------------------ */
/* smooth scroll                                                       */
/* ------------------------------------------------------------------ */
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.addEventListener('refresh', () => lenis!.resize());
}
if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis, ScrollTrigger }); // handy for debugging
const scrollToY = (y: number) => {
  if (lenis) { lenis.resize(); lenis.scrollTo(y, { immediate: true, force: true }); }
  else window.scrollTo(0, y);
};
const smoothTo = (target: string | number) => {
  if (target === 0 || target === '#top') {
    lenis ? lenis.scrollTo(0, { duration: 1.6 }) : window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    return;
  }
  const el = typeof target === 'string' ? $(target) : null;
  if (!el) return;
  lenis
    ? lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
    : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
};

/* scroll velocity bus — header, lanyard and marquee listen to it */
const velSubs = new Set<(v: number, y: number) => void>();
let lastY = scrollY, lastT = performance.now();
const onScroll = () => {
  const now = performance.now(), y = scrollY;
  const v = ((y - lastY) / Math.max(1, now - lastT)) * 16;
  lastY = y; lastT = now;
  velSubs.forEach((f) => f(v, y));
};
lenis ? lenis.on('scroll', onScroll) : addEventListener('scroll', onScroll, { passive: true });

/* ------------------------------------------------------------------ */
/* persistent UI                                                       */
/* ------------------------------------------------------------------ */
const header = $('.site-header')!;
const menu = $('.menu')!, menuBtn = $('.menu-btn')!;
const menuLinks = $$('a', menu), menuClose = $('.menu-close', menu)!;

velSubs.add((v, y) => {
  header.classList.toggle('scrolled', y > 20);
  if (menu.classList.contains('open')) return;
  if (v > 1.5 && y > 200) header.classList.add('is-hidden');
  else if (v < -1.5 || y < 200) header.classList.remove('is-hidden');
});

/* toast + copy email */
const toastEl = $('.toast')!;
const toast = (msg: string) => {
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout((toastEl as any)._h);
  (toastEl as any)._h = setTimeout(() => toastEl.classList.remove('show'), 1800);
};
document.addEventListener('click', (e) => {
  const c = (e.target as El).closest<El>('[data-copy]');
  if (!c) return;
  navigator.clipboard?.writeText(c.dataset.copy!).then(() => toast('✓ email copied'), () => toast(c.dataset.copy!));
});

/* mobile menu: circle grows out of / back into the Menu button */
let menuTl: gsap.core.Timeline | null = null;
function setMenu(open: boolean) {
  if (open === menu.classList.contains('open')) return;
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuBtn.setAttribute('aria-expanded', String(open));
  lenis && (open ? lenis.stop() : lenis.start());
  if (reduce) { menu.style.visibility = open ? 'visible' : 'hidden'; menu.style.clipPath = open ? 'none' : ''; return; }
  const b = menuBtn.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
  const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
  const shut = `circle(0px at ${x}px ${y}px)`, full = `circle(${R}px at ${x}px ${y}px)`;
  menuTl?.kill();
  if (open) {
    menuTl = gsap.timeline()
      .set(menu, { visibility: 'visible' })
      .fromTo(menu, { clipPath: shut }, { clipPath: full, duration: 0.8, ease: 'expo.inOut' })
      .fromTo(menuLinks, { yPercent: 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: 'expo.out' }, 0.35)
      .fromTo(menuClose, { scale: 0, rotate: -180, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(2)' }, 0.3)
      .add(() => menuClose.focus({ preventScroll: true }));
  } else {
    menuTl = gsap.timeline({ onComplete: () => { gsap.set(menu, { visibility: 'hidden' }); } })
      .to(menuClose, { scale: 0, rotate: 180, autoAlpha: 0, duration: 0.4, ease: 'back.in(2)' }, 0)
      .to(menuLinks, { yPercent: -70, autoAlpha: 0, duration: 0.35, stagger: { each: 0.035, from: 'end' }, ease: 'power2.in' }, 0)
      .to(menu, { clipPath: shut, duration: 0.75, ease: 'expo.inOut' }, 0.2);
  }
}
menuBtn.addEventListener('click', () => setMenu(true));
menuClose.addEventListener('click', () => { setMenu(false); menuBtn.focus({ preventScroll: true }); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* in-page links: smooth scroll when the target is on this page; otherwise let the router navigate.
   Capture phase so we run before ClientRouter's own click handler. */
document.addEventListener('click', (e) => {
  const a = (e.target as El).closest<HTMLAnchorElement>('a[data-nav]');
  if (!a) return;
  const url = new URL(a.href, location.href);
  const samePage = url.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '');
  if (a.hasAttribute('data-top') || (samePage && !url.hash)) { e.preventDefault(); setMenu(false); smoothTo(0); return; }
  if (samePage && url.hash && $(url.hash)) { e.preventDefault(); setMenu(false); smoothTo(url.hash); return; }
  setMenu(false);
}, true);

/* cursor + magnetic buttons */
const cursor = $('.cursor')!;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
if (fine && !reduce) {
  const dot = $('.c-dot', cursor)!, ring = $('.c-ring', cursor)!;
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  let magEl: El | null = null;
  addEventListener('pointermove', (e) => {
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    const t = e.target instanceof Element ? e.target : null;
    cursor.classList.toggle('is-inspect', !!t?.closest('[data-cursor="inspect"]'));
    cursor.classList.toggle('is-link', !!t?.closest('a,button'));
    const m = t?.closest<El>('[data-magnetic]') ?? null;
    if (magEl && magEl !== m) { gsap.to(magEl, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' }); magEl = null; }
    if (m) {
      magEl = m;
      const r = m.getBoundingClientRect();
      gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4, ease: 'power3' });
    }
  });
  document.addEventListener('pointerleave', () => gsap.to(cursor, { opacity: 0 }));
  document.addEventListener('pointerenter', () => gsap.to(cursor, { opacity: 1 }));
}

/* test runner */
const runner = $('.runner')!, runnerUl = $('ul', runner)!;
const runnerNow = $('.runner-now', runner)!, runnerCount = $('.runner-count', runner)!, runnerBar = $('.runner-bar i', runner)!;
function setSpec(i: number, specs: string[]) {
  [...runnerUl.children].forEach((li, k) => { li.classList.toggle('passed', k < i); li.classList.toggle('active', k === i); });
  const done = i >= specs.length;
  runner.classList.toggle('done', done);
  runnerNow.textContent = done ? `${specs.length} passed ✓` : `Running ${specs[i]}.spec`;
  runnerCount.textContent = done ? '' : `${i + 1}/${specs.length}`;
}
function trackSpecs(scope: ParentNode) {
  const secs = $$('[data-spec]', scope);
  const specs = secs.map((s) => s.dataset.spec!);
  runnerUl.innerHTML = specs.map((s) => `<li>${s}.spec</li>`).join('');
  setSpec(0, specs);
  runnerBar.style.transform = 'scaleX(0)';
  secs.forEach((sec, i) => ScrollTrigger.create({
    // pinned sections: measure the pin-spacer so the pinned scroll distance counts
    trigger: sec.parentElement?.classList.contains('pin-spacer') ? sec.parentElement : sec,
    start: 'top 55%', end: 'bottom 55%',
    onToggle: (self) => { if (self.isActive) { setSpec(i, specs); sec.classList.add('is-passed'); } },
  }));
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: (s) => {
      runnerBar.style.transform = `scaleX(${s.progress})`;
      if (s.progress > 0.995) setSpec(specs.length, specs);
    },
  });
}

/* ------------------------------------------------------------------ */
/* reusable effects                                                    */
/* ------------------------------------------------------------------ */
function splitWords(el: El): El[] {
  if (el.dataset.splitDone) return $$('.wi', el);
  const out: Node[] = [];
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === 3) {
      (node.textContent ?? '').split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { out.push(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'w';
        const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part;
        w.appendChild(wi); out.push(w);
      });
    } else if (node.nodeName === 'BR') out.push(node.cloneNode());
    else {
      const w = document.createElement('span'); w.className = 'w';
      const wi = document.createElement('span'); wi.className = 'wi';
      wi.appendChild(node.cloneNode(true)); w.appendChild(wi); out.push(w);
    }
  });
  el.replaceChildren(...out);
  el.dataset.splitDone = '1';
  return $$('.wi', el);
}

function commonEffects(scope: ParentNode, subs: (() => void)[]) {
  $$('[data-split]', scope).forEach((el) => {
    gsap.from(splitWords(el), { yPercent: 115, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  const reveal = [...$$('[data-reveal]', scope), ...$$('[data-reveal-children] > *', scope)];
  reveal.forEach((el) => {
    gsap.from(el, { y: 40, autoAlpha: 0, filter: 'blur(6px)', duration: 1.1, ease: 'expo.out', clearProps: 'filter', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  $$('[data-speed]', scope).forEach((el) => {
    const amt = (parseFloat(el.dataset.speed!) - 1) * 220;
    gsap.fromTo(el, { y: amt }, { y: -amt, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('[data-count]', scope).forEach((el) => {
    const o = { v: 0 }, to = +el.dataset.count!, suf = el.dataset.suffix ?? '';
    el.textContent = '0' + suf;
    gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => { el.textContent = Math.round(o.v) + suf; } });
  });
  // contact: content rises as the lime footer is uncovered
  if ($('.contact', scope)) {
    gsap.fromTo('.contact > .wrap', { yPercent: -45 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    const t0 = performance.now(), summary = $('.contact .summary', scope);
    ScrollTrigger.create({ trigger: '.contact', start: 'top 60%', onEnter: () => {
      if (summary) summary.textContent = `all specs passed ✓ (${((performance.now() - t0) / 1000).toFixed(1)}s)`;
    } });
  }
  void subs;
}

/* ------------------------------------------------------------------ */
/* home page                                                           */
/* ------------------------------------------------------------------ */
let introPlayed = false;
let introDelay = 0.1;

function initHome(view: El, mm: gsap.MatchMedia, subs: (() => void)[]) {
  const hero = $('.hero', view)!, letters = $$('.hero .L', view);

  // ---- 1. pins first, in DOM order (anything below a pin must be created after it)
  ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', pin: true, pinSpacing: false });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    ([['.experience', '.exp-track'], ['.projects', '.proj-track']] as const).forEach(([s, t]) => {
      const sec = $(s, view)!, track = $(t, view)!;
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      if (s === '.experience') {
        gsap.to('.rail i', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), scrub: true } });
        $$('.job .yr', view).forEach((y) => gsap.from(y, { x: 160, ease: 'none',
          scrollTrigger: { trigger: y.parentElement!, containerAnimation: tween, start: 'left right', end: 'left 40%', scrub: true } }));
        gsap.from('.twist', { rotation: 14, scale: 0.8, ease: 'none',
          scrollTrigger: { trigger: '.twist', containerAnimation: tween, start: 'left right', end: 'center center', scrub: true } });
      } else {
        gsap.to('.big-out', { xPercent: -35, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: () => '+=' + (dist() + innerHeight * 2), scrub: true } });
        $$('.proj-track .pcard', view).forEach((c) => gsap.from(c, { rotation: 6, y: 60, ease: 'none',
          scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'left 55%', scrub: true } }));
      }
    });
    // experience → projects: the dark section expands out of a rounded card
    gsap.fromTo('.projects', { clipPath: 'inset(8% 4% 0% 4% round 48px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none',
      scrollTrigger: { trigger: '.projects', start: 'top bottom', end: 'top top', scrub: true } });
  });

  // ---- 2. hero → about: the hero shrinks into a card while About slides over it
  gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
    .to('.hero-inner', { scale: 0.88, borderRadius: 40, ease: 'none' }, 0)
    .to('.hero-shade', { opacity: 0.55, ease: 'none' }, 0);

  letters.forEach((g) => {
    gsap.to(g, { y: -+g.dataset.depth! * 340, rotation: +g.dataset.rot!, transformOrigin: '50% 50%', ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  });
  gsap.to('.hero-illo', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-copy, .hero-mobile', { y: -120, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '60% top', scrub: true } });

  if (fine) {
    const qs = letters.map((g) => gsap.quickTo(g, 'x', { duration: 1, ease: 'power3' }));
    const qi = gsap.quickTo('.hero-illo', 'x', { duration: 1.2, ease: 'power3' });
    const mv = (e: PointerEvent) => { const k = e.clientX / innerWidth - 0.5; letters.forEach((g, i) => qs[i](k * -60 * +g.dataset.depth!)); qi(k * 14); };
    hero.addEventListener('pointermove', mv);
    subs.push(() => hero.removeEventListener('pointermove', mv));
  }

  // ---- 3. hero intro (first page load only)
  if (!introPlayed) {
    const words = $$('.hero .tagline', view).flatMap((t) => splitWords(t));
    const scan = $('.scanline', view)!, scanLabel = $('span', scan)!;
    gsap.timeline({ delay: introDelay, defaults: { ease: 'expo.out' } })
      .from('.hero-stage > svg', { scale: 1.18, transformOrigin: '50% 70%', duration: 2 }, 0)
      .from(letters, { y: () => gsap.utils.random(-800, -450), rotation: () => gsap.utils.random(-70, 70), autoAlpha: 0, duration: 1.4, ease: 'bounce.out', stagger: { each: 0.07, from: 'random' } }, 0.05)
      .from('.hero-illo', { yPercent: 45, scale: 0.9, filter: 'blur(14px)', autoAlpha: 0, duration: 1.5, clearProps: 'filter' }, 0.45)
      .set(scan, { autoAlpha: 1, top: '0%' }, 1.05)
      .to(scan, { top: '100%', duration: 1.15, ease: 'power2.inOut' }, 1.05)
      .add(() => { scanLabel.textContent = '✓ 0 bugs found'; }, 2.0)
      .to(scan, { autoAlpha: 0, duration: 0.35 }, 2.35)
      .from(words, { yPercent: 115, rotate: 5, duration: 1.1, stagger: 0.045 }, 1.15)
      .from('.hero-copy .muted, .hero-mobile .muted, .hero .status, .scroll-cue', { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.07 }, 1.45)
      .from('.badge-spin', { scale: 0, rotate: -200, duration: 1.2, ease: 'back.out(1.8)' }, 1.3)
      .from('.site-header .logo, .site-header .nav > *', { y: -36, autoAlpha: 0, duration: 0.9, stagger: 0.05, clearProps: 'all' }, 1.25)
      .from('.runner', { y: 90, autoAlpha: 0, duration: 1.1, ease: 'back.out(1.5)', clearProps: 'all' }, 1.7);
  }

  // ---- 4. lanyard: drops in, then swings with scroll velocity (click to poke it)
  const lan = $('.lanyard', view)!;
  gsap.from(lan, { y: -260, rotation: -18, duration: 1.8, ease: 'elastic.out(1,.45)', scrollTrigger: { trigger: '.about', start: 'top 70%' } });
  let settle: number | undefined;
  const swing = (v: number) => {
    gsap.to(lan, { rotation: gsap.utils.clamp(-12, 12, -v * 1.4), duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
    clearTimeout(settle);
    settle = window.setTimeout(() => gsap.to(lan, { rotation: 0, duration: 2.2, ease: 'elastic.out(1,.25)', overwrite: 'auto' }), 120);
  };
  velSubs.add(swing);
  const poke = () => gsap.fromTo(lan, { rotation: 10 }, { rotation: 0, duration: 2.4, ease: 'elastic.out(1.2,.2)' });
  lan.addEventListener('click', poke);
  subs.push(() => { velSubs.delete(swing); clearTimeout(settle); lan.removeEventListener('click', poke); });

  // header turns light over the dark Projects section
  ScrollTrigger.create({ trigger: '.projects', start: 'top 70px', end: 'bottom 70px', toggleClass: { targets: header, className: 'on-dark' } });

  // marquee rows speed up with scroll velocity
  $$('.mq-row', view).forEach((row, i) => {
    const dir = i % 2 ? 1 : -1;
    gsap.set(row, { xPercent: dir > 0 ? -50 : 0 });
    const loop = gsap.to(row, { xPercent: dir > 0 ? 0 : -50, duration: 28, ease: 'none', repeat: -1 });
    const boost = (v: number) => gsap.to(loop, { timeScale: (v >= 0 ? 1 : -1) * (1 + Math.min(6, Math.abs(v) * 0.5)), duration: 0.3, overwrite: true,
      onComplete: () => { gsap.to(loop, { timeScale: v >= 0 ? 1 : -1, duration: 1.2 }); } });
    velSubs.add(boost);
    subs.push(() => velSubs.delete(boost));
  });
}

/* ------------------------------------------------------------------ */
/* per-page setup / teardown                                           */
/* ------------------------------------------------------------------ */
let cleanup: (() => void) | null = null;

function initPage() {
  const view = $<El>('#main')!;
  const mm = gsap.matchMedia();
  const subs: (() => void)[] = [];
  header.classList.remove('on-dark', 'is-hidden');
  if (fine && !reduce) document.body.classList.add('has-cursor');
  // mark the active nav link
  $$<HTMLAnchorElement>('.nav .link').forEach((a) => {
    const p = new URL(a.href).pathname;
    a.classList.toggle('active', p !== '/' && location.pathname.startsWith(p));
  });

  const ctx = gsap.context(() => {
    if (!reduce) {
      if ($('[data-page="home"]', view)) initHome(view, mm, subs);
      commonEffects(view, subs);
    }
    trackSpecs(view);
  }, view);
  introPlayed = true;
  cleanup = () => { subs.forEach((f) => f()); mm.revert(); ctx.revert(); };
}

let navType = 'push';
function restoreScroll() {
  ScrollTrigger.refresh();
  let y = 0;
  if (navType === 'traverse' && typeof history.state?.scrollY === 'number') y = history.state.scrollY;
  else if (location.hash) {
    const el = $(decodeURIComponent(location.hash));
    if (el) y = el.getBoundingClientRect().top + scrollY;
  }
  scrollToY(y);
}

/* page curtain */
const curtain = $('.curtain')!, cLabel = $('.curtain-label', curtain)!, cCheck = $('.curtain-check', curtain)!;
let curtainUp = false;
const curtainIn = (text: string) => new Promise<void>((r) => {
  if (reduce) { r(); return; }
  curtainUp = true;
  cLabel.textContent = text;
  gsap.timeline({ onComplete: r })
    .set(curtain, { display: 'grid' })
    .fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'expo.inOut' })
    .fromTo(cCheck, { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, duration: 0.45, ease: 'back.out(2.2)' }, '-=.18')
    .fromTo(cLabel, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3 }, '<.1');
});
const curtainOut = () => new Promise<void>((r) => {
  if (!curtainUp) { r(); return; }
  curtainUp = false;
  gsap.timeline({ onComplete: r })
    .to([cCheck, cLabel], { y: -20, autoAlpha: 0, duration: 0.25, ease: 'power2.in' })
    .to(curtain, { yPercent: -100, duration: 0.7, ease: 'expo.inOut' }, '-=.05')
    .set(curtain, { display: 'none' })
    .set([cCheck, cLabel], { y: 0, autoAlpha: 1 });
});

document.addEventListener('astro:before-preparation', (e: any) => {
  navType = e.navigationType;
  setMenu(false);
  lenis?.stop();
  const path = (e.to as URL).pathname;
  const load = e.loader;
  // fetch the next page while the curtain covers the screen
  e.loader = async () => { await Promise.all([curtainIn(`GET ${path} → 200 OK`), load()]); };
});
document.addEventListener('astro:before-swap', () => { cleanup?.(); cleanup = null; });

/* ------------------------------------------------------------------ */
/* first visit: test-runner loader                                     */
/* ------------------------------------------------------------------ */
function runLoader(loader: El) {
  const cmd = 'npx playwright test portfolio.spec.ts';
  const typed = $('.ld-typed', loader)!, num = $('.ld-num span', loader)!, bar = $('.ld-bar i', loader)!, sum = $('.ld-sum', loader)!;
  const items = $$('.ld-list li', loader), o = { c: 0, v: 0 };
  return new Promise<void>((r) => {
    const tl = gsap.timeline({ onComplete: r, defaults: { ease: 'expo.out' } });
    tl.from($$('.ld-top > *', loader), { y: -24, autoAlpha: 0, duration: 0.7, stagger: 0.08 })
      .from($('.ld-num', loader), { yPercent: 40, autoAlpha: 0, duration: 1 }, 0.1)
      .to(o, { c: cmd.length, duration: 0.7, ease: 'none', onUpdate: () => { typed.textContent = cmd.slice(0, Math.round(o.c)); } }, 0.15)
      .to(o, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(o.v)); bar.style.transform = `scaleX(${o.v / 100})`; } }, 0.85);
    items.forEach((li, i) => {
      const at = 0.9 + i * 0.16, ic = $('.ld-ic', li)!;
      tl.to(li, { autoAlpha: 1, x: 0, duration: 0.35, onStart: () => { ic.className = 'ld-ic spin'; } }, at)
        .add(() => { ic.className = 'ld-ic'; ic.textContent = '✓'; $('.ld-time', li)!.textContent = (0.06 + Math.random() * 0.3).toFixed(2) + 's'; }, at + 0.22);
    });
    tl.add(() => { sum.textContent = `${items.length} passed · 0 failed`; }, 2.35)
      .from(sum, { y: 8, autoAlpha: 0, duration: 0.4 }, 2.35)
      .to($('.ld-caret', loader), { autoAlpha: 0, duration: 0.1 }, 2.35)
      .to($('.ld-burst', loader), { clipPath: 'circle(150% at 50% 50%)', duration: 0.9, ease: 'expo.inOut' }, 2.55)
      .from($('.ld-burst .ring', loader), { scale: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(1.8)' }, 2.85)
      .to($('.ld-burst .tick', loader), { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, 3.05)
      .from($('.ld-burst p', loader), { y: 16, autoAlpha: 0, duration: 0.5 }, 3.1)
      .to({}, { duration: 0.05 });
  });
}

let booted = false;
async function boot() {
  history.scrollRestoration = 'manual';
  const loader = $('.loader');
  const firstVisit = root.classList.contains('first-visit') && !!loader;
  await document.fonts.ready;
  if (!firstVisit) {
    loader?.remove();
    initPage(); restoreScroll();
    return;
  }
  try { sessionStorage.setItem('ran', '1'); } catch {}
  lenis?.stop();
  await runLoader(loader!);
  introDelay = 0.2;
  initPage(); restoreScroll();     // page + hero intro start behind the loader
  await new Promise<void>((r) => gsap.to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: 'expo.inOut', onComplete: () => r() }));
  loader!.remove();
  root.classList.remove('first-visit');
  lenis?.start();
}

document.addEventListener('astro:page-load', async () => {
  if (!booted) { booted = true; await boot(); return; }
  $('.loader')?.remove();
  initPage();
  restoreScroll();
  await curtainOut();
  lenis?.start();
});
