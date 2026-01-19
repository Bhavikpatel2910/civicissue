/* =====================================================
   INVITE NEW STAFF MEMBER – SMART CITY ADMIN (FINAL)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     AUTH CHECK
  =============================== */
  const session = JSON.parse(localStorage.getItem("citizenSession") || "null");

  // if (!session || session.role !== "admin" || !session.token) {
  //   window.location.replace("/civic/html/auth/adminLogin.html");
  //   return;
  // }

  const TOKEN = session.token;

  /* ===============================
     ELEMENTS
  =============================== */
  const steps = document.querySelectorAll(".step");
  const nextBtn = document.getElementById("nextBtn");
  const backBtn = document.getElementById("backBtn");

  const nameInput = document.getElementById("nameInput");
  const empIdInput = document.getElementById("empIdInput");
  const emailInput = document.getElementById("emailInput");
  const emailError = document.getElementById("emailError");
  const photoInput = document.getElementById("photoInput");
  const departmentSelect = document.getElementById("departmentSelect");

  const previewName = document.getElementById("previewName");
  const previewEmpId = document.getElementById("previewEmpId");
  const photoPreview = document.getElementById("photoPreview");
  const qrContainer = document.getElementById("qrCode");

  const toastContainer = document.getElementById("toastContainer");

  let currentStep = 0;

  /* ===============================
     INIT
  =============================== */
  generateEmployeeId();
  updateStep();

  /* ===============================
     HELPERS
  =============================== */
  function updateStep() {
    steps.forEach((step, i) => {
      step.style.display = i === currentStep ? "block" : "none";
    });

    backBtn.style.display = currentStep === 0 ? "none" : "inline-block";
    nextBtn.textContent =
      currentStep === steps.length - 1 ? "Finish" : "Next";
  }

  function generateEmployeeId() {
    const id = "EMP-" + Math.floor(100000 + Math.random() * 900000);
    empIdInput.value = id;
    previewEmpId.textContent = id;
  }

  function generateEmail(name) {
    return (
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z\s]/g, "")
        .replace(/\s+/g, ".") + "@smartcity.gov"
    );
  }

  function showToast(msg, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function generateQR(data) {
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, { text: data, width: 120, height: 120 });
  }

  /* ===============================
     NEXT / BACK
  =============================== */
  nextBtn.addEventListener("click", async () => {

    // STEP 1
    if (currentStep === 0) {
      if (!nameInput.value.trim()) {
        showToast("Name is required", "error");
        return;
      }

      emailInput.value = generateEmail(nameInput.value);
      previewName.textContent = nameInput.value;
      generateQR(empIdInput.value);
    }

    // STEP 2
    if (currentStep === 1) {
      if (!departmentSelect.value) {
        showToast("Please select a department", "error");
        return;
      }
    }

    // FINAL STEP
    if (currentStep === steps.length - 1) {
      try {
        const res = await fetch(
          "http://localhost:5000/api/admin/staff/invite",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
              name: nameInput.value.trim(),
              empId: empIdInput.value,
              email: emailInput.value.trim(),
              department: departmentSelect.value,
              photo: photoPreview.src || ""
            })
          }
        );

        const data = await res.json();
        if (!res.ok) {
          showToast(data.message || "Invite failed", "error");
          return;
        }

        showToast("Staff invited successfully");
        setTimeout(() => {
          window.location.href = "/civic/html/admin/staf&userpage.html";
        }, 1200);

      } catch {
        showToast("Server error", "error");
      }
      return;
    }

    currentStep++;
    updateStep();
  });

  backBtn.addEventListener("click", () => {
    currentStep--;
    updateStep();
  });

  /* ===============================
     PHOTO PREVIEW
  =============================== */
  photoInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast("Image too large (max 1MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => (photoPreview.src = reader.result);
    reader.readAsDataURL(file);
  });

  /* ===============================
     EMAIL VALIDATION
  =============================== */
  emailInput.addEventListener("input", () => {
    emailError.textContent =
      emailInput.value.endsWith("@smartcity.gov") ? "" : "Invalid work email";
  });

  console.log(" Invite Staff module loaded");
});
