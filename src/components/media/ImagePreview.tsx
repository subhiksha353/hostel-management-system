import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { Modal } from '../ui/Modal';

export interface ImagePreviewProps {
  src: string;
  alt?: string;
  fileName?: string;
  onRemove?: () => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'Evidence preview',
  fileName,
  onRemove,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center ${className}`}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
        
        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 bg-navy-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white transition-all shadow"
            title="View Fullscreen"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all shadow"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {fileName && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[11px] text-white truncate font-medium">
            {fileName}
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="3xl" title={fileName || 'Evidence Photo'}>
        <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[75vh]">
          <img src={src} alt={alt} className="max-h-[75vh] w-auto object-contain" />
        </div>
      </Modal>
    </>
  );
};
