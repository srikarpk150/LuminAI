import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/Logo.png";

export default function ResultsPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState("");
  const [fileId, setFileId] = useState("");
  const [processedDate, setProcessedDate] = useState("");
  const [sentiment, setSentiment] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedSummary = localStorage.getItem("summary");
    const storedFileId = localStorage.getItem("file_id");
    const storedChat = localStorage.getItem("chat");
    const storedDate = localStorage.getItem("processed_date");

    if (!storedSummary || !storedFileId) {
      navigate("/");
    } else {
      setFileId(storedFileId);
      setSummary(storedSummary);
      setProcessedDate(storedDate || new Date().toLocaleDateString());
      if (storedChat) {
        setChat(JSON.parse(storedChat));
      }

      // Fetch sentiment analysis
      analyzeSentiment(storedSummary);
    }
  }, [navigate]);

  async function analyzeSentiment(text) {
    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze-sentiment/", { text });
      setSentiment(response.data.sentiment);
      setConfidence(response.data.score);
    } catch (error) {
      console.error("Error fetching sentiment:", error);
      setSentiment("Error analyzing sentiment");
    }
  }

  async function askQuestion() {
    if (!question.trim()) return;

    setChat([...chat, { role: "Me", text: question }]); // Add user question immediately
    setLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/interrogate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId, question: question.trim() }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body.getReader();
      let botResponse = "";
      setChat((prevChat) => [...prevChat, { role: "Bot", text: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        botResponse += new TextDecoder().decode(value);

        setChat((prevChat) => {
          const updatedChat = [...prevChat];
          updatedChat[updatedChat.length - 1].text = botResponse;
          return updatedChat;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setChat([...chat, { role: "Me", text: question }, { role: "Bot", text: "Error fetching response!" }]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  }

  async function deleteFileAndNavigate() {
    const storedFileId = localStorage.getItem("file_id");

    if (storedFileId) {
      try {
        await axios.delete(`http://127.0.0.1:8000/delete/${storedFileId}`);
        console.log("File deleted successfully");
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }

    localStorage.removeItem("file_id");
    localStorage.removeItem("summary");
    localStorage.removeItem("chat");
    localStorage.removeItem("processed_date");
    navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#f5faff] p-10 w-full">
      
      <div className="absolute top-6 left-6 flex items-center space-x-2">
        <img src={logo} alt="LuminAI Logo" className="w-12 h-12 drop-shadow-lg" />
        <h1 className="text-4xl font-bold text-[#0077ff] tracking-wide neon-text">LuminAI</h1>
      </div>

      <div className="w-[90%] bg-white bg-opacity-70 shadow-xl rounded-xl p-6 mt-16 border-l-4 border-[#0077ff] backdrop-blur-md relative">
        <h2 className="text-2xl font-bold text-[#0077ff] mb-3">Summary</h2>
        <p className="text-lg text-[#333] leading-relaxed">
          {summary || "Generating summary..."}
        </p>
        <p className="absolute top-6 right-6 text-sm text-[#555]">
          Processed: {processedDate}
        </p>

        <p className="mt-4 text-md text-[#0077ff] font-semibold">
          Sentiment: <span className="text-[#333] font-normal">{sentiment ? sentiment : "Analyzing..."}</span>
        </p>
        <p className="text-md text-[#0077ff] font-semibold">
          Confidence: <span className="text-[#333] font-normal">{confidence !== null ? `${(confidence * 100).toFixed(2)}%` : "Loading..."}</span>
        </p>
      </div>

      {/* Chat Section */}
      <div className="w-[90%] bg-white bg-opacity-70 shadow-lg rounded-xl p-6 mt-6 border-l-4 border-[#0077ff] backdrop-blur-md">
        <h2 className="text-lg font-bold text-[#0077ff] mb-3">Ask Questions</h2>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {chat.map((msg, index) => (
            <div key={index} className="text-md text-[#333] leading-relaxed">
              <strong className={`text-[#0077ff] ${msg.role === "Me" ? "text-black" : "text-[#0077ff]"}`}>
                {msg.role}:
              </strong> 
              <span className="ml-2">{msg.text}</span>
              {index !== chat.length - 1 && <hr className="my-2 border-gray-300 opacity-50" />}
            </div>
          ))}
        </div>

        {loading && <p className="text-[#0077ff] text-center mt-2">Thinking...</p>}

        <div className="flex mt-3 items-center">
          <input
            type="text"
            className="flex-1 p-3 border rounded-lg shadow-md bg-[#f0f8ff] bg-opacity-80 text-[#333] placeholder-[#0077ff] focus:ring-2 focus:ring-[#0077ff] outline-none"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          />
          <button
            className="ml-3 px-4 py-3 bg-[#0077ff] text-white rounded-lg shadow-md hover:bg-[#005fcc] neon-button"
            onClick={askQuestion}
          >
            Ask
          </button>
        </div>
      </div>

      <button
        className="mt-6 px-6 py-3 bg-[#66b2ff] text-white rounded-lg shadow-md hover:bg-[#4d94ff] neon-button"
        onClick={deleteFileAndNavigate}
      >
        Home
      </button>
    </div>
  );
}
