/* =====================================================
   TASK COMPLETE CONFIRMATION - ADMIN
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "http://localhost:5000/api/admin/reports";

  /* ======================
     AUTH GUARD
  ====================== */
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem("citizenSession"));
  } catch {
    session = null;
  }

//   if (!session || !session.token || session.role !== "admin") {
//     window.location.replace("/civic/html/auth/adminLogin.html");
//     return;
//   }

  const authHeaders = {
    Authorization: `Bearer ${session.token}`
  };


  /* ======================
     ELEMENTS
  ====================== */
  const reportIdEl = document.getElementById("reportId");
  const statusEl = document.getElementById("status");
  const reportTitleEl = document.getElementById("reportTitle");
  const assigneeEl = document.getElementById("assignee");
  const allReportsBtn = document.getElementById("allReportsBtn");
  const dashboardBtn = document.getElementById("dashboardBtn");


  /* ======================
     GET ID & FETCH DATA
  ====================== */
  const urlParams = new URLSearchParams(window.location.search);
  const issueId = urlParams.get('id');

  if (!issueId) {
    handleFetchError("No issue ID provided.");
    return;
  }

  async function loadCompletedIssue() {
    try {
      // In a real app, you would fetch from the API:
      // const res = await fetch(`${API_BASE}/${issueId}`, { headers: authHeaders });
      // if (!res.ok) throw new Error("Failed to fetch issue");
      // const issue = await res.json();
      
      // For demonstration, we'll use mock data.
      const mockIssue = {
        _id: issueId,
        title: "Pothole on Main St.",
        status: "Resolved",
        assignedCrew: "District 4 Road Crew"
      };

      renderIssue(mockIssue);

    } catch (err) {
      console.error("Fetch error:", err);
      handleFetchError(err.message);
    }
  }

  function handleFetchError(message) {
    if(reportTitleEl) reportTitleEl.textContent = "Error";
    if(assigneeEl) assigneeEl.textContent = message;
  }


  /* ======================
     RENDER DATA
  ====================== */
  function renderIssue(issue) {
    if (reportIdEl) reportIdEl.textContent = `Report ID: #${issue._id.slice(-6)}`;
    if (reportTitleEl) reportTitleEl.textContent = issue.title;

    if (statusEl) {
      statusEl.textContent = issue.status;
      statusEl.className = `status-${issue.status.toLowerCase()}`;
    }
    
    if (assigneeEl) {
        assigneeEl.textContent = issue.assignedCrew 
        ? `Assigned to: ${issue.assignedCrew}`
        : "Not assigned.";
    }
  }


  /* ======================
     NAVIGATION
  ====================== */
  if(allReportsBtn) {
    allReportsBtn.addEventListener("click", () => {
      window.location.href = "/civic/html/admin/all-reports.html";
    });
  }

  if(dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
      window.location.href = "/civic/html/admin/AdminDashboard.html";
    });
  }

  /* ======================
     INIT
  ====================== */
  loadCompletedIssue();
  console.log("Task Complete page loaded.");

});
