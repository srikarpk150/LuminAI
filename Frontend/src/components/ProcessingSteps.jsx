import { CheckCircle, Loader2 } from "lucide-react";

export default function ProcessingSteps({ stage }) {
  const steps = [
    { title: "Extracting Text", description: "Converting document content..." },
    { title: "Analyzing Content", description: "Processing with AI models..." },
    { title: "Generating Summary", description: "Creating document insights..." },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg w-[550px] border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-5">Processing Your Document</h2>
      <p className="text-gray-500 mb-6 text-sm">Please wait while we analyze your document...</p>

      <div className="space-y-4">
        {steps.map((s, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 shadow-md
              ${stage > index ? "bg-green-50 border-l-4 border-green-500" : 
                stage === index ? "bg-blue-50 border-l-4 border-blue-500 animate-pulse" : 
                "bg-gray-100 border-l-4 border-gray-300 opacity-60"}`
            }
          >
            {stage > index ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : stage === index ? (
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <Loader2 className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <p className={`text-lg font-medium ${stage > index ? "text-green-700" : stage === index ? "text-blue-700" : "text-gray-600"}`}>
                {s.title}
              </p>
              <p className="text-sm text-gray-500">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
