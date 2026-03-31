import cors from "cors";
import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import pdfParse from "pdf-parse";

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

const normalizeList = (value: string): string[] => {
  return value
    .split(/[\n,;|]/)
    .map((item) => item.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);
};

const findValueByLabel = (lines: string[], labels: string[]): string | null => {
  for (const line of lines) {
    const lower = line.toLowerCase();
    for (const label of labels) {
      const pattern = new RegExp(`^${label}\\s*[:\\-]\\s*(.+)$`, "i");
      const match = line.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }

      if (lower.startsWith(label + " ") && line.includes(":")) {
        const parts = line.split(":");
        if (parts[1]) {
          return parts.slice(1).join(":").trim();
        }
      }
    }
  }
  return null;
};

const extractSectionList = (lines: string[], labels: string[]): string[] => {
  for (let i = 0; i < lines.length; i += 1) {
    const lower = lines[i].toLowerCase();
    if (labels.some((label) => lower.startsWith(label))) {
      const inlineValue = lines[i].includes(":") ? lines[i].split(":").slice(1).join(":").trim() : "";
      if (inlineValue) {
        return normalizeList(inlineValue);
      }

      const nextLines = lines.slice(i + 1, i + 4);
      return normalizeList(nextLines.join("\n"));
    }
  }
  return [];
};

const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = await fs.promises.readFile(filePath);
    const parsed = await pdfParse(dataBuffer);
    return (parsed.text || "").trim();
  } catch (error) {
    console.warn("Failed to parse PDF", error);
    return "";
  }
};

const buildCandidateProfile = (rawText: string) => {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const emailMatch = rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = rawText.match(/(\+?\d[\d\s().-]{7,}\d)/);
  const yearsMatch = rawText.match(/(\d+)\+?\s+(years|year|nam)\b/i);

  return {
    fullName: findValueByLabel(lines, ["full name", "name", "ho va ten"]),
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    location: findValueByLabel(lines, ["location", "address", "dia chi"]),
    summary: findValueByLabel(lines, ["summary", "objective", "profile", "gioi thieu"]),
    yearsOfExperience: yearsMatch ? Number(yearsMatch[1]) : 0,
    roles: extractSectionList(lines, ["roles", "role", "position", "title"]),
    skills: extractSectionList(lines, ["skills", "technical skills", "ky nang", "tech stack"]),
    education: extractSectionList(lines, ["education", "hoc van", "education history", "academic"]),
    projects: extractSectionList(lines, ["projects", "du an", "project"]),
    rawText
  };
};

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.post("/upload-cv", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { message: "Missing file." } });
    return;
  }

  const rawText = await extractTextFromPdf(req.file.path);
  const candidateProfile = buildCandidateProfile(rawText);

  res.json({
    success: true,
    data: {
      fileName: req.file.originalname,
      size: req.file.size,
      storagePath: path.join("uploads", req.file.filename),
      candidateProfile
    }
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ success: false, error: { message: err.message } });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
