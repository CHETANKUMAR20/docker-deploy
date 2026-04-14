/* ============================= */
/* CREATE BLOG (SECURE) */
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {

    /* ============================= */
    /* AUTH CHECK */
    /* ============================= */

    const ADMIN_SECRET = process.env.ADMIN_SECRET
    const providedKey = req.headers["x-admin-key"]

    if (!providedKey || providedKey !== ADMIN_SECRET) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    /* ============================= */
    /* BODY */
    /* ============================= */

    const { title, description, content } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: "Missing fields" })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const date = new Date().toISOString().split("T")[0]

    const markdown = `---
title: ${title}
description: ${description || ""}
date: ${date}
---

${content}
`

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN
    const OWNER = "CHETANKUMAR20"
    const REPO = "blogs-c01ai"
    const PATH = `content/${slug}.md`

    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Create blog: ${title}`,
          content: Buffer.from(markdown).toString("base64")
        })
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message)
    }

    res.status(200).json({ success: true, slug })

  } catch (err) {

    console.error(err)

    res.status(500).json({ error: "Failed to create blog" })
  }
}