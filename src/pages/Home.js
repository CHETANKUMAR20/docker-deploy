import { fetchBlogs } from "../utils/api.js"

/* ============================= */
/* HOME PAGE */
/* ============================= */

export async function Home() {

  let html = `
    <section class="hero">
      <h1>c01ai Engineering Blog</h1>
      <p>Insights from the future.</p>
    </section>

    <div class="toolbar">
      <input 
        id="search"
        placeholder="Search blogs..." 
        oninput="handleSearch(this.value)"
      />

      <select id="sort" onchange="handleSort(this.value)">
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
        <option value="views">Most Viewed</option>
        <option value="az">Title A-Z</option>
      </select>
    </div>

    <div id="blogs">
      ${renderLoading()}
    </div>
  `

  setTimeout(async () => {

    let blogs = []

    try {
      blogs = await fetchBlogs()
    } catch (err) {
      console.error(err)
    }

    blogs = sortBlogs(blogs, "latest")

    window.allBlogs = blogs
    window.filteredBlogs = blogs

    renderHomeBlogs(blogs)

  }, 0)

  return html
}

/* ============================= */
/* MAIN RENDER (FIXED 🔥) */
/* ============================= */

function renderHomeBlogs(blogs) {

  const container = document.getElementById("blogs")
  if (!container) return

  if (!blogs || blogs.length === 0) {
    container.innerHTML = `<div class="empty-state">🚫 No blogs found</div>`
    return
  }

  const featured = blogs[0]
  const rest = blogs.slice(1)

  container.innerHTML = `
    ${renderFeatured(featured)}
    ${renderBlogs(rest)}
  `
}

/* ============================= */
/* FEATURED BLOG (FIXED ✅) */
/* ============================= */

function renderFeatured(blog) {

  if (!blog) return ""

  return `
    <div class="featured-card" onclick="navigate('/blog?slug=${blog.slug}')">

      <div class="featured-content">
        <h2>${blog.title}</h2>
        <p>${blog.description || ""}</p>

        <div class="featured-meta">
          <span>${formatDate(blog.date)}</span>
          <span>👁 ${blog.views || 0}</span>
        </div>
      </div>

    </div>
  `
}

/* ============================= */
/* LOADING */
/* ============================= */

function renderLoading() {
  return `
    <div class="blog-card skeleton"></div>
    <div class="blog-card skeleton"></div>
    <div class="blog-card skeleton"></div>
  `
}

/* ============================= */
/* RENDER BLOGS */
/* ============================= */

function renderBlogs(blogs) {

  return blogs.map(blog => `
    <div class="blog-card" onclick="navigate('/blog?slug=${blog.slug}')">

      <div class="blog-main">

        <div class="blog-header">
          <h3 class="blog-title">${blog.title}</h3>
          <p class="blog-desc">${blog.description || ""}</p>
        </div>

        <div class="blog-tags">
          ${(blog.tags || []).map(tag => `
            <span class="tag">${tag}</span>
          `).join("")}
        </div>

      </div>

      <div class="blog-side">
        <div class="blog-date">${formatDate(blog.date)}</div>
        <div class="blog-views">👁 ${blog.views || 0}</div>
      </div>

    </div>
  `).join("")
}

/* ============================= */
/* DATE FORMAT */
/* ============================= */

function formatDate(date) {
  if (!date) return ""

  const d = new Date(date)

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })
}

/* ============================= */
/* SEARCH */
/* ============================= */

window.handleSearch = function (query) {

  const filtered = (window.allBlogs || []).filter(blog =>
    blog.title.toLowerCase().includes(query.toLowerCase()) ||
    (blog.description || "").toLowerCase().includes(query.toLowerCase())
  )

  window.filteredBlogs = filtered

  const sortType = document.getElementById("sort")?.value || "latest"
  const sorted = sortBlogs(filtered, sortType)

  renderHomeBlogs(sorted)
}

/* ============================= */
/* SORT */
/* ============================= */

window.handleSort = function (type) {

  const blogs = window.filteredBlogs || []
  const sorted = sortBlogs(blogs, type)

  renderHomeBlogs(sorted)
}

/* ============================= */
/* SORT LOGIC */
/* ============================= */

function sortBlogs(blogs, type) {

  const sorted = [...blogs]

  switch (type) {

    case "latest":
      return sorted.sort((a, b) => new Date(b.date) - new Date(a.date))

    case "oldest":
      return sorted.sort((a, b) => new Date(a.date) - new Date(b.date))

    case "views":
      return sorted.sort((a, b) => (b.views || 0) - (a.views || 0))

    case "az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title))

    default:
      return sorted
  }
}