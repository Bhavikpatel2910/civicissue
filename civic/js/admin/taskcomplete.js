/* =====================================================
   TASK COMPLETION – FINAL JS
===================================================== */

const REQUIRED_PHOTOS = 3;
let photos = [];
let videoFile = null;
let locationData = null;

/* ---------------- Camera Photos ---------------- */
document.querySelectorAll("[data-photo]").forEach(box => {
  const input = box.querySelector("input");
  const img = box.querySelector("img");

  box.addEventListener("click", () => input.click());

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      addWatermark(e.target.result).then(result => {
        img.src = result;
        img.classList.remove("hidden");
        photos.push(result);
      });
    };
    reader.readAsDataURL(file);
  });
});

/* ---------------- Video ---------------- */
const videoBox = document.getElementById("videoBox");
videoBox.addEventListener("click", () => videoBox.querySelector("input").click());

videoBox.querySelector("input").addEventListener("change", e => {
  videoFile = e.target.files[0];
  document.getElementById("videoStatus").textContent = "Video attached ✔";
});

/* ---------------- Location ---------------- */
document.getElementById("getLocationBtn").addEventListener("click", () => {
  const status = document.getElementById("locationStatus");

  navigator.geolocation.getCurrentPosition(
    pos => {
      locationData = {
        lat: pos.coords.latitude.toFixed(6),
        lng: pos.coords.longitude.toFixed(6)
      };
      status.textContent = `Location captured: ${locationData.lat}, ${locationData.lng}`;
    },
    () => status.textContent = "Location access denied"
  );
});

/* ---------------- Submit ---------------- */
document.getElementById("submitBtn").addEventListener("click", () => {
  if (photos.length < REQUIRED_PHOTOS) {
    alert("Please capture all required photos.");
    return;
  }

  if (!locationData) {
    alert("Please capture live location.");
    return;
  }

  const notes = document.getElementById("notes").value.trim();
  if (!notes) {
    alert("Resolution notes required.");
    return;
  }

  const payload = {
    photos,
    video: videoFile ? videoFile.name : null,
    location: locationData,
    notes,
    submittedAt: new Date().toISOString()
  };

  console.log("FINAL PAYLOAD:", payload);
  alert("Task Completion Report Submitted Successfully.");
});

/* ---------------- Watermark ---------------- */
function addWatermark(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

      ctx.fillStyle = "#fff";
      ctx.font = "24px Inter";
      ctx.fillText(new Date().toLocaleString(), 20, canvas.height - 60);

      if (locationData) {
        ctx.fillText(`Lat ${locationData.lat}, Lng ${locationData.lng}`, 20, canvas.height - 30);
      }

      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = src;
  });
}
