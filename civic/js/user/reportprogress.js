console.log("CityFix timeline page loaded");

// =============================
// AUTH CHECK
// =============================
const session = JSON.parse(localStorage.getItem("citizenSession"));
// if (!session) {
//   window.location.href = "/civic/html/auth/LoginPage.html";
// }

// =============================
// MOCK DATA (Replace with API later)
// =============================
const reportData = {
  id: "84291",
  title: "Pothole Repair – Main St.",
  address: "124 Main Street",
  submittedAt: "Oct 12, 2023 • 10:24 AM",
  status: "In Progress",

  timeline: [
    {
      title: "Issue Resolved",
      time: "Estimated: Oct 18, 2023",
      note: "",
      state: "inactive"
    },
    {
      title: "In Progress",
      time: "Oct 14, 2023 • 09:15 AM",
      note: "Maintenance crew dispatched. Surface preparation in progress.",
      state: "active"
    },
    {
      title: "Assigned",
      time: "Oct 13, 2023 • 02:45 PM",
      note: "",
      state: ""
    },
    {
      title: "Report Received",
      time: "Oct 12, 2023 • 10:24 AM",
      note: "",
      state: ""
    }
  ],

  message: {
    from: "Public Works Dept.",
    time: "2 hours ago",
    text: "We’ve scheduled the asphalt crew for this afternoon. Site should be cleared by 5 PM."
  }
};

// =============================
// HEADER DATA
// =============================
document.querySelector(".page-header h2").textContent = reportData.title;
document.querySelector(".page-header p").textContent =
  `Report ID: #${reportData.id} • Submitted on ${reportData.submittedAt} • ${reportData.address}`;

// =============================
// TABS
// =============================
const tabs = document.querySelectorAll(".tab");
const timelineSection = document.querySelector(".timeline");
const messageCard = document.querySelector(".card.message");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const name = tab.textContent.trim();

    timelineSection.style.display = name === "Timeline" ? "block" : "none";
    messageCard.style.display = name === "Messages" ? "block" : "none";
  });
});

// =============================
// RENDER TIMELINE
// =============================
function renderTimeline() {
  timelineSection.innerHTML = "";

  reportData.timeline.forEach(item => {
    const div = document.createElement("div");
    div.className = `timeline-item ${item.state || ""}`;

    div.innerHTML = `
      <span class="dot"></span>
      <div>
        <h4>${item.title}</h4>
        <p>${item.time}</p>
        ${item.note ? `<div class="note">${item.note}</div>` : ""}
      </div>
    `;

    timelineSection.appendChild(div);
  });
}

renderTimeline();

// =============================
// MESSAGE
// =============================
messageCard.querySelector("p:nth-of-type(1)").innerHTML =
  `<strong>${reportData.message.from}</strong> — ${reportData.message.time}`;

messageCard.querySelector("p:nth-of-type(2)").textContent =
  `"${reportData.message.text}"`;

// =============================
// CONTACT BUTTON
// =============================
document.querySelector(".primary-btn").onclick = () => {
  alert("Department contact feature coming soon 📞");
};

// =============================
// SEARCH (BASIC UX)
// =============================
const searchInput = document.querySelector(".search");
searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  document.querySelectorAll(".timeline-item h4").forEach(h => {
    h.parentElement.parentElement.style.display =
      h.textContent.toLowerCase().includes(value) ? "flex" : "none";
  });
});


// Fetch report details
const urlParams = new URLSearchParams(window.location.search);
const reportId = urlParams.get("id");

fetch(`http://localhost:5000/api/reports/${reportId}`)
  .then(res => res.json())
  .then(report => {
    document.querySelector(".page-header h2").textContent = report.title;
    document.querySelector(".page-header p").textContent =
      `Report ID: ${report._id} • ${report.location}`;

    const timeline = document.querySelector(".timeline");
    timeline.innerHTML = "";

    report.timeline.forEach(step => {
      const div = document.createElement("div");
      div.className = "timeline-item active";

      div.innerHTML = `
        <span class="dot"></span>
        <div>
          <h4>${step.status}</h4>
          <p>${new Date(step.time).toLocaleString()}</p>
          <div class="note">${step.note}</div>
        </div>
      `;

      timeline.appendChild(div);
    });
  });


  setInterval(()=>{
 fetch(`http://localhost:5000/api/reports/${reportId}`)
 .then(r=>r.json())
 .then(report=>{
    renderTimeline(report.timeline);
 });
},5000);
