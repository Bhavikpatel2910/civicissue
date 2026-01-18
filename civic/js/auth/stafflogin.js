document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://localhost:5000/api/auth";

  const form = document.getElementById("staffLoginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const togglePassword = document.getElementById("togglePassword");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const spinner = submitBtn.querySelector(".spinner");

  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  /* ======================
     PASSWORD TOGGLE
  ====================== */
  togglePassword.addEventListener("click", () => {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
    togglePassword.textContent =
      passwordInput.type === "password" ? "👁" : "🙈";
  });

  /* ======================
     LOGIN
  ====================== */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    emailError.textContent = "";
    passwordError.textContent = "";

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email.endsWith(".gov")) {
      emailError.textContent = "Only .gov email addresses allowed";
      return;
    }

    submitBtn.disabled = true;
    btnText.textContent = "Signing in...";
    spinner.classList.remove("hidden");

    try {
      const res = await fetch(`${API_BASE}/staff/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        submitBtn.disabled = false;
        btnText.textContent = "Log In";
        spinner.classList.add("hidden");
        return;
      }

      // Save staff session
      localStorage.setItem("staffSession", JSON.stringify({
        token: data.token,
        role: data.role,
        name: data.name,
        lastActive: Date.now()
      }));

      // Redirect to staff dashboard
      window.location.href = "/civic/html/staff/StaffDashboard.html";

    } catch (err) {
      alert("Server not reachable");
      submitBtn.disabled = false;
      btnText.textContent = "Log In";
      spinner.classList.add("hidden");
    }
  });

});
