document.addEventListener("DOMContentLoaded", () => {

  /* ================================
     RUN ONLY ON ReportIssue PAGE
  ================================= */
  if (!location.pathname.toLowerCase().includes("reportissue")) return;

  /* ================================
     CONFIG  FIXED
  ================================= */
  const API_BASE = "http://localhost:5000/api";

  function redirectToLogin() {
    window.location.replace("/civic/html/auth/index.html");
  }

  /* ================================
     AUTH CHECK
  ================================= */
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {
    session = null;
  }

  if (!session || !session.token) {
    redirectToLogin();
    return;
  }

  /* ================================
     ELEMENTS
  ================================= */
  const categoryButtons = document.querySelectorAll(".category-grid button");
  const thumbnails = document.querySelector(".thumbnails");
  const previewText = document.querySelector(".preview p");
  const textarea = document.querySelector("textarea");
  const voiceBtn = document.querySelector(".voice");
  const saveDraftBtn = document.querySelector(".ghost");
  const submitBtn = document.querySelector(".primary");
  const backBtn = document.querySelector(".secondary");

  const gpsStatus = document.getElementById("gpsStatus");
  const addressInput = document.getElementById("address");

  /* ================================
     CATEGORY
  ================================= */
  let selectedCategory = "Pothole";

  categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = btn.innerText.trim();
    });
  });

  /* ================================
     FILE UPLOAD
  ================================= */
  let uploadedFiles = [];
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,video/*";
  fileInput.multiple = true;

  thumbnails?.querySelectorAll(".add").forEach(btn => {
    btn.onclick = () => fileInput.click();
  });

  fileInput.onchange = () => {
    [...fileInput.files].forEach(file => {
      uploadedFiles.push(file);

      const reader = new FileReader();
      reader.onload = e => {
        const div = document.createElement("div");
        div.className = "thumb";
        div.style.backgroundImage = `url(${e.target.result})`;
        thumbnails?.prepend(div);
        if (previewText) previewText.textContent = file.name;
      };
      reader.readAsDataURL(file);
    });
  };

  /* ================================
     MAP + GPS
  ================================= */
  let latitude = null;
  let longitude = null;

  if (gpsStatus) gpsStatus.textContent = "Locating...";

  const map = L.map("map").setView([20.5937, 78.9629], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  const marker = L.marker([20.5937, 78.9629], { draggable: true }).addTo(map);

  function updatePosition(lat, lng) {
    latitude = lat;
    longitude = lng;
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 16);
    if (gpsStatus) gpsStatus.textContent = "GPS Locked";
    fetchAddress(lat, lng);
  }

  navigator.geolocation.getCurrentPosition(
    pos => updatePosition(pos.coords.latitude, pos.coords.longitude),
    () => gpsStatus && (gpsStatus.textContent = "Location denied")
  );

  marker.on("dragend", () => {
    const pos = marker.getLatLng();
    updatePosition(pos.lat, pos.lng);
  });

  async function fetchAddress(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (addressInput) addressInput.value = data.display_name || "";
    } catch {}
  }

  /* ================================
     SUBMIT REPORT   FIXED
  ================================= */
  let isSubmitting = false;

  submitBtn?.addEventListener("click", async () => {
    if (isSubmitting) return;

    if (!textarea.value.trim()) return alert("Describe the issue");
    if (!latitude || !longitude) return alert("Waiting for GPS");

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
      const res = await fetch(`${API_BASE}/report`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`
        },
        body: form
      });

      if (res.status === 401) {
        redirectToLogin();
        return;
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      localStorage.removeItem("reportDraft");
      window.location.href = "/civic/html/user/CommunityPage.html";

    } catch (err) {
      alert(err.message || "Server error");
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Report";
      isSubmitting = false;
    }
  });

});
