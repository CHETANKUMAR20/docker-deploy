/* ============================= */
/* VERCEL SERVERLESS FUNCTION */
/* GET SINGLE BLOG FROM GITHUB */
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

    /* ============================= */
    /* GET SLUG */
    /* ============================= */

    const { slug } = req.query

    if (!slug) {
      return res.status(400).json({ error: "Missing slug" })
    }

    /* ============================= */
    /* ENV VARIABLES */
    /* ============================= */

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const OWNER = "CHETANKUMAR20"
    const REPO = "blogs-c01ai"
    const PATH = "content"

    const filePath = `${PATH}/${slug}.md`

    /* ============================= */
    /* FETCH FILE */
    /* ============================= */

    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    )

    if (!response.ok) {
      throw new Error("Blog not found")
    }

    const data = await response.json()

    /* ============================= */
    /* DECODE BASE64 CONTENT */
    /* ============================= */

    const content = Buffer.from(data.content, "base64").toString("utf-8")

    /* ============================= */
    /* EXTRACT META + BODY */
    /* ============================= */

    const { meta, body } = parseMarkdownFile(content)

    /* ============================= */
    /* RESPONSE */
    /* ============================= */

    res.status(200).json({
      slug,
      title: meta.title || slug,
      date: meta.date || "",
      description: meta.description || "",
      content: body
    })

  } catch (err) {

    console.error(err)

    res.status(500).json({
      error: "Failed to load blog"
    })
  }
}

/* ============================= */
/* PARSE MARKDOWN FILE */
/* ============================= */

function parseMarkdownFile(content) {

  const lines = content.split("\n")

  let meta = {}
  let bodyStartIndex = 0

  if (lines[0] === "---") {

    for (let i = 1; i < lines.length; i++) {

      if (lines[i] === "---") {
        bodyStartIndex = i + 1
        break
      }

      const [key, ...rest] = lines[i].split(":")
      meta[key.trim()] = rest.join(":").trim()
    }
  }

  const body = lines.slice(bodyStartIndex).join("\n")

  return { meta, body }
}