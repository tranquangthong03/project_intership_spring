import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const uploadsDir = path.join(process.cwd(), "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeBase = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeBase}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      cb(new Error("Only PDF files are allowed."));
      return;
    }

    cb(null, true);
  }
});

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.post("/upload-cv", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { message: "Missing file." } });
    return;
  }

  res.json({
    success: true,
    data: {
      fileName: req.file.originalname,
      size: req.file.size,
      storagePath: path.join("uploads", req.file.filename)
    }
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ success: false, error: { message: err.message } });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
