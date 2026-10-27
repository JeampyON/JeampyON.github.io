const themeToggle = document.querySelector(".theme-toggle");
const currentYear = document.querySelector("#current-year");
const themeColor = document.querySelector('meta[name="theme-color"]');
const themeStorageKey = "jeampyon-theme";
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#site-search");
const searchResults = document.querySelector(".search-results");
const projectCards = [...document.querySelectorAll(".project-card")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const projectDialog = document.querySelector(".project-dialog");
const dialogContents = [...document.querySelectorAll("[data-project-details]")];
const dialogClose = document.querySelector(".dialog-close");
const navLinks = [...document.querySelectorAll(".nav-link")];
let activeFilter = "all";

const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  const isLight = theme === "light";

  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute(
    "aria-label",
    isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro",
  );
  themeToggle.querySelector(".theme-label").textContent = isLight
    ? "Tema oscuro"
    : "Tema claro";
  themeColor.setAttribute("content", isLight ? "#f5f7f4" : "#101713");
};

const savedTheme =
  localStorage.getItem(themeStorageKey) || localStorage.getItem("marlon-ortiz-theme");
if (savedTheme === "light" || savedTheme === "dark") {
  setTheme(savedTheme);
}

themeToggle.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";

  setTheme(nextTheme);
  localStorage.setItem(themeStorageKey, nextTheme);
});

currentYear.textContent = String(new Date().getFullYear());

const setActiveNav = (hash) => {
  navLinks.forEach((link) => {
    const isActive = link.hash === hash;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const initialNavLink = navLinks.find((link) => link.hash === window.location.hash);
setActiveNav(initialNavLink ? initialNavLink.hash : "#inicio");

navLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveNav(link.hash));
});

const navObserver = new IntersectionObserver(
  (entries) => {
    const currentSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

    if (currentSection) {
      setActiveNav(`#${currentSection.target.id}`);
    }
  },
  { rootMargin: "-25% 0px -65% 0px" },
);

navLinks.forEach((link) => {
  const section = document.querySelector(link.hash);
  if (section) {
    navObserver.observe(section);
  }
});

const normalizeText = (text) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const updateProjects = () => {
  const query = normalizeText(searchInput.value.trim());
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const matchesCategory =
      activeFilter === "all" || card.dataset.category.split(" ").includes(activeFilter);
    const matchesQuery = normalizeText(card.textContent).includes(query);
    const isVisible = matchesCategory && matchesQuery;

    card.hidden = !isVisible;
    visibleCount += Number(isVisible);
  });

  searchResults.textContent =
    visibleCount === 0
      ? "No se encontraron proyectos con esos criterios."
      : `Mostrando ${visibleCount} ${visibleCount === 1 ? "proyecto" : "proyectos"}.`;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateProjects();
});

searchInput.addEventListener("input", updateProjects);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    updateProjects();
  });
});

document.querySelectorAll(".category-list [data-filter]").forEach((link) => {
  link.addEventListener("click", () => {
    activeFilter = link.dataset.filter;
    updateProjects();
  });
});

document.querySelectorAll(".project-open").forEach((button) => {
  button.addEventListener("click", () => {
    const project = button.dataset.project;
    const selectedContent = dialogContents.find(
      (content) => content.dataset.projectDetails === project,
    );

    if (!selectedContent) {
      return;
    }

    dialogContents.forEach((content) => {
      content.hidden = content !== selectedContent;
    });
    projectDialog.setAttribute("aria-labelledby", `dialog-title-${project}`);
    projectDialog.showModal();
  });
});

dialogClose.addEventListener("click", () => projectDialog.close());

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && projectDialog.open) {
    event.preventDefault();
    projectDialog.close();
  }
});

projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) {
    projectDialog.close();
  }
});

updateProjects();
