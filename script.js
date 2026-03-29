/*
  Shared interactions for all pages:
  1) Mobile navigation toggle
  2) FAQ accordion behavior
  3) LocalStorage simulation for newsletter and contact forms
*/
(function () {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeIcon = document.querySelector("[data-theme-icon]");
  const moonIcon =
    '<svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M20.7 14.5A8.9 8.9 0 0 1 9.5 3.3a.8.8 0 0 0-1-.9A10.4 10.4 0 1 0 21.6 15.5a.8.8 0 0 0-.9-1z"/></svg>';
  const sunIcon =
    '<svg viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="M12 17.1A5.1 5.1 0 1 1 12 6.9a5.1 5.1 0 0 1 0 10.2zm0-13.3a.9.9 0 0 1 .9.9v1.8a.9.9 0 0 1-1.8 0V4.7a.9.9 0 0 1 .9-.9zm0 13.9a.9.9 0 0 1 .9.9v1.8a.9.9 0 0 1-1.8 0v-1.8a.9.9 0 0 1 .9-.9zM4.7 13a.9.9 0 0 1 0-1.8h1.8a.9.9 0 0 1 0 1.8H4.7zm12.8 0a.9.9 0 0 1 0-1.8h1.8a.9.9 0 0 1 0 1.8h-1.8zM7.3 8.6a.9.9 0 0 1-1.3 0L4.8 7.4a.9.9 0 0 1 1.3-1.3L7.3 7.3a.9.9 0 0 1 0 1.3zm10.6 10.6a.9.9 0 0 1-1.3 0l-1.2-1.2a.9.9 0 0 1 1.3-1.3l1.2 1.2a.9.9 0 0 1 0 1.3zM7.3 15.4a.9.9 0 0 1 0 1.3l-1.2 1.2a.9.9 0 1 1-1.3-1.3L6 15.4a.9.9 0 0 1 1.3 0zm10.6-10.6a.9.9 0 0 1 0 1.3l-1.2 1.2a.9.9 0 1 1-1.3-1.3l1.2-1.2a.9.9 0 0 1 1.3 0z"/></svg>';

  function getCurrentTheme() {
    if (root.getAttribute("data-theme") === "dark") {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme, persist) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }

    if (themeToggle) {
      const nextMode = theme === "dark" ? "light" : "dark";
      themeToggle.setAttribute("aria-label", "Switch to " + nextMode + " mode");
      themeToggle.setAttribute("title", "Switch to " + nextMode + " mode");
    }

    if (themeIcon) {
      themeIcon.innerHTML = theme === "dark" ? sunIcon : moonIcon;
    }

    if (persist) {
      try {
        localStorage.setItem("finch_theme", theme);
      } catch (error) {
        // Ignore storage write errors.
      }
    }
  }

  if (themeToggle) {
    let initialTheme = getCurrentTheme();
    try {
      const savedTheme = localStorage.getItem("finch_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        initialTheme = savedTheme;
      }
    } catch (error) {
      // Ignore storage read errors and use current theme.
    }

    applyTheme(initialTheme, false);

    themeToggle.addEventListener("click", function () {
      const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
      applyTheme(nextTheme, true);
    });
  }

  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Accessible FAQ accordion using button + hidden panel
  const faqButtons = document.querySelectorAll(".faq-question");
  faqButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      if (panel) {
        panel.hidden = expanded;
      }
    });
  });

  // Simulate form submission by saving payloads to localStorage
  const forms = document.querySelectorAll("[data-storage-form]");
  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const formType = form.getAttribute("data-storage-form");
      const storageKey = "finch_form_" + formType;
      // Status target can live inside the form or as the next status element sibling.
      const output =
        form.querySelector("[data-form-status]") ||
        form.parentElement.querySelector("[data-form-status]");
      const formData = new FormData(form);
      const payload = {
        submittedAt: new Date().toISOString()
      };

      formData.forEach(function (value, key) {
        payload[key] = String(value).trim();
      });

      const email = payload.email || "";
      const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (Object.values(payload).some(function (value) { return value === ""; }) || !emailIsValid) {
        if (output) {
          output.textContent = "Please enter a valid email address.";
        }
        return;
      }

      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existing.push(payload);
      localStorage.setItem(storageKey, JSON.stringify(existing));

      form.reset();
      if (output) {
        output.textContent = "Thanks. Your details were saved locally for demo purposes.";
      }
    });
  });
})();
