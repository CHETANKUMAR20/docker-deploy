export default function handler(req, res) {

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

  const key = req.headers["x-admin-key"]

  if (key !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  res.status(200).json({ success: true })
}