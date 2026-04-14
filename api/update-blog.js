export default async function handler(req, res) {

  // ✅ CORS FIX
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-admin-key"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    /* ============================= */
    /* AUTH CHECK */
    /* ============================= */

    const adminKey = req.headers["x-admin-key"];

    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    /* ============================= */
    /* INPUT */
    /* ============================= */

    const { slug, title, description, content } = req.body;

    if (!slug || !title || !content) {
      return res.status(400).json({ error: "Missing fields" });
    }

    /* ============================= */
    /* GITHUB CONFIG */
    /* ============================= */

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = "CHETANKUMAR20";
    const REPO = "blogs-c01ai";
    const PATH = "content";

    const filePath = `${PATH}/${slug}.md`;

    /* ============================= */
    /* GET EXISTING FILE SHA */
    /* ============================= */

    const getRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`
        }
      }
    );

    const fileData = await getRes.json();

    if (!fileData.sha) {
      return res.status(404).json({ error: "Blog not found" });
    }

    /* ============================= */
    /* BUILD MARKDOWN */
    /* ============================= */

    const markdown = `---
title: ${title}
description: ${description || ""}
date: ${new Date().toISOString()}
---

${content}
`;

    const encoded = Buffer.from(markdown).toString("base64");

    /* ============================= */
    /* UPDATE FILE */
    /* ============================= */

    const updateRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Update blog: ${slug}`,
          content: encoded,
          sha: fileData.sha
        })
      }
    );

    if (!updateRes.ok) {
      return res.status(500).json({ error: "GitHub update failed" });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}