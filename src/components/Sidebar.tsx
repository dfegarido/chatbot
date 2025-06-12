import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, FileText, Trash2, Eye, UploadCloud } from 'lucide-react';
import { cn } from '@/utils';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  size: number;
  uploadedAt: Date;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load default business information files on component mount
  useEffect(() => {
    const loadDefaultFiles = async () => {
      try {
        const defaultFiles = [
          '/src/docs/CUPCAKE_LAB_BUSINESS_INFO.txt',
          '/src/docs/CUPCAKE_LAB_DETAILED_PRICING.txt'
        ];
        
        const loadedFiles: UploadedFile[] = [];
        
        for (const filePath of defaultFiles) {
          try {
            const response = await fetch(filePath);
            if (response.ok) {
              const content = await response.text();
              const fileName = filePath.split('/').pop() || 'default.txt';
              
              const file: UploadedFile = {
                id: crypto.randomUUID(),
                name: fileName,
                content,
                size: content.length,
                uploadedAt: new Date()
              };
              
              loadedFiles.push(file);
            }
          } catch (error) {
            console.warn(`Could not load default file: ${filePath}`, error);
          }
        }
        
        if (loadedFiles.length > 0) {
          setUploadedFiles(loadedFiles);
          updateBusinessInfo(loadedFiles);
        }
      } catch (error) {
        console.warn('Error loading default business files:', error);
      }
    };
    
    loadDefaultFiles();
  }, []);

  // Update business info in global window object whenever files change
  const updateBusinessInfo = useCallback((files: UploadedFile[]) => {
    const combinedContent = files
      .map(file => `=== ${file.name} ===\n${file.content}`)
      .join('\n\n');
    
    (window as any).__businessInfo = combinedContent;
  }, []);

  const handleFileUpload = async (files: FileList) => {
    const textFiles = Array.from(files).filter(file => 
      file.type === 'text/plain' || file.name.endsWith('.txt')
    );

    if (textFiles.length === 0) {
      alert('Please upload only .txt files');
      return;
    }

    const newFiles: UploadedFile[] = [];
    
    for (const file of textFiles) {
      const content = await file.text();
      const newFile: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        content,
        size: file.size,
        uploadedAt: new Date()
      };
      newFiles.push(newFile);
    }

    const updatedFiles = [...uploadedFiles, ...newFiles];
    setUploadedFiles(updatedFiles);
    updateBusinessInfo(updatedFiles);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
      setUploadedFiles(updatedFiles);
      updateBusinessInfo(updatedFiles);
      if (previewFile?.id === fileId) {
        setPreviewFile(null);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900",
        "border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Business Files
          </h2>
          
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              isDragActive
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Drop .txt files here or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Upload business information files
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files);
              }
            }}
            className="hidden"
          />
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2">
          {uploadedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mb-4" />
              <p className="text-sm text-center">No files uploaded yet.<br />Add business information files!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-500 transition-all"
                        title="Preview file"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 transition-all"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
      </aside>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {previewFile.name}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                {previewFile.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
