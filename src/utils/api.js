/* ============================= */
/* API LAYER (c01ai v3) */
/* ============================= */

const BASE_URL = "https://blogs.c01ai.com/api";

/* ============================= */
/* CORE REQUEST HANDLER */
/* ============================= */

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    return data;

  } catch (err) {
    console.error("API ERROR:", endpoint, err.message);
    throw err;
  }
}

/* ============================= */
/* HELPERS */
/* ============================= */

function getAdminKey() {
  return localStorage.getItem("admin_key") || "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "x-admin-key": getAdminKey()
  };
}

function jsonHeaders() {
  return {
    "Content-Type": "application/json"
  };
}

/* ============================= */
/* BLOG APIs */
/* ============================= */

/* FETCH ALL BLOGS */

export async function fetchBlogs() {
  try {
    const data = await request("/blogs");

    if (!Array.isArray(data)) {
      console.warn("Invalid blog response:", data);
      return [];
    }

    return data;

  } catch {
    return [];
  }
}

/* FETCH SINGLE BLOG */

export async function fetchBlog(slug) {
  if (!slug) throw new Error("Slug is required");

  return request(`/blog?slug=${encodeURIComponent(slug)}`);
}

/* CREATE BLOG */

export async function createBlog({ title, description, content }) {

  if (!title || !content) {
    throw new Error("Title and content required");
  }

  return request("/create-blog", {
    method: "POST",
    mode: "cors",
    headers: authHeaders(),
    body: JSON.stringify({ title, description, content })
  });
}

/* UPDATE BLOG */

export async function updateBlog({ slug, title, description, content }) {

  if (!slug) throw new Error("Slug required");

  return request("/update-blog", {
    method: "POST",
    mode: "cors",
    headers: authHeaders(),
    body: JSON.stringify({ slug, title, description, content })
  });
}

/* DELETE BLOG */

export async function deleteBlog(slug) {

  if (!slug) throw new Error("Slug required");

  return request("/delete-blog", {
    method: "POST",
    mode: "cors",
    headers: authHeaders(),
    body: JSON.stringify({ slug })
  });
}

/* ============================= */
/* ANALYTICS */
/* ============================= */

export async function trackView(slug) {

  if (!slug) return;

  try {
    await request("/track-view", {
      method: "POST",
      mode: "cors",
      headers: jsonHeaders(),
      body: JSON.stringify({ slug })
    });
  } catch (err) {
    console.warn("View tracking failed");
  }
}

/* ============================= */
/* FUTURE READY (OPTIONAL) */
/* ============================= */

/* BULK FETCH (for dashboard later) */

export async function fetchAnalytics() {
  return request("/analytics"); // prepare backend later
}