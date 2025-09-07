import { useState } from "react";

export default function Home() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadPdf = async () => {
    if (!pdf) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("pdf", pdf);
    try {
      await fetch("/api/pdf?action=upload", {
        method: "POST",
        headers: {
          "x-internal-key": process.env.NEXT_PUBLIC_INTERNAL_API_KEY || "",
        },
        body: fd,
      });
      alert("PDF processed successfully!");
    } catch {
      alert("Error uploading PDF");
    }
    setLoading(false);
  };

  const askQuestion = async () => {
    if (!question) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pdf?action=query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": process.env.NEXT_PUBLIC_INTERNAL_API_KEY || "",
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer);
    } catch {
      alert("Error fetching answer");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl font-extrabold text-indigo-800 mb-10">
        📄 PDF Q&A Chatbot
      </h1>

      <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8">
        {/* Upload Column */}
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col gap-4 md:w-1/3">
          <h2 className="text-2xl font-semibold text-gray-700">Upload PDF</h2>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdf(e.target.files?.[0] || null)}
            className="file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-indigo-100 file:text-indigo-700
                       hover:file:bg-indigo-200 w-full"
          />
          <button
            onClick={uploadPdf}
            disabled={loading || !pdf}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-md disabled:opacity-50 transition-all duration-200"
          >
            {loading ? "Processing PDF..." : "Upload PDF"}
          </button>
          {pdf && (
            <p className="text-gray-600 mt-2 font-medium">Selected: {pdf.name}</p>
          )}
        </div>

        {/* QA Column */}
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col gap-4 md:w-2/3">
          <h2 className="text-2xl font-semibold text-gray-700">Ask a Question</h2>
          <input
            type="text"
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={askQuestion}
            disabled={loading || !question || !pdf}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-md disabled:opacity-50 transition-all duration-200"
          >
            {loading ? "Fetching Answer..." : "Ask Question"}
          </button>

          {answer && (
            <div className="mt-6 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-lg text-gray-800 font-medium whitespace-pre-line shadow-sm">
              {answer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
