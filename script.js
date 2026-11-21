(() => {
  const docEl = document.documentElement;
  docEl.classList.add("js-enhanced");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Ano dinâmico no rodapé
  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Cópia de e-mail com transição Text States Swap (transitions-dev)
  const copyButton = document.querySelector(".copy-email");
  const copyLabel = copyButton ? copyButton.querySelector(".t-text-swap") : null;
  const copyStatus = document.querySelector("#copy-status");

  function swapCopyLabel(nextText) {
    if (!copyLabel) return;
    if (reducedMotion) {
      copyLabel.textContent = nextText;
      return;
    }
    const dur =
      parseFloat(
        getComputedStyle(docEl).getPropertyValue("--text-swap-dur")
      ) || 150;
    copyLabel.classList.add("is-exit");
    window.setTimeout(() => {
      copyLabel.textContent = nextText;
      copyLabel.classList.remove("is-exit");
      copyLabel.classList.add("is-enter-start");
      void copyLabel.offsetHeight;
      copyLabel.classList.remove("is-enter-start");
    }, dur);
  }

  if (copyButton && navigator.clipboard && window.isSecureContext) {
    copyButton.hidden = false;
    let resetTimer;
    copyButton.addEventListener("click", async () => {
      window.clearTimeout(resetTimer);
      try {
        await navigator.clipboard.writeText("raulsfr59@gmail.com");
        swapCopyLabel("Copiado");
        if (copyStatus) copyStatus.textContent = "Endereço de e-mail copiado.";
      } catch {
        swapCopyLabel("Tente novamente");
        if (copyStatus) {
          copyStatus.textContent =
            "Não foi possível copiar. Selecione o endereço de e-mail para copiá-lo.";
        }
      }
      resetTimer = window.setTimeout(() => {
        swapCopyLabel("Copiar e-mail");
      }, 3000);
    });
  }

  // Menu mobile acessível
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector("#mobile-nav");

  function setMobileMenu(open) {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute(
      "aria-label",
      open ? "Fechar menu de navegação" : "Abrir menu de navegação"
    );
    mobileNav.hidden = !open;
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMobileMenu(!isOpen);
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMobileMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        menuToggle.getAttribute("aria-expanded") === "true"
      ) {
        setMobileMenu(false);
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 680) setMobileMenu(false);
    });
  }

  // Navegação ativa por seção
  const navLinks = [
    ...document.querySelectorAll(".navigation a, .mobile-nav-inner a[href^='#']"),
  ];
  if ("IntersectionObserver" in window) {
    const sections = new Map();
    navLinks.forEach((link) => {
      if (!link.hash || link.hash === "#contato") return;
      const target = document.querySelector(link.hash);
      if (target) {
        const list = sections.get(target) || [];
        list.push(link);
        sections.set(target, list);
      }
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((item) => item.removeAttribute("aria-current"));
          const matched = sections.get(entry.target) || [];
          matched.forEach((item) =>
            item.setAttribute("aria-current", "location")
          );
        });
      },
      { rootMargin: "-22% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((_, section) => sectionObserver.observe(section));
  }

  // Barra de progresso no header
  let progressTicking = false;
  function updateScrollProgress() {
    progressTicking = false;
    const max = docEl.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    docEl.style.setProperty("--scroll-progress", ratio.toFixed(4));
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!progressTicking) {
        progressTicking = true;
        window.requestAnimationFrame(updateScrollProgress);
      }
    },
    { passive: true }
  );
  updateScrollProgress();

  // Spotlight radial nos cards do portfólio
  const canHoverFine = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  if (canHoverFine && !reducedMotion) {
    document.querySelectorAll(".spotlight-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  }

  // DotGrid interativo em Canvas 2D no Hero (inspirado em react-bits DotGrid)
  const heroSection = document.querySelector(".hero");
  const dotCanvas = document.querySelector(".hero-dotgrid");
  if (heroSection && dotCanvas && dotCanvas.getContext) {
    const ctx = dotCanvas.getContext("2d");
    const pointer = { x: -9999, y: -9999, active: false };
    let pulseOrigin = null;
    let pulseTime = 0;
    let width = 0;
    let height = 0;
    let rafId = null;
    let isVisible = true;
    const gap = 30;
    const proximity = 125;

    function resizeDotGrid() {
      const rect = heroSection.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dotCanvas.width = width * dpr;
      dotCanvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawDotGrid(performance.now());
    }

    function drawDotGrid(now) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const pulseAge = pulseOrigin ? (now - pulseTime) / 700 : 1;
      if (pulseOrigin && pulseAge >= 1) pulseOrigin = null;

      for (let x = 16; x < width; x += gap) {
        for (let y = 16; y < height; y += gap) {
          let energy = 0;
          if (pointer.active) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const dist = Math.hypot(dx, dy);
            if (dist < proximity) {
              energy = 1 - dist / proximity;
              energy = energy * energy;
            }
          }
          if (pulseOrigin) {
            const pd = Math.hypot(x - pulseOrigin.x, y - pulseOrigin.y);
            const ringDist = Math.abs(pd - pulseAge * 260);
            if (ringDist < 38) {
              energy = Math.max(
                energy,
                (1 - ringDist / 38) * (1 - pulseAge) * 0.9
              );
            }
          }
          const radius = 1.15 + energy * 1.45;
          const alpha = 0.16 + energy * 0.52;
          ctx.fillStyle =
            energy > 0.05
              ? `rgba(133, 186, 255, ${alpha.toFixed(3)})`
              : `rgba(148, 174, 214, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reducedMotion && isVisible && (pointer.active || pulseOrigin)) {
        rafId = window.requestAnimationFrame(drawDotGrid);
      } else {
        rafId = null;
      }
    }

    function ensureLoop() {
      if (!reducedMotion && isVisible && rafId === null) {
        rafId = window.requestAnimationFrame(drawDotGrid);
      }
    }

    resizeDotGrid();
    window.addEventListener("resize", resizeDotGrid);

    if (!reducedMotion) {
      heroSection.addEventListener("pointermove", (event) => {
        const rect = heroSection.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
        ensureLoop();
      });

      heroSection.addEventListener("pointerleave", () => {
        pointer.active = false;
        drawDotGrid(performance.now());
      });

      heroSection.addEventListener("click", (event) => {
        if (event.target.closest("a, button")) return;
        const rect = heroSection.getBoundingClientRect();
        pulseOrigin = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        pulseTime = performance.now();
        ensureLoop();
      });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => {
          isVisible = entries[0].isIntersecting;
          if (!isVisible && rafId !== null) {
            window.cancelAnimationFrame(rafId);
            rafId = null;
          }
        }).observe(heroSection);
      }
    }
  }

  // Abas deslizantes na janela interativa do Hero (transitions-dev 16-tabs-sliding)
  const codeTablist = document.querySelector(".code-tabs");
  const codePill = codeTablist
    ? codeTablist.querySelector(".code-tabs-pill")
    : null;
  const codeTabs = codeTablist ? [...codeTablist.querySelectorAll(".code-tab")] : [];
  const codePanels = [...document.querySelectorAll(".code-panel")];
  const codeFilepath = document.querySelector("#code-filepath");

  function moveCodePill(tab, animate) {
    if (!tab || !codePill) return;
    const apply = () => {
      codePill.style.transform = `translateX(${tab.offsetLeft}px)`;
      codePill.style.width = `${tab.offsetWidth}px`;
    };
    if (!animate || reducedMotion) {
      const prev = codePill.style.transition;
      codePill.style.transition = "none";
      apply();
      void codePill.offsetWidth;
      codePill.style.transition = prev;
    } else {
      apply();
    }
  }

  function activateCodeTab(nextTab, shouldFocus = false) {
    const targetId = nextTab.getAttribute("aria-controls");
    const nextFile = nextTab.getAttribute("data-file");
    codeTabs.forEach((tab) => {
      const isMatch = tab === nextTab;
      tab.setAttribute("aria-selected", isMatch ? "true" : "false");
      tab.setAttribute("tabindex", isMatch ? "0" : "-1");
    });

    if (codeFilepath && nextFile) codeFilepath.textContent = nextFile;

    codePanels.forEach((panel) => {
      const isMatch = panel.id === targetId;
      panel.hidden = !isMatch;
      panel.classList.remove("is-entering");
      if (isMatch && !reducedMotion) {
        void panel.offsetWidth;
        panel.classList.add("is-entering");
      }
    });

    moveCodePill(nextTab, true);
    if (shouldFocus) nextTab.focus();
  }

  if (codeTablist && codeTabs.length > 0) {
    const activeCodeTab = () =>
      codeTabs.find((t) => t.getAttribute("aria-selected") === "true") ||
      codeTabs[0];

    codeTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateCodeTab(tab, false));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = null;
        if (event.key === "ArrowRight")
          nextIndex = (index + 1) % codeTabs.length;
        else if (event.key === "ArrowLeft")
          nextIndex = (index - 1 + codeTabs.length) % codeTabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = codeTabs.length - 1;
        if (nextIndex !== null) {
          event.preventDefault();
          activateCodeTab(codeTabs[nextIndex], true);
        }
      });
    });

    const syncCodePill = () => moveCodePill(activeCodeTab(), false);
    window.requestAnimationFrame(syncCodePill);
    window.addEventListener("resize", syncCodePill);
    if ("ResizeObserver" in window) {
      new ResizeObserver(syncCodePill).observe(codeTablist);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncCodePill).catch(() => {});
    }
  }

  // Orquestração GSAP + ScrollTrigger (com guarda de prefers-reduced-motion)
  if (!reducedMotion && typeof window.gsap !== "undefined") {
    const { gsap } = window;
    if (typeof window.ScrollTrigger !== "undefined") {
      gsap.registerPlugin(window.ScrollTrigger);
    }

    const heroItems = document.querySelectorAll("[data-hero-enter]");
    if (heroItems.length > 0) {
      gsap.from(heroItems, {
        y: 16,
        opacity: 0,
        duration: 0.7,
        stagger: 0.075,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    }

    if (typeof window.ScrollTrigger !== "undefined") {
      document.querySelectorAll("[data-reveal]").forEach((sectionEl) => {
        gsap.from(sectionEl, {
          y: 20,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: sectionEl,
            start: "top 88%",
            once: true,
          },
        });
      });

      window.addEventListener("load", () => {
        window.ScrollTrigger.refresh();
      });
    }
  }
})();
