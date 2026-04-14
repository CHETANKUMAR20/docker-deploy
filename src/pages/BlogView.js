import { fetchBlog } from "../utils/api.js"
import { parseMarkdown } from "../utils/markdown.js"

function getSlug() {
  const params = new URLSearchParams(window.location.search)
  return params.get("slug")
}

export async function BlogView() {

  const slug = getSlug()

  if (!slug) {
    return `<h1>Invalid Blog</h1>`
  }

  let blog

  try {
    blog = await fetchBlog(slug)
    /* ============================= */
/* TRACK VIEW */
/* ============================= */

    fetch(`/api/track-view?slug=${slug}`)
  } catch {
    return `<h1>Failed to load blog</h1>`
  }

  /* ============================= */
  /* SEO UPDATE */
  /* ============================= */

  document.title = `${blog.title} | c01ai`

  const htmlContent = parseMarkdown(blog.content)

  /* ============================= */
  /* DELAY HIGHLIGHT */
  /* ============================= */

  setTimeout(() => {
    if (window.hljs) {
      document.querySelectorAll("pre code").forEach(block => {
        window.hljs.highlightElement(block)
      })
    }
  }, 0)

  return `
    <article class="blog-container">

      <h1>${blog.title}</h1>

      <p style="color:#9ca3af; font-size:14px;">
        ${blog.date || ""}
      </p>

      <div style="margin-top:30px;">
        ${htmlContent}
      </div>

      <div style="margin-top:40px;">
        <button class="btn" onclick="navigate('/')">← Back</button>
      </div>

    </article>
  `
}