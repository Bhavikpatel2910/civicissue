/* =====================================================
   MANAGE ISSUES – CIVICCARE ADMIN (FINAL FIXED)
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {

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
     ISSUE ID
  =============================== */
  const issueId = new URLSearchParams(window.location.search).get("id");
  if (!issueId) {
    alert("Invalid Issue ID");
    return;
  }

  /* ===============================
     ELEMENTS
  =============================== */
  const mainImage = document.getElementById("mainImage");
  const thumbsContainer = document.querySelector(".thumbs");
  const activityLog = document.getElementById("activityLog");

  const statusSelect = document.getElementById("status");
  const prioritySelect = document.getElementById("priority");
  const crewSelect = document.getElementById("crew");
  const noteInput = document.getElementById("note");

  const addNoteBtn = document.getElementById("addNote");
  const updateIssueBtn = document.getElementById("updateIssue");
  const exportBtn = document.getElementById("exportPDF");

  const audio = document.getElementById("voiceAudio");
  const voiceToggle = document.getElementById("voiceToggle");
  const voiceIcon = document.getElementById("voiceIcon");
  const voiceProgress = document.getElementById("voiceProgress");
  const voiceTime = document.getElementById("voiceTime");

  /* ===============================
     ACTIVITY LOG
  =============================== */
  function addLog(message) {
    if (!activityLog) return;
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `
      <strong>${new Date().toLocaleString()}</strong>
      <p>${message}</p>
    `;
    activityLog.prepend(entry);
  }

  /* ===============================
     LOAD ISSUE
  =============================== */
  let issue = null;

  async function loadIssue() {
    try {
      const res = await fetch(`${API_BASE}/issues/${issueId}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      if (res.status === 401) {
        localStorage.removeItem("citizenSession");
        window.location.replace("/civic/html/auth/adminLogin.html");
        return;
      }

      if (!res.ok) throw new Error("Failed to load issue");

      issue = await res.json();
      hydrateUI(issue);
      initMap(issue.location);
      addLog("Issue loaded in admin panel");

    } catch (err) {
      console.error("LOAD ISSUE ERROR:", err);
      alert("Failed to load issue");
    }
  }

  /* ===============================
     HYDRATE UI
  =============================== */
  function hydrateUI(issue) {
    statusSelect.value = issue.status || "Submitted";
    prioritySelect.value = issue.priority || "low";

    /* IMAGES */
    if (Array.isArray(issue.media) && issue.media.length) {
      mainImage.src = `/uploads/${issue.media[0]}`;
      thumbsContainer.innerHTML = "";

      issue.media.forEach((img, i) => {
        const thumb = document.createElement("img");
        thumb.src = `/uploads/${img}`;
        thumb.className = `thumb ${i === 0 ? "active" : ""}`;

        thumb.onclick = () => {
          document.querySelectorAll(".thumb")
            .forEach(t => t.classList.remove("active"));
          thumb.classList.add("active");
          mainImage.src = thumb.src;
        };

        thumbsContainer.appendChild(thumb);
      });
    }

    /* VOICE NOTE */
    if (issue.voiceNote && audio) {
      audio.src = `/uploads/${issue.voiceNote}`;
    }
  }

  /* ===============================
     MAP
  =============================== */
  function initMap(location) {
    if (!location) return;

    const [lat, lng] = location.split(",").map(v => Number(v.trim()));
    if (!lat || !lng) return;

    const map = L.map("map").setView([lat, lng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    L.marker([lat, lng]).addTo(map).bindPopup("Issue Location");
  }

  /* ===============================
     VOICE PLAYER
  =============================== */
  if (audio && voiceToggle) {
    voiceToggle.onclick = () => {
      audio.paused ? audio.play() : audio.pause();
      voiceIcon.textContent = audio.paused ? "play_arrow" : "pause";
    };

    audio.ontimeupdate = () => {
      if (!audio.duration) return;
      voiceProgress.style.width =
        (audio.currentTime / audio.duration) * 100 + "%";

      const m = Math.floor(audio.currentTime / 60);
      const s = Math.floor(audio.currentTime % 60).toString().padStart(2, "0");
      voiceTime.textContent = `${m}:${s}`;
    };

    audio.onended = () => {
      voiceIcon.textContent = "play_arrow";
      voiceProgress.style.width = "0%";
    };
  }

  /* ===============================
     ADD NOTE
  =============================== */
  addNoteBtn.onclick = async () => {
    const note = noteInput.value.trim();
    if (!note) return alert("Enter a note");

    await fetch(`${API_BASE}/issues/${issueId}/note`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ note })
    });

    addLog(`Internal Note: ${note}`);
    noteInput.value = "";
  };

  /* ===============================
     UPDATE ISSUE
  =============================== */
  updateIssueBtn.onclick = async () => {
    await fetch(`${API_BASE}/issues/${issueId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        status: statusSelect.value,
        priority: prioritySelect.value,
        crew: crewSelect.value || null
      })
    });

    addLog(`Issue updated → ${statusSelect.value}`);
    alert("Issue updated successfully");
  };

  /* ===============================
     EXPORT PDF
  =============================== */
  exportBtn.onclick = () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    pdf.text("CivicCare Issue Report", 20, 20);
    pdf.text(`Issue ID: ${issueId}`, 20, 35);
    pdf.text(`Status: ${statusSelect.value}`, 20, 45);
    pdf.text(`Priority: ${prioritySelect.value}`, 20, 55);

    pdf.save(`issue-${issueId}.pdf`);
  };

  /* ===============================
     INIT
  =============================== */
  await loadIssue();
  console.log(" Manage Issues loaded successfully");

});
