import express from "express";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
