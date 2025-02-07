import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResultsPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState("");
  const [fileId, setFileId] = useState("");
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedSummary = localStorage.getItem("summary");
    const storedFileId = localStorage.getItem("file_id");

    if (!storedSummary || !storedFileId) {
      navigate("/");
    } else {
      setSummary(storedSummary);
      setFileId(storedFileId);
    }
  }, [navigate]);


  async function askQuestion() {
    if (!question.trim()) return;
    
    setChat([...chat, { role: "user", text: question }]);
    setLoading(true);
    
    try {
      const response = await axios.post(`http://127.0.0.1:8000/interrogate`, { question });
      setChat([...chat, { role: "user", text: question }, { role: "ai", text: response.data.answer }]);
    } catch (error) {
      console.error("Error:", error);
      setChat([...chat, { role: "user", text: question }, { role: "ai", text: "Error fetching response!" }]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Summary</h1>
      <p className="bg-white shadow-md p-6 rounded-md w-96">{summary}</p>
      <div className="w-96 bg-white shadow-md rounded-md p-4 mt-6">
        <h2 className="text-lg font-bold mb-3">Ask Questions</h2>
        <div className="h-60 overflow-y-auto border p-3 rounded-md bg-gray-100">
          {chat.map((msg, index) => (
            <div key={index} className={`p-2 my-1 rounded-lg ${msg.role === "user" ? "bg-blue-500 text-white text-right" : "bg-gray-200 text-black text-left"}`}>
              {msg.text}
            </div>
          ))}
          {loading && <p className="text-gray-500 text-center">Thinking...</p>}
        </div>
        <div className="flex mt-3">
          <input
            type="text"
            className="flex-1 p-2 border rounded-md"
            placeholder="Type a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          />
          <button className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={askQuestion}>
            Ask
          </button>
        </div>
      </div>

      <button className="mt-6 px-4 py-2 bg-gray-500 text-white rounded-lg" onClick={() => navigate("/")}>
        Upload Another
      </button>
    </div>
  );
}
