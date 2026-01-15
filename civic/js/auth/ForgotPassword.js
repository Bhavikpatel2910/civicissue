const form = document.getElementById("forgotForm");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");

const submitBtn = document.getElementById("submitBtn");
const spinner = submitBtn.querySelector(".spinner");
const btnText = submitBtn.querySelector(".btn-text");

let step = "email";   // email → password
let verifiedEmail = "";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  emailError.textContent = "";

  const value = emailInput.value.trim();
  if (!value) {
    emailError.textContent = "Required";
    return;
  }

  submitBtn.disabled = true;
  spinner.classList.remove("hidden");

  // STEP 1 — Verify email
  if (step === "email") {
    try {
      const res = await fetch("http://localhost:5000/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value })
      });

      const data = await res.json();

      if (!res.ok) {
        emailError.textContent = data.message;
      } else {
        verifiedEmail = value;
        emailInput.value = "";
        emailInput.type = "password";
        emailInput.placeholder = "Enter New Password";
        btnText.textContent = "Reset Password";
        step = "password";
      }
    } catch {
      alert("Server not reachable");
    }
  }

  // STEP 2 — Reset password
  else {
    if (value.length < 6) {
      emailError.textContent = "Min 6 characters";
    } else {
      try {
        const res = await fetch("http://localhost:5000/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: verifiedEmail,
            newPassword: value
          })
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
          window.location.href = "/civic/html/auth/LoginPage.html";
        }
      } catch {
        alert("Server not reachable");
      }
    }
  }

  submitBtn.disabled = false;
  spinner.classList.add("hidden");
});
