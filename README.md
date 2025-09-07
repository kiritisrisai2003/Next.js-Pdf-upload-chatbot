📄 PDF Q&A Chatbot (Next.js + OpenAI)

A secure PDF Question & Answer Chatbot built with Next.js, OpenAI API, and an in-memory vector search.
Upload any PDF, ask questions, and get context-aware answers from the document.

🚀 Features

📂 Upload PDF and automatically parse text

🧠 Embeddings + Vector Search (cosine similarity)

🤖 Answering with GPT-4 using only PDF context

🔐 API Key Protection with internal headers

🎨 Beautiful Tailwind UI with modern layout

🛠 Tech Stack

Frontend: Next.js (React + TailwindCSS)

Backend: Next.js API Routes + Multer (for uploads)

AI: OpenAI text-embedding-3-large + gpt-4

Storage: In-memory vector store (no DB required)



⚙️ Setup & Installation

1️⃣ Clone repo

git clone https://github.com/yourusername/pdf-qa-chatbot.git
cd pdf-qa-chatbot


2️⃣ Install dependencies

npm install
# or
yarn install


3️⃣ Add environment variables in .env.local

OPENAI_API_KEY="your-openai-api-key"
INTERNAL_API_KEY=""          # Server-side secret
NEXT_PUBLIC_INTERNAL_API_KEY=""  # Used by frontend (public)


⚠️ NEXT_PUBLIC_ variables are exposed to the client. That’s why we validate them on the backend by checking against INTERNAL_API_KEY.

4️⃣ Run development server

npm run dev
# or
yarn dev


App runs on 👉 http://localhost:3000
