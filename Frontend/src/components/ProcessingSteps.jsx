import { CheckCircle, Loader2 } from "lucide-react";

export default function ProcessingSteps({ stage }) {
  const steps = [
    { title: "Extracting Text", description: "Converting document content..." },
    { title: "Analyzing Content", description: "Processing with AI models..." },
    { title: "Generating Summary", description: "Creating document insights..." },
  ];

  return (
    <div className="p-6 bg-white bg-opacity-70 rounded-xl shadow-xl w-[550px] border border-[#0077ff] backdrop-blur-lg">
      <h2 className="text-2xl font-bold text-[#0077ff] mb-5">Processing Your Document</h2>
      <p className="text-[#0077ff] opacity-80 mb-6 text-sm">Please wait while we analyze your document...</p>

      <div className="space-y-4">
        {steps.map((s, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 shadow-md
              ${
                stage > index 
                  ? "bg-[#d7ebff] bg-opacity-90 border-l-4 border-[#0077ff] text-[#0077ff] neon-glow"
                  : stage === index 
                  ? "bg-[#e6f7ff] bg-opacity-80 border-l-4 border-[#66b2ff] animate-pulse text-[#005fcc]"
                  : "bg-[#f0f8ff] bg-opacity-50 border-l-4 border-[#a1c9ff] opacity-60 text-[#444]"
              }`
            }
          >
            {stage > index ? (
              <CheckCircle className="w-6 h-6 text-[#0077ff] drop-shadow-md" />
            ) : stage === index ? (
              <Loader2 className="w-6 h-6 text-[#66b2ff] animate-spin drop-shadow-md" />
            ) : (
              <Loader2 className="w-6 h-6 text-[#a1c9ff]" />
            )}
            <div>
              <p className={`text-lg font-medium`}>
                {s.title}
              </p>
              <p className="text-sm opacity-80">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
