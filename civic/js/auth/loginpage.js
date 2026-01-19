document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
  ========================= */
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const form = document.getElementById("loginForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn?.querySelector(".btn-text");
  const ssoLink = document.getElementById("ssoLink");
  const adminBtn = document.getElementById("adminLoginBtn");

  const API_BASE = "http://localhost:5000/api";

  let activeRole = "citizen";

  /* =========================
     ROLE SWITCH
  ========================= */
  document.querySelectorAll(".role").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".role").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      activeRole = btn.dataset.role;

      // Show SSO info for staff
      if (ssoLink) {
        ssoLink.style.display = activeRole === "staff" ? "block" : "none";
      }
    });
  });

  /* =========================
     LOGIN SUBMIT
  ========================= */
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      /*  STAFF → REDIRECT (NO LOGIN HERE) */
      if (activeRole === "staff") {
        window.location.href = "/civic/html/auth/staffRegister.html";
        return;
      }

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        alert("Email and password required");
        return;
      }

      submitBtn.disabled = true;
      if (btnText) btnText.textContent = "Signing in...";

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: email,
            password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Login failed");
          submitBtn.disabled = false;
          if (btnText) btnText.textContent = "Sign In";
          return;
        }

        /* =========================
           SAVE SESSION
        ========================= */
        localStorage.setItem("citizenSession", JSON.stringify({
          token: data.token,
          role: data.role,
          name: data.name,
          lastActive: Date.now()
        }));

        const role = (data.role || "").toLowerCase();

        /* =========================
           REDIRECT
        ========================= */
        if (role === "admin" || role === "staff") {
          window.location.href = "/civic/html/admin/AdminDashboard.html";
        } else {
          window.location.href = "/civic/html/user/UserDashboard.html";
        }

      } catch (err) {
        alert("Server not reachable");
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = "Sign In";
      }
    });
  }

  /* =========================
     ADMIN LOGIN BUTTON
  ========================= */
  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      window.location.href = "/civic/html/auth/adminLogin.html";
    });
  }

});
