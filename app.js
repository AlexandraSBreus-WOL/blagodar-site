const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const toast = document.querySelector("[data-toast]");
const adminList = document.querySelector("[data-admin-list]");

const submissionsKey = "blagodar_submissions";
const formTabIds = ["idea-form", "talent-form", "event-form"];

function updateHeader() {
  header.classList.toggle("scrolled", window.scrollY > 20);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 4200);
}

function getSubmissions() {
  return JSON.parse(localStorage.getItem(submissionsKey) || "[]");
}

function setSubmissions(items) {
  localStorage.setItem(submissionsKey, JSON.stringify(items));
}

function renderAdminList() {
  const items = getSubmissions();
  if (!items.length) {
    adminList.innerHTML = '<div class="admin-item"><strong>Пока заявок нет</strong><span>Отправьте любую форму, и она появится здесь.</span></div>';
    return;
  }
  adminList.innerHTML = items
    .slice()
    .reverse()
    .map(
      (item) => `
        <div class="admin-item">
          <strong>${item.title}</strong>
          <span>${item.type} • ${item.date}</span>
        </div>
      `
    )
    .join("");
}

function collectFormData(form) {
  const data = new FormData(form);
  return Array.from(data.entries()).reduce((acc, [key, value]) => {
    if (value instanceof File) {
      acc[key] = value.name || "Файл не выбран";
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function bindForms() {
  document.querySelectorAll("form[data-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const type = form.dataset.form;
      const data = collectFormData(form);
      const title =
        data.title ||
        data.event ||
        data.talent ||
        (type === "donation" ? `${data.amount || "0"} ₽ через ${data.payment}` : "Новая заявка");
      const submissions = getSubmissions();

      submissions.push({
        type: {
          donation: "Пожертвование",
          idea: "Идея",
          talent: "Талант",
          event: "Мероприятие"
        }[type],
        title,
        date: new Date().toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" }),
        data
      });
      setSubmissions(submissions);
      renderAdminList();

      if (type === "donation") {
        showToast("Спасибо! Вы стали соучастником распространения Евангелия Иисуса Христа.");
      } else if (type === "idea") {
        showToast("Спасибо! Мы рассмотрим вашу инициативу и свяжемся с вами.");
      } else if (type === "event") {
        showToast("Спасибо! Мероприятие отправлено на модерацию.");
      } else {
        showToast("Спасибо! Мы получили информацию о вашем таланте.");
      }

      form.reset();
      document.querySelectorAll("[data-amounts] button").forEach((button) => button.classList.remove("active"));
    });
  });
}

function bindTabs() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activateFormTab(button.dataset.tab, true);
    });
  });
}

function activateFormTab(tabId, shouldScroll) {
  if (!formTabIds.includes(tabId)) return false;

  const tab = document.querySelector(`[data-tab="${tabId}"]`);
  const panel = document.getElementById(tabId);
  if (!tab || !panel) return false;

  document.querySelectorAll("[data-tab]").forEach((item) => item.classList.remove("active"));
  document.querySelectorAll(".form-panel").forEach((item) => item.classList.remove("active"));
  tab.classList.add("active");
  panel.classList.add("active");

  if (shouldScroll) {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return true;
}

function activateFormTabFromHash(shouldScroll) {
  const tabId = window.location.hash.slice(1);
  return activateFormTab(tabId, shouldScroll);
}

function bindFormLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const tabId = link.getAttribute("href").slice(1);
      if (!activateFormTab(tabId, true)) return;

      event.preventDefault();
      if (window.location.hash !== `#${tabId}`) {
        history.pushState(null, "", `#${tabId}`);
      }
    });
  });

  window.addEventListener("hashchange", () => activateFormTabFromHash(true));
  window.setTimeout(() => activateFormTabFromHash(true), 0);
}

function bindAmounts() {
  document.querySelectorAll("[data-amount]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = button.closest("form");
      form.amount.value = button.dataset.amount;
      form.querySelectorAll("[data-amount]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
}

function bindNavigation() {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    document.body.classList.toggle("nav-open", isOpen);
    header.classList.toggle("nav-visible", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.tagName !== "A") return;
    nav.classList.remove("open");
    document.body.classList.remove("nav-open");
    header.classList.remove("nav-visible");
    navToggle.setAttribute("aria-expanded", "false");
  });
}

function bindReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

function loadLazyVideo(video) {
  if (video.dataset.loaded === "true") return;

  video.src = video.dataset.src;
  video.dataset.loaded = "true";
  video.load();

  if (!video.autoplay) return;

  const playRequest = video.play();
  if (playRequest) {
    playRequest.catch(() => {});
  }
}

function bindLazyVideos() {
  const videos = document.querySelectorAll("video[data-lazy-video]");
  if (!videos.length) return;

  if (!("IntersectionObserver" in window)) {
    videos.forEach(loadLazyVideo);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        loadLazyVideo(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "320px 0px", threshold: 0.01 }
  );

  videos.forEach((video) => observer.observe(video));
}

document.querySelector("[data-clear]").addEventListener("click", () => {
  setSubmissions([]);
  renderAdminList();
  showToast("Локальная панель заявок очищена.");
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
bindNavigation();
bindReveal();
bindLazyVideos();
bindForms();
bindTabs();
bindFormLinks();
bindAmounts();
renderAdminList();
