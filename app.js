const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const processTrack = document.querySelector(".process-track");
const tiltTarget = document.querySelector("[data-tilt]");
const form = document.querySelector("[data-check-form]");
const formStatus = document.querySelector("[data-form-status]");
const root = document.documentElement;

const finishIntro = () => {
  root.classList.add("intro-complete");
  try {
    sessionStorage.setItem("cybermenIntroSeenV2", "true");
  } catch (error) {
    // Storage can be blocked; the page should still reveal normally.
  }
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (root.dataset.intro === "play" && !prefersReducedMotion) {
  window.setTimeout(finishIntro, 1550);
} else {
  finishIntro();
}

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

if (navToggle && nav) {
  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNav();
    }
  });

  window.addEventListener("hashchange", closeNav);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px 8% 0px" },
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 6, 4) * 55}ms`;
  revealObserver.observe(item);
});

if (processTrack) {
  const processObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        processTrack.classList.add("is-visible");
        processObserver.disconnect();
      }
    },
    { threshold: 0.3 },
  );
  processObserver.observe(processTrack);
}

if (tiltTarget && window.matchMedia("(hover: hover)").matches) {
  tiltTarget.addEventListener("pointermove", (event) => {
    const rect = tiltTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tiltTarget.style.transform = `rotateX(${y * -3}deg) rotateY(${x * 4}deg)`;
    tiltTarget.style.setProperty("--shine", `${0.68 + Math.abs(x) * 0.4}`);
  });

  tiltTarget.addEventListener("pointerleave", () => {
    tiltTarget.style.transform = "";
    tiltTarget.style.removeProperty("--shine");
  });
}

if (form && formStatus) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    nav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open navigation");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonContent = submitButton?.innerHTML;
    const data = new FormData(form);
    const name = String(data.get("fullName") || "there").trim().split(" ")[0] || "there";

    form.classList.remove("has-submitted", "has-error");
    form.classList.add("is-sending");
    formStatus.textContent = "Sending your website review request...";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = "Sending...";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Formspree submission failed");
      }

      form.reset();
      form.classList.add("has-submitted");
      formStatus.textContent = `Thanks ${name}. Your website review request has been sent.`;
    } catch (error) {
      form.classList.add("has-error");
      formStatus.textContent = "Sorry, the form could not send. Please email info@cybermen.co.uk.";
    } finally {
      form.classList.remove("is-sending");
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonContent;
      }
    }
  });
}
