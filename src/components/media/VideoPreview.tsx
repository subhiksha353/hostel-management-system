import React, { useState } from 'react';
import { Play, X, Video } from 'lucide-react';
import { Modal } from '../ui/Modal';

export interface VideoPreviewProps {
  src: string;
  fileName?: string;
  onRemove?: () => void;
  className?: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  src,
  fileName,
  onRemove,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={`group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex flex-col items-center justify-center text-white ${className}`}>
        <Video className="w-8 h-8 text-blue-400 mb-1 opacity-80" />
        <span className="text-xs text-slate-300 font-medium px-2 text-center truncate max-w-[90%]">
          {fileName || 'Video Evidence'}
        </span>

        {/* Play trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold shadow transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Preview
        </button>

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 transition-all shadow"
            title="Remove Video"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="3xl" title={fileName || 'Video Evidence'}>
        <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center">
          <video src={src} controls autoPlay className="w-full max-h-[70vh] rounded-lg" />
        </div>
      </Modal>
    </>
  );
};
