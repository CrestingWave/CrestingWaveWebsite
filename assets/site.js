(() => {
  // Hamburger dropdown: explicit JS control + overlay so one click anywhere closes it.
  const navCheck = document.getElementById("nav-check");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  const getOverlay = () => document.getElementById("cw-nav-overlay");

  const ensureOverlay = () => {
    let ov = getOverlay();
    if (ov) return ov;
    ov = document.createElement("div");
    ov.id = "cw-nav-overlay";
    ov.setAttribute("aria-hidden", "true");
    document.body.appendChild(ov);

    const closeAndEat = (e) => {
      // Close the menu and stop the click from doing anything else.
      if (navCheck) navCheck.checked = false;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      }
      ov.remove();
    };

    // Capture both pointerdown and click to work across devices.
    ov.addEventListener("pointerdown", closeAndEat, { capture: true });
    ov.addEventListener("click", closeAndEat, { capture: true });

    return ov;
  };

  const open = () => {
    if (!navCheck) return;
    navCheck.checked = true;
    ensureOverlay();
  };

  const close = () => {
    if (navCheck) navCheck.checked = false;
    const ov = getOverlay();
    if (ov) ov.remove();
  };


  // HARD outside-click close (capture): first click anywhere outside the menu closes it and is swallowed.
  const outside = (t) => !(t.closest(".nav-toggle") || t.closest(".navlinks"));
  const swallowClose = (e) => {
    if (!navCheck || !navCheck.checked) return;
    if (!outside(e.target)) return;
    close();
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
  };
  document.addEventListener("pointerdown", swallowClose, true);
  document.addEventListener("click", swallowClose, true);

  if (navCheck && toggle) {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navCheck.checked ? close() : open();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navCheck.checked) close();
    });

    // Close when any nav link is clicked
    if (nav) {
      nav.addEventListener("click", (e) => {
        const a = e.target.closest("a");
        if (a) close();
      });
    }

    // Keep overlay synced even if checkbox is toggled by something else
    navCheck.addEventListener("change", () => {
      if (navCheck.checked) ensureOverlay();
      else close();
    });
  }

  // Active link highlight
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".navlinks a").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) a.classList.add("active");
    if (path === "" && href === "index.html") a.classList.add("active");
  });
})();
(() => {
  // Scroll reveal (safe, no dependencies)
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const selectors = [".card",".process-card",".team-card",".person-card",".focus-card",".hero h1",".hero h2","h2",".btn"];
  const nodes = new Set();
  selectors.forEach((sel) => document.querySelectorAll(sel).forEach((el) => nodes.add(el)));

  nodes.forEach((el) => {
    if (el.closest("header")) return;
    el.classList.add("cw-reveal");
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      requestAnimationFrame(() => entry.target.classList.add("cw-reveal-in"));
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  nodes.forEach((el) => observer.observe(el));
})();

(() => {
  // GA4 click tracking for primary actions and links marked with data-track.
  const canTrack = () => typeof window.gtag === "function";
  const DEFAULT_EVENT = "cta_click";

  const normalizeEventName = (value) => {
    if (!value) return DEFAULT_EVENT;
    const normalized = String(value)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 40);

    if (!normalized) return DEFAULT_EVENT;
    if (!/^[a-z]/.test(normalized)) return `evt_${normalized}`.slice(0, 40);
    return normalized;
  };

  const getEventName = (el) => {
    const custom = el.getAttribute("data-track-event");
    if (custom) return normalizeEventName(custom);
    if (el.matches("a[href^='mailto:']")) return "contact_click";
    if (el.matches("a[href*='calendly.com']")) return "book_time_click";
    return DEFAULT_EVENT;
  };

  const getEventData = (el) => {
    const href = el.getAttribute("href") || "";
    const text = (el.getAttribute("data-track-label") || el.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);

    return {
      click_text: text,
      click_target: href,
      click_id: el.id || "",
      click_classes: el.className || "",
      page_path: location.pathname
    };
  };

  document.addEventListener("click", (e) => {
    const target = e.target.closest(
      "[data-track], .btn, .split-cta, .footer-linkedin, a[href^='mailto:'], a[href*='calendly.com']"
    );
    if (!target || !canTrack()) return;
    window.gtag("event", getEventName(target), getEventData(target));
  });
})();
