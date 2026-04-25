const root = document.documentElement;
const header = document.getElementById("site-header");
const progressBar = document.getElementById("scroll-progress");
const themeToggle = document.getElementById("theme-toggle");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const backToTop = document.getElementById("back-to-top");
const toast = document.getElementById("toast");
const typingTarget = document.getElementById("typing-text");
const form = document.getElementById("contact-form");
const navLinks = [...document.querySelectorAll(".nav-link, .mobile-nav-link")];
const sections = [...document.querySelectorAll("main section[id]")].filter(
  (section) => !section.hasAttribute("data-navless")
);
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const counterItems = [...document.querySelectorAll("[data-counter-target]")];
const tiltCards = [...document.querySelectorAll("[data-tilt]")];
const placeholderButtons = [...document.querySelectorAll("[data-placeholder]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let toastTimeout = null;
let typingTimeout = null;

const typingWords = [
  "responsive web experiences.",
  "full stack projects with clean UI.",
  "AI-aware product ideas.",
  "recruiter-ready portfolio work."
];

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  const icon = themeToggle?.querySelector("i");

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(theme === "light"));
  }

  if (icon) {
    icon.className = theme === "light" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");
  applyTheme(savedTheme || "dark");

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem("portfolio-theme", nextTheme);
  });
}

function toggleMobileMenu(forceState) {
  if (!mobileMenu || !menuToggle) return;

  const willOpen =
    typeof forceState === "boolean" ? forceState : mobileMenu.hasAttribute("hidden");

  if (willOpen) {
    mobileMenu.removeAttribute("hidden");
  } else {
    mobileMenu.setAttribute("hidden", "");
  }

  menuToggle.setAttribute("aria-expanded", String(willOpen));
  const icon = menuToggle.querySelector("i");
  if (icon) {
    icon.className = willOpen ? "bi bi-x-lg" : "bi bi-list";
  }
}

function initMenu() {
  menuToggle?.addEventListener("click", () => toggleMobileMenu());

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 1024) {
        toggleMobileMenu(false);
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      toggleMobileMenu(false);
    }
  });
}

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (header) {
    header.classList.toggle("scrolled", scrollTop > 20);
  }

  if (backToTop) {
    backToTop.classList.toggle("is-visible", scrollTop > 500);
  }
}

function setActiveLink(id) {
  navLinks.forEach((link) => {
    const isMatch = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isMatch && link.classList.contains("nav-link"));
  });
}

function initSectionObserver() {
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSection = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleSection?.target?.id) {
        setActiveLink(visibleSection.target.id);
      }
    },
    {
      threshold: [0.2, 0.4, 0.6],
      rootMargin: "-25% 0px -40% 0px"
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function initTyping() {
  if (!typingTarget) return;

  if (reducedMotion) {
    typingTarget.textContent = typingWords[0];
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const currentWord = typingWords[wordIndex];
    typingTarget.textContent = currentWord.slice(0, charIndex);

    if (!deleting && charIndex < currentWord.length) {
      charIndex += 1;
      typingTimeout = window.setTimeout(tick, 75);
      return;
    }

    if (!deleting && charIndex === currentWord.length) {
      deleting = true;
      typingTimeout = window.setTimeout(tick, 1300);
      return;
    }

    if (deleting && charIndex > 0) {
      charIndex -= 1;
      typingTimeout = window.setTimeout(tick, 42);
      return;
    }

    deleting = false;
    wordIndex = (wordIndex + 1) % typingWords.length;
    typingTimeout = window.setTimeout(tick, 280);
  };

  tick();
}

function animateCounter(item) {
  const target = Number(item.dataset.counterTarget);
  const duration = 1300;
  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    item.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      item.textContent = target;
    }
  };

  requestAnimationFrame(step);
}

function initCounters() {
  if (!counterItems.length) return;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    counterItems.forEach((item) => {
      item.textContent = item.dataset.counterTarget;
    });
    return;
  }

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counterItems.forEach((item) => counterObserver.observe(item));
}

function initTilt() {
  if (reducedMotion) return;

  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (window.innerWidth < 1024) return;

      const rect = card.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;
      const rotateY = (relativeX - 0.5) * 10;
      const rotateX = (0.5 - relativeY) * 8;

      card.style.setProperty("--rotate-x", `${rotateX}deg`);
      card.style.setProperty("--rotate-y", `${rotateY}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rotate-x", "0deg");
      card.style.setProperty("--rotate-y", "0deg");
    });
  });
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");

  if (toastTimeout) {
    window.clearTimeout(toastTimeout);
  }

  toastTimeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function initPlaceholderButtons() {
  placeholderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showToast(button.dataset.placeholder || "Update this link when you are ready.");
    });
  });
}

function initForm() {
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    form.reset();
    showToast("Static demo only. Connect this form to Formspree or Netlify Forms for real messages.");
  });
}

function initBackToTop() {
  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("load", updateScrollUI);

initTheme();
initMenu();
initSectionObserver();
initTyping();
initCounters();
initTilt();
initPlaceholderButtons();
initForm();
initBackToTop();
updateScrollUI();

window.addEventListener("beforeunload", () => {
  if (typingTimeout) {
    window.clearTimeout(typingTimeout);
  }
  if (toastTimeout) {
    window.clearTimeout(toastTimeout);
  }
});
