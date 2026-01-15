document.addEventListener("DOMContentLoaded", () => {

  // Run ONLY on Report Issue page
  if (!location.pathname.includes("ReportIssue")) return;

  /* =============================
     AUTH
  ============================= */
  const sessionRaw = localStorage.getItem("citizenSession");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  if (!session || !session.token) {
    window.location.href = "/civic/html/auth/LoginPage.html";
    return;
  }

  /* =============================
     ELEMENTS
  ============================= */
  const categoryButtons = document.querySelectorAll(".category-grid button");
  const thumbnails = document.querySelector(".thumbnails");
  const previewText = document.querySelector(".preview p");
  const textarea = document.querySelector("textarea");
  const voiceBtn = document.querySelector(".voice");
  const saveDraftBtn = document.querySelector(".ghost");
  const submitBtn = document.querySelector(".primary");
  const backBtn = document.querySelector(".secondary");

  /* =============================
     CATEGORY
  ============================= */
  let selectedCategory = "Pothole";

  categoryButtons.forEach(btn => {
    btn.onclick = () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.innerText.trim();
    };
  });

  /* =============================
     FILE UPLOAD
  ============================= */
  let uploadedFiles = [];

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.multiple = true;

  thumbnails.querySelectorAll(".add").forEach(btn => {
    btn.onclick = () => fileInput.click();
  });

  fileInput.onchange = () => {
    [...fileInput.files].forEach(file => {
      uploadedFiles.push(file);

      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement("div");
        div.className = "thumb active";
        div.style.backgroundImage = `url(${e.target.result})`;
        thumbnails.prepend(div);
        if (previewText) previewText.textContent = file.name;
      };
      reader.readAsDataURL(file);
    });
  };

  /* =============================
     VOICE
  ============================= */
  if ("webkitSpeechRecognition" in window && voiceBtn) {
    const rec = new webkitSpeechRecognition();
    rec.lang = "en-US";
    rec.continuous = false;

    voiceBtn.onclick = () => rec.start();
    rec.onresult = e => {
      textarea.value += " " + e.results[0][0].transcript;
    };
  }

  /* =============================
     GPS
  ============================= */
  let latitude = null;
  let longitude = null;

  navigator.geolocation.getCurrentPosition(
    pos => {
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
      console.log("GPS:", latitude, longitude);
    },
    () => alert("Please allow location access")
  );

  /* =============================
     LOAD DRAFT
  ============================= */
  const draft = JSON.parse(localStorage.getItem("reportDraft") || "{}");

  if (draft.description) textarea.value = draft.description;
  if (draft.category) selectedCategory = draft.category;

  categoryButtons.forEach(btn => {
    btn.classList.toggle("active", btn.innerText.trim() === selectedCategory);
  });

  /* =============================
     SAVE DRAFT
  ============================= */
  saveDraftBtn.onclick = () => {
    localStorage.setItem("reportDraft", JSON.stringify({
      category: selectedCategory,
      description: textarea.value,
      lat: latitude,
      lng: longitude
    }));
    alert("Draft saved");
  };

  /* =============================
     BACK
  ============================= */
  backBtn.onclick = () => {
    window.location.href = "/civic/html/user/UserDashboard.html";
  };

  /* =============================
     SUBMIT
  ============================= */
  let isSubmitting = false;

  submitBtn.onclick = async () => {
    if (isSubmitting) return;

    if (!textarea.value.trim()) return alert("Describe the issue");
    if (!latitude || !longitude) return alert("Location not ready");

    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";

    const form = new FormData();
    form.append("category", selectedCategory);
    form.append("description", textarea.value);
    form.append("lat", latitude);
    form.append("lng", longitude);
    uploadedFiles.forEach(f => form.append("media", f));

    try {
      const res = await fetch("http://localhost:5000/api/report", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + session.token
        },
        body: form
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      localStorage.removeItem("reportDraft");
      alert("Report submitted successfully!");
      localStorage.setItem("lastSubmittedReport", JSON.stringify(data.lastReport));
      window.location.href = "/civic/html/user/ReportSuccess.html";

      window.location.href = "/civic/html/user/CommunityPage.html";


    } catch (err) {
      alert(err.message || "Server error");
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Report";
      isSubmitting = false;
    }
  };

});
