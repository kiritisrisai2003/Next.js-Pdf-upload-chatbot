// pages/api/pdf.ts
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Disable default body parser
export const config = { api: { bodyParser: false } };

// Multer setup
const upload = multer({ dest: "./uploads" });
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) =>
      result instanceof Error ? reject(result) : resolve(result)
    );
  });
}

// In-memory vector store
let vectorStore: { text: string; embedding: number[]; page: number }[] = [];

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (normA * normB);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 🔐 Protect API with internal key
    const clientKey = req.headers["x-internal-key"];
    if (clientKey !== process.env.INTERNAL_API_KEY) {
      return res.status(403).json({ error: "Unauthorized request" });
    }

    if (req.method === "POST") {
      const { action } = req.query;

      // ---------------- Upload PDF ----------------
      if (action === "upload") {
        await runMiddleware(req, res, upload.single("pdf"));
        const file = (req as any).file;
        if (!file) return res.status(400).json({ error: "No file uploaded" });

        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdf(dataBuffer);
        fs.unlinkSync(file.path);

        // Reset previous vector store
        vectorStore = [];
        const pages = pdfData.text.split("\n\n");

        for (let i = 0; i < pages.length; i++) {
          const pageText = pages[i].trim();
          if (!pageText) continue;

          const emb = await openai.embeddings.create({
            model: "text-embedding-3-large",
            input: pageText,
          });

          vectorStore.push({
            text: pageText,
            embedding: emb.data[0].embedding,
            page: i,
          });
        }

        return res.json({ message: "PDF processed successfully!" });
      }

      // ---------------- Query PDF ----------------
      if (action === "query") {
        let body: any = {};
        try {
          body = JSON.parse(req.body.toString());
        } catch {
          return res.status(400).json({ error: "Invalid JSON" });
        }

        const { question } = body;
        if (!question) return res.status(400).json({ error: "No question provided" });

        const qEmb = await openai.embeddings.create({
          model: "text-embedding-3-large",
          input: question,
        });

        const results = vectorStore
          .map((v) => ({
            ...v,
            score: cosineSimilarity(v.embedding, qEmb.data[0].embedding),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        const context = results
          .map((r) => `[Page ${r.page}]: ${r.text}`)
          .join("\n\n");

        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: "Answer using only the PDF context." },
            { role: "user", content: `Context:\n${context}\n\nQ: ${question}` },
          ],
        });

        return res.json({
          answer: completion.choices[0].message?.content || "No answer found",
        });
      }

      return res.status(400).json({ error: "Invalid action" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
