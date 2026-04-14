/* ============================= */
/* VERCEL SERVERLESS FUNCTION */
/* GET ALL BLOGS FROM GITHUB */
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
    /* ENV VARIABLES */
    /* ============================= */

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const OWNER = "CHETANKUMAR20"        // 🔥 your GitHub username
    const REPO = "blogs-c01ai"           // 🔥 your repo name
    const PATH = "content"               // folder where .md files exist

    /* ============================= */
    /* FETCH FILE LIST */
    /* ============================= */

    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch repo contents")
    }

    const files = await response.json()

    /* ============================= */
    /* FILTER MARKDOWN FILES */
    /* ============================= */

    const markdownFiles = files.filter(file => file.name.endsWith(".md"))

    /* ============================= */
    /* PARSE FILE METADATA */
    /* ============================= */

    const blogs = await Promise.all(

      markdownFiles.map(async (file) => {

        // Fetch raw file content
        const fileRes = await fetch(file.download_url)
        const text = await fileRes.text()

        const meta = extractMeta(text)

        
        return {
        slug: file.name.replace(".md", ""),
        title: meta.title || file.name,
        description: meta.description || "No description",
        date: meta.date || "",
        tags: meta.tags ? meta.tags.split(",") : []
        }
      })
    )

    /* ============================= */
    /* SORT (NEWEST FIRST) */
    /* ============================= */

    blogs.sort((a, b) => new Date(b.date) - new Date(a.date))

    /* ============================= */
    /* RESPONSE */
    /* ============================= */

    res.status(200).json(blogs)

  } catch (err) {

    console.error(err)

    res.status(500).json({
      error: "Failed to load blogs"
    })
  }
}

/* ============================= */
/* EXTRACT FRONTMATTER */
/* ============================= */

function extractMeta(content) {

  const lines = content.split("\n")

  const meta = {}

  // Expecting top section like:
  /*
    ---
    title: My Blog
    description: Something
    date: 2026-03-31
    ---
  */

  if (lines[0] === "---") {

    for (let i = 1; i < lines.length; i++) {

      if (lines[i] === "---") break

      const [key, ...rest] = lines[i].split(":")
      meta[key.trim()] = rest.join(":").trim()
    }
  }

  return meta
}