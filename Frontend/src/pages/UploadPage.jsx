import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StepIndicator from "../components/StepIndicator";
import UploadBox from "../components/UploadBox";
import ProcessingSteps from "../components/ProcessingSteps";
import axios from "axios";
import logo from "../assets/Logo.png";

export default function UploadPage() {
  const [step, setStep] = useState(0);
  const [processingStage, setProcessingStage] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 500);
  }, []);

  async function handleUpload(file) {
    setStep(1);
    setProcessingStage(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProcessingStage(1);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProcessingStage(2);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setProcessingStage(3);
      const response = await axios.post("http://127.0.0.1:8000/upload", formData);

      if (response.data.summary) {
        localStorage.setItem("summary", response.data.summary);
        localStorage.setItem("file_id", response.data.file_id);
        setStep(2);
        setTimeout(() => navigate("/results"), 1500);
      } else {
        alert("Processing failed! No summary generated.");
        setStep(0);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setStep(0);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5faff] p-10 relative w-full">
      
      {/* Logo and Branding */}
      <div className="absolute top-6 left-6 flex items-center space-x-2">
        <img src={logo} alt="LuminAI Logo" className="w-12 h-12 drop-shadow-[0_0_10px_#0077ff]" />
        <h1 className="text-4xl font-bold text-[#0077ff] tracking-wide neon-text">
          LuminAI
        </h1>
      </div>

      <StepIndicator step={step} />
      {step === 0 && <UploadBox onUpload={handleUpload} />}
      {step === 1 && <ProcessingSteps stage={processingStage} />}

      {step === 0 && (
        <p
          className={`text-[#0077ff] opacity-80 text-lg mt-6 text-center transition-opacity duration-1000 ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          🌟 Illuminating Key Insights - Upload your document to extract valuable information.
        </p>
      )}
    </div>
  );
}
