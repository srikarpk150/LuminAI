import { CheckCircle } from "lucide-react";

export default function StepIndicator({ step }) {
  const steps = ["Upload", "Processing", "Complete"];

  return (
    <div className="flex items-center justify-center space-x-12 mb-8 text-lg">
      {steps.map((title, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold 
              ${step === index ? "bg-blue-500 text-white animate-pulse" : 
                step > index ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"}`}
          >
            {step > index ? <CheckCircle className="w-7 h-7" /> : index + 1}
          </div>
          <p className={`mt-2 ${step === index ? "text-blue-500 font-semibold" : "text-gray-500"}`}>
            {title}
          </p>
        </div>
      ))}
    </div>
  );
}

