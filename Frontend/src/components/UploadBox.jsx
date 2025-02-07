import { useDropzone } from "react-dropzone";
import { CloudUpload } from "lucide-react";

export default function UploadBox({ onUpload }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
        "application/pdf": [".pdf"],                // PDF Files
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],  // Excel Files
        "audio/mpeg": [".mp3"],                      // MP3 Audio
        "audio/wav": [".wav"],                      // WAV Audio
        "text/plain": [".txt"],                      // Text Files
        "image/jpeg": [".jpeg", ".jpg"],            // JPEG/JPG Images
        "image/png": [".png"],                      // PNG Images
      },
    onDrop: (acceptedFiles) => onUpload(acceptedFiles[0]),
  });

  return (
    <div {...getRootProps()} className="border-4 border-dashed p-12 text-center cursor-pointer rounded-xl bg-white shadow-lg w-[500px]">
      <input {...getInputProps()} />
      <CloudUpload className="w-16 h-16 text-blue-500 mx-auto" />
      <p className="mt-4 text-xl font-semibold">Drag & drop your file here</p>
      <p className="text-gray-500 text-lg">or click to browse</p>
      <button className="mt-6 px-6 py-3 bg-blue-500 text-white text-lg rounded-xl">Choose File</button>
      <p className="text-md text-gray-400 mt-4">Supported formats: PDF, XLSX, MP3, TXT</p>
    </div>
  );
}
