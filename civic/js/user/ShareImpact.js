/* =========================
   ELEMENTS
========================= */
const card = document.getElementById("impactCard");
const headlineInput = document.getElementById("headlineInput");
const headlineText = document.getElementById("headlineText");

const squareBtn = document.getElementById("ratioSquare");
const storyBtn = document.getElementById("ratioStory");

const saveBtn = document.getElementById("saveImage");
const copyBtn = document.getElementById("copyLink");

const canvas = document.getElementById("exportCanvas");
const ctx = canvas.getContext("2d");

/* =========================
   LIVE HEADLINE UPDATE
========================= */
headlineInput.addEventListener("input", () => {
  headlineText.textContent = headlineInput.value.trim() || "I just helped improve my city!";
});

/* =========================
   RATIO TOGGLE
========================= */
squareBtn.onclick = () => {
  card.classList.remove("story");
  card.classList.add("square");

  squareBtn.classList.add("active");
  storyBtn.classList.remove("active");
};

storyBtn.onclick = () => {
  card.classList.remove("square");
  card.classList.add("story");

  storyBtn.classList.add("active");
  squareBtn.classList.remove("active");
};

/* =========================
   CANVAS EXPORT
========================= */
saveBtn.onclick = async () => {
  const isStory = card.classList.contains("story");

  const width = isStory ? 1080 : 1080;
  const height = isStory ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  // Background image
  const bg = new Image();
  bg.crossOrigin = "anonymous";
  bg.src = getComputedStyle(card.querySelector(".card-bg"))
    .backgroundImage
    .replace(/^url\(["']?/, "")
    .replace(/["']?\)$/, "");

  bg.onload = () => {
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.drawImage(bg, 0, 0, width, height);

    // Overlay gradient
    const gradient = ctx.createLinearGradient(0, height, 0, height * 0.4);
    gradient.addColorStop(0, "rgba(0,0,0,0.7)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Headline text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px Plus Jakarta Sans";
    ctx.textAlign = "left";
    ctx.fillText(headlineText.textContent, 80, height - 260);

    // Subtext
    ctx.font = "500 36px Plus Jakarta Sans";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("Join me in making our city better.", 80, height - 190);

    // Location
    ctx.font = "600 28px Plus Jakarta Sans";
    ctx.fillText("📍 Oak Street, City Center", 80, height - 130);

    // WATERMARK
    drawWatermark(width, height);

    // Download
    downloadCanvas();
  };
};

/* =========================
   WATERMARK
========================= */
function drawWatermark(w, h) {
  // Logo circle
  ctx.fillStyle = "#25f447";
  ctx.beginPath();
  ctx.arc(w - 80, h - 80, 32, 0, Math.PI * 2);
  ctx.fill();

  // Logo text
  ctx.fillStyle = "#000";
  ctx.font = "bold 18px Plus Jakarta Sans";
  ctx.textAlign = "center";
  ctx.fillText("CF", w - 80, h - 74);

  // Platform text
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "600 18px Plus Jakarta Sans";
  ctx.textAlign = "right";
  ctx.fillText("CityFix • Civic Impact", w - 40, h - 30);
}

/* =========================
   DOWNLOAD
========================= */
function downloadCanvas() {
  const link = document.createElement("a");
  link.download = "cityfix-impact.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/* =========================
   COPY LINK
========================= */
copyBtn.onclick = () => {
  navigator.clipboard.writeText(window.location.href);
  alert("Share link copied");
};
