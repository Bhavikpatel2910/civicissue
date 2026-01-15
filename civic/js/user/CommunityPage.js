const API = "http://localhost:5000/api/community";

const session = JSON.parse(localStorage.getItem("session"));
if (!session || !session.token) {
  window.location.href = "/civic/html/auth/Login.html";
}

const feed = document.querySelector(".feed");
const avatar = document.querySelector(".avatar");

avatar.onclick = () => {
  localStorage.removeItem("session");
  window.location.href = "/civic/html/auth/Login.html";
};

async function loadFeed() {
  const res = await fetch(API, {
    headers: {
      Authorization: "Bearer " + session.token
    }
  });

  const posts = await res.json();
  renderFeed(posts);
}

function renderFeed(posts) {
  feed.innerHTML = "";

  posts.forEach(p => {
    const el = document.createElement("article");
    el.className = "post";

    el.innerHTML = `
      <header class="post-header">
        <div class="user">
          <div class="user-avatar"></div>
          <div>
            <div class="user-name">${p.userName}</div>
            <p class="meta">${p.location}</p>
          </div>
        </div>
      </header>

      <div class="post-body">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
      </div>

      <div class="before-after">
        ${p.beforeImage ? `<img src="http://localhost:5000/uploads/${p.beforeImage}">` : ""}
      </div>

      <footer class="post-actions">
        <button onclick="likePost('${p._id}')">👍 ${p.likes}</button>
      </footer>
    `;

    feed.appendChild(el);
  });
}

async function likePost(id) {
  await fetch(API + "/like/" + id, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + session.token
    }
  });

  loadFeed();
}

loadFeed();
