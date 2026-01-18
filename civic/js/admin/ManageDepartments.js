/* =====================================================
   MANAGE DEPARTMENTS – CIVIC ADMIN (FINAL)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     AUTH CHECK
  =============================== */
  let session = null;

  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {
    session = null;
  }


  const TOKEN = session.token;
  const API_BASE = "http://localhost:5000/api/admin";

  /* ===============================
     ELEMENTS
  =============================== */
  const deptGrid = document.querySelector(".dept-grid");
  const newDeptBtn = document.querySelector(".new-dept");
  const backBtn = document.getElementById("backBtn");
  const searchInput = document.querySelector(".top-actions input");

  if (!deptGrid) {
    console.warn("Department grid not found");
    return;
  }

  let departments = [];

  /* ===============================
     LOAD DEPARTMENTS
  =============================== */
  async function loadDepartments() {
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem("citizenSession");
        window.location.replace("/civic/html/auth/adminLogin.html");
        return;
      }

      if (!res.ok) throw new Error("Failed to load departments");

      departments = await res.json();
      renderDepartments(departments);

    } catch (err) {
      console.error("LOAD DEPARTMENTS ERROR:", err);
      deptGrid.innerHTML = "<p>Failed to load departments</p>";
    }
  }

  /* ===============================
     RENDER DEPARTMENTS
  =============================== */
  function renderDepartments(data) {
    deptGrid.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      deptGrid.innerHTML = "<p>No departments found.</p>";
      return;
    }

    data.forEach(dept => {
      const card = document.createElement("div");
      card.className = "dept-card";

      card.innerHTML = `
        <h3>${dept.name}</h3>
        <p class="code">${dept.code}</p>

        <div class="meta">
          <span>Active Staff</span>
          <strong>${dept.staffCount ?? 0}</strong>
        </div>

        <div class="meta">
          <span>Open Issues</span>
          <strong>${dept.openIssues ?? 0}</strong>
        </div>

        <button class="manage-btn" data-id="${dept._id}">
          Manage
        </button>
      `;

      deptGrid.appendChild(card);
    });

    attachManageHandlers();
  }

  /* ===============================
     MANAGE BUTTON
  =============================== */
  function attachManageHandlers() {
    document.querySelectorAll(".manage-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        window.location.href =
          `/civic/html/admin/department-settings.html?id=${id}`;
      });
    });
  }

  /* ===============================
     CREATE NEW DEPARTMENT
  =============================== */
  newDeptBtn?.addEventListener("click", async () => {
    const name = prompt("Enter Department Name:");
    if (!name) return;

    const code = prompt("Enter Department Code:");
    if (!code) return;

    try {
      const res = await fetch(`${API_BASE}/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify({ name, code })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create department");
        return;
      }

      departments.push(data.department);
      renderDepartments(departments);

      alert("Department created successfully");

    } catch (err) {
      console.error("CREATE DEPT ERROR:", err);
      alert("Server error while creating department");
    }
  });

  /* ===============================
     BACK BUTTON
  =============================== */
  backBtn?.addEventListener("click", () => {
    window.location.href = "/civic/html/admin/AdminDashboard.html";
  });

  /* ===============================
     SEARCH FILTER
  =============================== */
  searchInput?.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    const filtered = departments.filter(d =>
      d.name.toLowerCase().includes(value) ||
      d.code.toLowerCase().includes(value)
    );

    renderDepartments(filtered);
  });

  /* ===============================
     INIT
  =============================== */
  loadDepartments();

  console.log("Manage Departments Admin JS Loaded Successfully");
});
