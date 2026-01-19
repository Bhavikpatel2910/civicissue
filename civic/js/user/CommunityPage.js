const API = "http://localhost:5000/api/community";

/* =============================
   AUTH
============================= */
let session = null;
try {
  session = JSON.parse(localStorage.getItem("citizenSession"));
} catch {
  session = null;
}

// if (!session || !session.token) {
//   window.location.href = "/civic/html/auth/index.html";
//   throw new Error("Not authenticated");
// }

/* =============================
   ELEMENTS
============================= */
const feed = document.querySelector(".feed");
const avatar = document.querySelector(".avatar");

/* =============================
   LOGOUT
============================= */
if (avatar) {
  avatar.onclick = () => {
    localStorage.removeItem("citizenSession");
    window.location.href = "/civic/html/auth/index.html";
  };
}

/* =============================
   LOAD FEED
============================= */
async function loadFeed() {
  try {
    const res = await fetch(API, {
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });

    if (res.status === 401) {
      localStorage.removeItem("citizenSession");
      window.location.href = "/civic/html/auth/index.html";
      return;
    }

    if (!res.ok) {
      throw new Error(`Server error (${res.status})`);
    }

    const posts = await res.json();

    if (!Array.isArray(posts)) {
      throw new Error("Invalid community response");
    }

    renderFeed(posts);

  } catch (err) {
    console.error("COMMUNITY LOAD ERROR:", err.message);
    feed.innerHTML = `
      <p style="color:red;text-align:center">
        Failed to load community feed.<br>
        Please try again later.
      </p>
    `;
  }
}

/* =============================
   RENDER POSTS
============================= */
function renderFeed(posts) {
  feed.innerHTML = "";

  if (!posts.length) {
    feed.innerHTML = "<p>No community posts yet.</p>";
    return;
  }

  posts.forEach(p => {
    const el = document.createElement("article");
    el.className = "post";

    el.innerHTML = `
      <header class="post-header">
        <div class="user">
          <div class="user-avatar"></div>
          <div>
            <div class="user-name">${p.userName || "Citizen"}</div>
            <p class="meta">${p.location || "Local Area"}</p>
          </div>
        </div>
      </header>

      <div class="post-body">
        <h3>${p.title || "Issue Reported"}</h3>
        <p>${p.description || ""}</p>
      </div>

      <div class="before-after">
        ${p.beforeImage ? `<img src="http://localhost:5000/uploads/${p.beforeImage}" />` : ""}
        ${p.afterImage ? `<img src="http://localhost:5000/uploads/${p.afterImage}" />` : ""}
      </div>

      <footer class="post-actions">
        <button onclick="likePost('${p._id}')">
          👍 ${p.likes ?? 0}
        </button>
      </footer>
    `;

    feed.appendChild(el);
  });
}

/* =============================
   LIKE POST
============================= */
async function likePost(id) {
  try {
    const res = await fetch(`${API}/like/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`
      }
    });

    if (!res.ok) throw new Error("Like failed");

    loadFeed();
  } catch (err) {
    console.error("LIKE ERROR:", err.message);
  }
}

/* =============================
   START
============================= */
loadFeed();
