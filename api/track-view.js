/* ============================= */
/* TRACK BLOG VIEW */
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

  try {

    const { slug } = req.query

    if (!slug) {
      return res.status(400).json({ error: "Missing slug" })
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const OWNER = "CHETANKUMAR20"
    const REPO = "blogs-c01ai"
    const PATH = `analytics/${slug}.json`

    let views = 0
    let sha = null

    /* ============================= */
    /* TRY FETCH EXISTING */
    /* ============================= */

    const getFile = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`
        }
      }
    )

    if (getFile.ok) {
      const data = await getFile.json()
      const content = JSON.parse(
        Buffer.from(data.content, "base64").toString("utf-8")
      )
      views = content.views || 0
      sha = data.sha
    }

    views++

    /* ============================= */
    /* SAVE BACK */
    /* ============================= */

    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Update views for ${slug}`,
          content: Buffer.from(JSON.stringify({ views })).toString("base64"),
          sha
        })
      }
    )

    if (!response.ok) {
      throw new Error("Failed to track view")
    }

    res.status(200).json({ views })

  } catch (err) {

    console.error(err)

    res.status(500).json({ error: "Tracking failed" })
  }
}