// Load header component
fetch("/TEAM-SPARK/civic/components/header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header-root").innerHTML = html;
    initHeader();
  });

function initHeader() {

  // Dropdown toggle
  document.querySelectorAll("[data-dropdown]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const parent = btn.closest(".dropdown");
      document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
      parent.classList.toggle("open");
    });
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
  });

  // Active page highlight
  const current = location.pathname;
  document.querySelectorAll(".top-nav a").forEach(link => {
    if (current.includes(link.getAttribute("href"))) {
      link.classList.add("active");
    }
  });
}
