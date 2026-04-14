import { fetchBlogs, deleteBlog, updateBlog } from "../utils/api.js";

const API_BASE = "https://blogs.c01ai.com/api";

let allBlogs = [];
let filteredBlogs = [];
let editingSlug = null;

/* ============================= */
/* ADMIN PAGE */
/* ============================= */

export function Admin() {

  const key = localStorage.getItem("admin_key");

  if (!key) {
    return `
      <div class="admin-login">
        <h2>🔐 Admin Login</h2>

        <input id="adminKey" placeholder="Enter admin key" />

        <button onclick="loginAdmin()">Login</button>

        <p id="status"></p>
      </div>
    `;
  }

  setTimeout(loadAdminBlogs, 100);

  return `
    <div class="admin-container">

      <!-- HEADER -->
      <div class="admin-header">
        <h1>Admin Dashboard</h1>
        <button onclick="logoutAdmin()">Logout</button>
      </div>

      <!-- CREATE -->
      <div class="admin-create">
        <h2>Create Blog</h2>

        <input id="title" placeholder="Title" />
        <input id="desc" placeholder="Description" />
        <textarea id="content" placeholder="Write Markdown..."></textarea>

        <div class="actions">
          <button onclick="generateAI()">🤖 Generate</button>
          <button onclick="createBlog()">Publish</button>
        </div>

        <p id="status"></p>
      </div>

      <!-- TOOLBAR -->
      <div class="admin-toolbar">
        <input 
          placeholder="Search blogs..."
          oninput="handleAdminSearch(this.value)"
        />

        <select onchange="handleAdminSort(this.value)">
          <option value="latest">Latest</option>
          <option value="views">Most Viewed</option>
          <option value="az">Title A-Z</option>
        </select>
      </div>

      <!-- BLOG LIST -->
      <div id="admin-blog-list"></div>

    </div>
  `;
}

/* ============================= */
/* LOAD BLOGS */
/* ============================= */

async function loadAdminBlogs() {
  try {
    allBlogs = await fetchBlogs();

    allBlogs = sortBlogs(allBlogs, "latest");

    filteredBlogs = allBlogs;

    renderBlogs(filteredBlogs);

  } catch (err) {
    console.error("Failed to load blogs", err);
  }
}

/* ============================= */
/* RENDER */
/* ============================= */

function renderBlogs(blogs) {

  const container = document.getElementById("admin-blog-list");
  if (!container) return;

  if (!blogs.length) {
    container.innerHTML = `<p class="empty">No blogs found</p>`;
    return;
  }

  container.innerHTML = blogs.map(blog => `
    <div class="admin-blog-row">

      <div class="left">
        <div class="title">${blog.title}</div>
        <div class="slug">${blog.slug}</div>
      </div>

      <div class="right">
        <span>👁 ${blog.views || 0}</span>
        <button onclick="editBlog('${blog.slug}')">Edit</button>
        <button class="danger" onclick="removeBlog('${blog.slug}')">Delete</button>
      </div>

    </div>
  `).join("");
}

/* ============================= */
/* SEARCH */
/* ============================= */

window.handleAdminSearch = function (query) {

  filteredBlogs = allBlogs.filter(blog =>
    blog.title.toLowerCase().includes(query.toLowerCase())
  )

  renderBlogs(filteredBlogs);
}

/* ============================= */
/* SORT */
/* ============================= */

window.handleAdminSort = function (type) {

  filteredBlogs = sortBlogs(filteredBlogs, type);

  renderBlogs(filteredBlogs);
}

function sortBlogs(blogs, type) {

  const sorted = [...blogs];

  switch (type) {

    case "latest":
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));

    case "views":
      return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));

    case "az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));

    default:
      return sorted;
  }
}

/* ============================= */
/* DELETE */
/* ============================= */

window.removeBlog = async function (slug) {

  if (!confirm("Delete this blog?")) return;

  try {
    await deleteBlog(slug);
    loadAdminBlogs();
  } catch (err) {
    alert(err.message);
  }
}

/* ============================= */
/* LOGIN / LOGOUT */
/* ============================= */

window.loginAdmin = async function () {

  const key = document.getElementById("adminKey").value.trim();
  const status = document.getElementById("status");

  status.innerText = "Verifying...";

  try {
    const res = await fetch(`${API_BASE}/verify-admin`, {
      headers: { "x-admin-key": key }
    });

    if (!res.ok) throw new Error();

    localStorage.setItem("admin_key", key);
    location.reload();

  } catch {
    status.innerText = "❌ Invalid key";
  }
};

window.logoutAdmin = function () {
  localStorage.removeItem("admin_key");
  location.reload();
};

/* ============================= */
/* EDIT (NEXT STEP READY) */
/* ============================= */

window.editBlog = async function (slug) {

  try {

    const res = await fetch(`https://blogs.c01ai.com/api/blog?slug=${slug}`);
    const blog = await res.json();

    editingSlug = slug;

    document.getElementById("title").value = blog.title;
    document.getElementById("desc").value = blog.description || "";
    document.getElementById("content").value = blog.content || "";

    document.getElementById("status").innerText = "✏️ Editing blog";

    window.scrollTo({ top: 0, behavior: "smooth" });

  } catch (err) {
    alert("❌ Failed to load blog");
  }
};

window.createBlog = async function () {

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("desc").value.trim();
  const content = document.getElementById("content").value.trim();

  const status = document.getElementById("status");

  if (!title || !content) {
    status.innerText = "❌ Title & content required";
    return;
  }

  try {

    if (editingSlug) {

      status.innerText = "Updating...";

      await updateBlog({
        slug: editingSlug,
        title,
        description,
        content
      });

      status.innerText = "✅ Blog updated";

      editingSlug = null;

    } else {

      status.innerText = "Publishing...";

      const key = localStorage.getItem("admin_key");

      const res = await fetch(`https://blogs.c01ai.com/api/create-blog`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": key
        },
        body: JSON.stringify({ title, description, content })
      });

      if (!res.ok) throw new Error();

      status.innerText = "✅ Blog created";
    }

    // reset form
    document.getElementById("title").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("content").value = "";

    loadAdminBlogs();

  } catch (err) {
    status.innerText = "❌ Operation failed";
  }
};