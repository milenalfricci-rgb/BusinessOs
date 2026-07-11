(() => {
  "use strict";

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- custom cursor ---- */
  const cursor = document.getElementById("cursorDot");
  if (cursor && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
    document.querySelectorAll("[data-hover]").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-active"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-active"));
    });
  }

  /* ---- mobile nav ---- */
  const burger = document.getElementById("burgerBtn");
  const nav = document.getElementById("mainNav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- subtle tilt on cards ---- */
  const tiltEls = document.querySelectorAll("[data-tilt]");
  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    tiltEls.forEach((el) => {
      const baseTransform = getComputedStyle(el).transform;
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `rotate(${x * 4}deg) translateY(${y * -6}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---- reveal on scroll ---- */
  const revealTargets = document.querySelectorAll(
    ".work-card, .servico, .depo-card, .stat"
  );
  if ("IntersectionObserver" in window) {
    revealTargets.forEach((el) => (el.style.opacity = "0"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transition = "opacity .5s ease, transform .5s ease";
            entry.target.style.opacity = "1";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => io.observe(el));
  }

  /* ---- contact form -> mailto ---- */
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("nomeInput").value.trim();
      const email = document.getElementById("emailInput").value.trim();
      const mensagem = document.getElementById("mensagemInput").value.trim();

      const subject = encodeURIComponent(`Novo projeto — contato de ${nome}`);
      const body = encodeURIComponent(
        `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`
      );
      window.location.href = `mailto:milenalfricci@gmail.com?subject=${subject}&body=${body}`;
    });
  }
})();
