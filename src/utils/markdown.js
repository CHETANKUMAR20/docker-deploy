/* ============================= */
/* ADVANCED MARKDOWN PARSER */
/* ============================= */

export function parseMarkdown(md) {

  if (!md) return ""

  let html = md

  /* ============================= */
  /* CODE BLOCKS */
  /* ============================= */

  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code class="language-js">${escapeHtml(code.trim())}</code></pre>`
  })

  /* ============================= */
  /* HEADINGS */
  /* ============================= */

  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>")
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>")
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>")

  /* ============================= */
  /* IMAGES ![alt](url) */
  /* ============================= */

  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, `
    <img src="$2" alt="$1" style="width:100%; border-radius:12px; margin:20px 0;" />
  `)

  /* ============================= */
  /* BOLD */
  /* ============================= */

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  /* ============================= */
  /* ITALIC */
  /* ============================= */

  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>")

  /* ============================= */
  /* INLINE CODE */
  /* ============================= */

  html = html.replace(/`(.*?)`/g, (_, code) => {
    return `<code>${escapeHtml(code)}</code>`
  })

  /* ============================= */
  /* LINKS */
  /* ============================= */

  html = html.replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" target="_blank">$1</a>`)

  /* ============================= */
  /* PARAGRAPHS */
  /* ============================= */

  html = html.replace(/\n\n/g, "</p><p>")
  html = `<p>${html}</p>`

  return html
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}