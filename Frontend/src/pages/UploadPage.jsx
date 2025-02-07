import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepIndicator from "../components/StepIndicator";
import UploadBox from "../components/UploadBox";
import ProcessingSteps from "../components/ProcessingSteps";
import axios from "axios";

export default function UploadPage() {
  const [step, setStep] = useState(0);
  const [processingStage, setProcessingStage] = useState(0);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-10">
      <StepIndicator step={step} />
      {step === 0 && <UploadBox onUpload={handleUpload} />}
      {step === 1 && <ProcessingSteps stage={processingStage} />}
    </div>
  );
}
