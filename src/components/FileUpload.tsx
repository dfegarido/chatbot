import { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileProcessed: (content: string, filename: string) => void;
}

export function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Check if file is a text file
    if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
      alert('Please upload a text file (.txt)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadedFile(file.name);
      onFileProcessed(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        {uploadedFile ? (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800 flex-1">
            <File className="w-4 h-4" />
            <span className="text-sm font-medium truncate">{uploadedFile}</span>
            <button
              onClick={handleClearFile}
              className="p-1 hover:bg-green-100 dark:hover:bg-green-800/50 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2 border-2 border-dashed rounded-lg p-3 flex-1 cursor-pointer transition-colors ${
              isDragOver
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <Upload className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Upload business info (.txt file) or drag & drop
            </span>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
