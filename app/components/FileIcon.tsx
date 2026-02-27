import { FileText, FileImage, FileArchive, FileVideo, FileAudio, FileSpreadsheet, Presentation } from "lucide-react";

export default function FileIcon({ filename, className = "w-6 h-6" }: { filename: string, className?: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  switch(ext) {
    case 'pdf': return <FileText className={`${className} text-red-500`} />;
    case 'doc': case 'docx': return <FileText className={`${className} text-blue-500`} />;
    case 'xls': case 'xlsx': case 'csv': return <FileSpreadsheet className={`${className} text-green-500`} />;
    case 'ppt': case 'pptx': return <Presentation className={`${className} text-orange-500`} />;
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': return <FileImage className={`${className} text-purple-400`} />;
    case 'zip': case 'rar': case '7z': return <FileArchive className={`${className} text-yellow-600`} />;
    case 'mp4': case 'avi': case 'mov': return <FileVideo className={`${className} text-pink-500`} />;
    case 'mp3': case 'wav': return <FileAudio className={`${className} text-cyan-400`} />;
    default: return <FileText className={`${className} text-cyanBright`} />;
  }
}