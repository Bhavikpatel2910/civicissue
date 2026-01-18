document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("staffForm");

  if (!form) {
    console.error("Staff form not found");
    return;
  }

  /* =========================
     ELEMENTS
  ========================= */
  const nameInput = document.getElementById("fullName");
  const departmentInput = document.getElementById("department");
  const emailInput = document.getElementById("email");
  const empIdInput = document.getElementById("employeeId");
  const passwordInput = document.getElementById("password");
  const termsCheckbox = document.getElementById("terms");

  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn?.querySelector(".btn-text");

  /* =========================
     CONFIG
  ========================= */
  const API_URL = "http://localhost:5000/api/staff/register";

  let isSubmitting = false;

  /* =========================
     FORM SUBMIT
  ========================= */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const name = nameInput?.value.trim();
    const department = departmentInput?.value.trim();
    const email = emailInput?.value.trim().toLowerCase();
    const empId = empIdInput?.value.trim(); // MUST match schema
    const password = passwordInput?.value.trim();

    /* =========================
       VALIDATION
    ========================= */
    if (!name || !department || !email || !empId || !password) {
      alert("All fields are required");
      return;
    }

    if (!email.endsWith(".gov")) {
      alert("Only .gov email addresses are allowed");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (!termsCheckbox?.checked) {
      alert("You must accept the terms");
      return;
    }

    /* =========================
       SUBMIT
    ========================= */
    isSubmitting = true;
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = "Submitting...";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          department,
          empId //  EXACT MATCH with Staff schema
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        alert(data.message || `Registration failed (${res.status})`);
        return;
      }

      alert("Staff registration submitted.\nAwait admin approval.");
      window.location.replace("/civic/html/auth/index.html");

      form.reset();

    } catch (err) {
      console.error("STAFF REGISTER ERROR:", err);
      alert("Server not reachable. Please try again later.");
    } finally {
      isSubmitting = false;
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = "Verify Identity";
    }
  });
});
