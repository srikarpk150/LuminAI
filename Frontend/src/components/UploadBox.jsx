import { useDropzone } from "react-dropzone";
import { CloudUpload } from "lucide-react";

export default function UploadBox({ onUpload }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"], 
      "audio/mpeg": [".mp3"], 
      "audio/wav": [".wav"], 
      "text/plain": [".txt"], 
      "image/jpeg": [".jpeg", ".jpg"], 
      "image/png": [".png"]
    },
    onDrop: (acceptedFiles) => onUpload(acceptedFiles[0]),
  });

  return (
    <div 
      {...getRootProps()} 
      className="border-2 border-[#0077ff] border-dashed p-12 text-center cursor-pointer rounded-xl 
      bg-white bg-opacity-50 shadow-xl w-[500px] backdrop-blur-lg hover:bg-opacity-70 transition-all"
    >
      <input {...getInputProps()} />
      <CloudUpload className="w-16 h-16 text-[#0077ff] mx-auto drop-shadow-md" />
      
      <p className="mt-4 text-xl font-semibold text-[#0077ff]">Drag & drop your file here</p>
      <p className="text-[#444] text-lg">or click to browse</p>

      <button 
        className="mt-6 px-6 py-3 bg-[#0077ff] text-white text-lg rounded-xl shadow-lg 
        hover:bg-[#005fcc] transition-all neon-button"
      >
        Choose File
      </button>

      <p className="text-md text-[#0077ff] mt-4 opacity-80">
        Supported formats: PDF, MP3, TXT, JPG, JPEG, PNG
      </p>
    </div>
  );
}
