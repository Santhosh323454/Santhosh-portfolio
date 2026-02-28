import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, FileVideo, FileText, Image as ImageIcon, X } from 'lucide-react';
import { uploadFile } from '../../services/uploadService';
import { CURRENT_VERSION } from '../ThemeContext';

export default function FileUploader({
    label,
    value,
    onChange,
    type = 'image', // 'image' or 'pdf'
    folderName = 'uploads',
    className = ""
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = async (file) => {
        if (!file) return;

        // Basic validation
        if (type === 'image' && !file.type.startsWith('image/')) {
            setError("Please select a valid image file.");
            return;
        }
        if (type === 'pdf' && file.type !== 'application/pdf') {
            setError("Please select a valid PDF file.");
            return;
        }

        setError(null);
        setIsUploading(true);
        setProgress(0);

        try {
            // Unified Cloudinary Setup
            let secureUrl = await uploadFile(file, folderName, setProgress);

            setError(null); // Explicitly clear any lingering errors on success
            onChange(secureUrl);
            setIsUploading(false);
        } catch (err) {
            setError(typeof err === 'string' ? err : err.message || "Upload failed. Please try again.");
            setIsUploading(false);
            setProgress(0);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const clearPreview = (e) => {
        e.stopPropagation();
        onChange('');
        setProgress(0);
    };

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <label className="text-sm font-bold text-brand-dark dark:text-white">{label}</label>

            <div
                className={`relative group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[24px] transition-all duration-300 cursor-pointer overflow-hidden
                    ${isDragging ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-orange-200 dark:border-orange-800 bg-white/50 dark:bg-brand-darkcard/50 hover:bg-orange-50 dark:hover:bg-orange-900/10'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={type === 'image' ? "image/*" : "application/pdf"}
                    onChange={handleFileSelect}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center w-full px-4 py-2">
                        <UploadCloud className="w-8 h-8 text-orange-500 animate-bounce mb-3" />
                        <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-orange-600">{progress}% Uploading...</span>
                    </div>
                ) : value && type === 'image' ? (
                    <div className="relative w-full aspect-video md:aspect-auto md:h-32 flex items-center justify-center rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src={value.startsWith('http') ? value : `${value}?v=${CURRENT_VERSION}`} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-sm font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Click to Replace</span>
                        </div>
                        <button onClick={clearPreview} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm z-10">
                            <X size={14} />
                        </button>
                    </div>
                ) : value && type === 'pdf' ? (
                    <div className="flex items-center justify-center gap-3 w-full py-4 bg-green-50 dark:bg-green-900/20 rounded-xl relative">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <span className="text-sm font-bold text-green-700 dark:text-green-400">PDF Uploaded Successfully</span>
                        <button onClick={clearPreview} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm z-10">
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center py-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-3 text-orange-500">
                            {type === 'image' ? <ImageIcon size={24} /> : <FileText size={24} />}
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {type === 'image' ? 'SVG, PNG, JPG (max 5MB)' : 'PDF only (max 10MB)'}
                        </p>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
        </div>
    );
}
