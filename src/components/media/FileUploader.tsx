import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../../lib/utils';
import { ImagePreview } from './ImagePreview';
import { VideoPreview } from './VideoPreview';
import { AudioPlayer } from './AudioPlayer';

export interface UploadedAttachmentItem {
  file: File | Blob;
  file_name: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  file_size: number;
  preview_url: string;
}

export interface FileUploaderProps {
  attachments: UploadedAttachmentItem[];
  onChange: (items: UploadedAttachmentItem[]) => void;
  maxFiles?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  attachments,
  onChange,
  maxFiles = 6,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);

    const allowed = Array.from(files);
    if (attachments.length + allowed.length > maxFiles) {
      setErrorMsg(`You can attach up to ${maxFiles} items in total.`);
      return;
    }

    const newItems: UploadedAttachmentItem[] = [];

    allowed.forEach((file) => {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds 25 MB limit.`);
        return;
      }

      let file_type: 'image' | 'video' | 'audio' | 'document' = 'document';
      if (file.type.startsWith('image/')) file_type = 'image';
      else if (file.type.startsWith('video/')) file_type = 'video';
      else if (file.type.startsWith('audio/')) file_type = 'audio';

      const preview_url = URL.createObjectURL(file);
      newItems.push({
        file,
        file_name: file.name,
        file_type,
        file_size: file.size,
        preview_url,
      });
    });

    onChange([...attachments, ...newItems]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    processFiles(e.dataTransfer.files);
  };

  const removeItem = (index: number) => {
    const item = attachments[index];
    if (item.preview_url && item.preview_url.startsWith('blob:')) {
      URL.revokeObjectURL(item.preview_url);
    }
    onChange(attachments.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-sm">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-800">
          Upload Evidence / Photos / Videos / Docs
        </p>
        <p className="text-xs text-slate-500 mt-1 text-center">
          Drag & drop files here, or click to browse (Max 25 MB each)
        </p>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400 font-medium">
          <span>JPG, PNG</span>
          <span>•</span>
          <span>MP4, WebM</span>
          <span>•</span>
          <span>PDF, DOCX</span>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Previews Grid */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Attached Evidence ({attachments.length}/{maxFiles})
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {attachments.map((att, idx) => (
              <div key={idx}>
                {att.file_type === 'image' && (
                  <ImagePreview
                    src={att.preview_url}
                    fileName={att.file_name}
                    onRemove={() => removeItem(idx)}
                  />
                )}
                {att.file_type === 'video' && (
                  <VideoPreview
                    src={att.preview_url}
                    fileName={att.file_name}
                    onRemove={() => removeItem(idx)}
                  />
                )}
                {att.file_type === 'audio' && (
                  <div className="relative">
                    <AudioPlayer src={att.preview_url} fileName={att.file_name} />
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="absolute top-2 right-2 p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {att.file_type === 'document' && (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{att.file_name}</p>
                        <p className="text-[11px] text-slate-400">{formatFileSize(att.file_size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
