/* ============================= */
/* DELETE BLOG */
/* ============================= */

export default async function handler(req, res) {

// ✅ FULL CORS FIX (PRODUCTION SAFE)

res.setHeader("Access-Control-Allow-Origin", "*");

res.setHeader(
  "Access-Control-Allow-Methods",
  "GET, POST, PUT, DELETE, OPTIONS"
);

res.setHeader(
  "Access-Control-Allow-Headers",
  "Content-Type, Authorization, x-admin-key"
);

// ⚡ IMPORTANT: handle preflight properly
if (req.method === "OPTIONS") {
  return res.status(200).json({});
}

  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    /* ============================= */
    /* AUTH */
    /* ============================= */

    const ADMIN_SECRET = process.env.ADMIN_SECRET
    const key = req.headers["x-admin-key"]

    if (!key || key !== ADMIN_SECRET) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    /* ============================= */
    /* VALIDATE SLUG */
    /* ============================= */

    let { slug } = req.query

    if (!slug) {
      return res.status(400).json({ error: "Missing slug" })
    }

    // 🔥 normalize slug (VERY IMPORTANT)
    slug = slug
      .replace("content/", "")
      .replace(".md", "")
      .trim()

    const filePath = `content/${slug}.md`

    /* ============================= */
    /* CONFIG */
    /* ============================= */

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const OWNER = "CHETANKUMAR20"
    const REPO = "blogs-c01ai"

    /* ============================= */
    /* GET FILE SHA */
    /* ============================= */

    const getFile = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Accept": "application/vnd.github+json"
        }
      }
    )

    // ❌ file not found
    if (!getFile.ok) {
      return res.status(404).json({ error: "Blog not found" })
    }

    const fileData = await getFile.json()

    if (!fileData.sha) {
      return res.status(500).json({ error: "Invalid file data" })
    }

    /* ============================= */
    /* DELETE FILE */
    /* ============================= */

    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Delete blog: ${slug}`,
          sha: fileData.sha
        })
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error("GitHub delete error:", errText)

      return res.status(500).json({ error: "Delete failed" })
    }

    /* ============================= */
    /* SUCCESS */
    /* ============================= */

    return res.status(200).json({
      success: true,
      deleted: slug
    })

  } catch (err) {

    console.error("DELETE ERROR:", err)

    return res.status(500).json({
      error: "Failed to delete blog"
    })

  }
}