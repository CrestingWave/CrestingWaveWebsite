(() => {
  const nav = document.getElementById("site-nav");
  const btn = document.querySelector(".nav-toggle");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close on link click (mobile)
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // active link
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".navlinks a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) a.classList.add("active");
    if (path === "" && href === "index.html") a.classList.add("active");
  });
})();


// Subtle motion: scroll reveal + optional hero parallax (respects reduced motion)
(() => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Scroll reveal
  const revealSelectors = [
    '.card',
    '.process-card',
    '.team-card',
    '.person-card',
    '.focus-card',
    '.hero h1',
    '.hero h2',
    'h2',
    '.btn'
  ];

  const nodes = new Set();
  revealSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => nodes.add(el));
  });

  // Only apply to elements in the main flow (avoid nav/header)
  nodes.forEach(el => {
    if (el.closest('header')) return;
    el.classList.add('cw-reveal');
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('cw-reveal-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  nodes.forEach(el => {
    if (el.closest('header')) return;
    observer.observe(el);
  });

  
  // Staggered reveals (e.g., logo grids)
  const staggerNodes = Array.from(document.querySelectorAll('.cw-stagger'));
  if (staggerNodes.length) {
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('cw-stagger-in');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    staggerNodes.forEach(el => staggerObserver.observe(el));
  }

// Subtle hero parallax for any element tagged with data-parallax
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    const onScroll = () => {
      const y = window.scrollY || 0;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        el.style.transform = `translate3d(0, ${Math.min(24, y * speed)}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
