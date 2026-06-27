const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const toast = document.querySelector("[data-toast]");
const adminList = document.querySelector("[data-admin-list]");

const submissionsKey = "blagodar_submissions";
const testimonials = [
  {
    name: "Анна",
    city: "Казань",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
    story: "Я пришла с идеей медиа-проекта, а нашла команду, молитвенную поддержку и понятный план запуска."
  },
  {
    name: "Михаил",
    city: "Москва",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
    story: "Через Blagodar мы закрыли часть бюджета поездки и смогли провести евангелизационные встречи в малых городах."
  },
  {
    name: "Мария",
    city: "Санкт-Петербург",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
    story: "Мой навык дизайна впервые стал настоящим служением: я помогала оформлять материалы для конференции."
  },
  {
    name: "Даниил",
    city: "Екатеринбург",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
    story: "Мне было важно найти людей с тем же сердцем. Здесь идеи быстро превращаются в конкретные шаги."
  },
  {
    name: "Елена",
    city: "Самара",
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=240&q=80",
    story: "Мы анонсировали молитвенную встречу и получили новых участников из соседних церквей."
  },
  {
    name: "Артём",
    city: "Новосибирск",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80",
    story: "Регулярная поддержка миссионеров стала для нашей семьи практичным способом быть частью Великого Поручения."
  }
];

let testimonialIndex = 0;

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
      document.querySelectorAll("[data-tab]").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll(".form-panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
      document.getElementById(button.dataset.tab).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
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

function renderTestimonials() {
  const track = document.querySelector("[data-track]");
  const visible = testimonials.slice(testimonialIndex, testimonialIndex + 3);
  const cards = visible.length === 3 ? visible : [...visible, ...testimonials.slice(0, 3 - visible.length)];
  track.innerHTML = cards
    .map(
      (item) => `
        <article class="testimonial">
          <img src="${item.photo}" alt="${item.name}" />
          <h3>${item.name}</h3>
          <p><strong>${item.city}</strong></p>
          <p>${item.story}</p>
        </article>
      `
    )
    .join("");
}

function bindCarousel() {
  document.querySelector("[data-next]").addEventListener("click", () => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    renderTestimonials();
  });
  document.querySelector("[data-prev]").addEventListener("click", () => {
    testimonialIndex = (testimonialIndex - 1 + testimonials.length) % testimonials.length;
    renderTestimonials();
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

document.querySelector("[data-clear]").addEventListener("click", () => {
  setSubmissions([]);
  renderAdminList();
  showToast("Локальная панель заявок очищена.");
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();
bindNavigation();
bindReveal();
bindForms();
bindTabs();
bindAmounts();
bindCarousel();
renderTestimonials();
renderAdminList();
