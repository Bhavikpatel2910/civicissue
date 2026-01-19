const navButtons = document.querySelectorAll(".nav-btn");
const submenuButtons = document.querySelectorAll("[data-submenu]");

let activePage = "dashboard";
let openSubmenu = null;

/* Handle main nav clicks */
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;
    const submenu = btn.dataset.submenu;

    if (page) {
      setActivePage(btn);
      closeAllSubmenus();
    }

    if (submenu) {
      toggleSubmenu(btn);
    }
  });
});

/* Active page */
function setActivePage(activeBtn) {
  navButtons.forEach(b => b.classList.remove("active"));
  activeBtn.classList.add("active");
}

/* Submenu toggle */
function toggleSubmenu(button) {
  const parent = button.closest(".has-submenu");
  const submenu = parent.querySelector(".sub-menu");

  if (openSubmenu && openSubmenu !== submenu) {
    closeAllSubmenus();
  }

  const isOpen = submenu.style.height && submenu.style.height !== "0px";

  if (isOpen) {
    submenu.style.height = "0px";
    button.classList.remove("active");
    openSubmenu = null;
  } else {
    submenu.style.height = submenu.scrollHeight + "px";
    button.classList.add("active");
    openSubmenu = submenu;
  }
}

/* Close all */
function closeAllSubmenus() {
  document.querySelectorAll(".sub-menu").forEach(menu => {
    menu.style.height = "0px";
  });
  submenuButtons.forEach(btn => btn.classList.remove("active"));
  openSubmenu = null;
}
