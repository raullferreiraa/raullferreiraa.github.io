const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

const copyButton = document.querySelector(".copy-email");
const copyStatus = document.querySelector("#copy-status");
if (copyButton && navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  let resetTimer;
  copyButton.addEventListener("click", async () => {
    clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText("raulsfr59@gmail.com");
      copyButton.textContent = "Copiado ✓";
      copyStatus.textContent = "Endereço de e-mail copiado.";
    } catch {
      copyButton.textContent = "Tente novamente";
      copyStatus.textContent =
        "Não foi possível copiar. Selecione o endereço de e-mail para copiá-lo.";
    }
    resetTimer = setTimeout(() => {
      copyButton.textContent = "Copiar e-mail";
    }, 3000);
  });
}

const navigationLinks = [...document.querySelectorAll(".navigation a")];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navigationLinks.find(
          (item) => item.hash === `#${entry.target.id}`,
        );
        if (link && entry.isIntersecting) {
          navigationLinks.forEach((item) =>
            item.removeAttribute("aria-current"),
          );
          link.setAttribute("aria-current", "location");
        } else if (link) {
          link.removeAttribute("aria-current");
        }
      });
    },
    { rootMargin: "-15% 0px -60% 0px", threshold: 0 },
  );
  navigationLinks.forEach((link) => {
    const section = document.querySelector(link.hash);
    if (section) observer.observe(section);
  });
}
