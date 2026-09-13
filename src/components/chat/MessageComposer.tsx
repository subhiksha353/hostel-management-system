import React, { useState } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface MessageComposerProps {
  onSendMessage: (text: string) => Promise<void>;
  placeholder?: string;
  senderLabel?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  placeholder = 'Type an anonymous message...',
  senderLabel,
}) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(text.trim());
      setText('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200/80 p-3 sm:p-4 bg-white rounded-b-2xl">
      {senderLabel && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1">
          <span>
            Replying as: <strong className="text-slate-700 font-semibold">{senderLabel}</strong>
          </span>
          <span className="text-emerald-600 font-medium">🔒 Encrypted Anonymous Channel</span>
        </div>
      )}

      <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          className="flex-1 bg-transparent text-xs sm:text-sm border-none focus:outline-none resize-none p-1.5 placeholder:text-slate-400"
        />

        <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!text.trim() || isSending}
            isLoading={isSending}
            className="rounded-xl px-3.5"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
