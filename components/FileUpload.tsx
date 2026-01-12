
import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-slate-400'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*,.pdf"
        className="hidden"
        disabled={isLoading}
      />
      
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl shadow-sm">
        <i className="fa-solid fa-cloud-arrow-up"></i>
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {isLoading ? 'Processing Document...' : 'Upload Bank Statement'}
      </h3>
      <p className="text-slate-500 max-w-xs mb-6">
        Drag and drop your statement image (JPG, PNG) or PDF here. Gemini 3 Pro will handle the OCR.
      </p>
      
      <button
        type="button"
        disabled={isLoading}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all active:scale-95 disabled:opacity-50"
      >
        Select File
      </button>
      
      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium">
          <i className="fa-solid fa-circle-notch fa-spin"></i>
          <span>Extracting data with AI...</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
