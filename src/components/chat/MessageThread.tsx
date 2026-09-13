import React, { useRef, useEffect } from 'react';
import { ComplaintMessage } from '../../types/database';
import { ShieldCheck, UserCheck, CheckCheck } from 'lucide-react';
import { formatDateRelative } from '../../lib/utils';
import { MessageComposer } from './MessageComposer';

export interface MessageThreadProps {
  messages: ComplaintMessage[];
  currentUserRole: string;
  anonymousPublicId: string;
  onSendMessage: (text: string) => Promise<void>;
  className?: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserRole,
  anonymousPublicId,
  onSendMessage,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isStudent = currentUserRole === 'student';
  const senderLabel = isStudent ? anonymousPublicId : 'Campus Administration';

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">Direct Two-Way Communication</h4>
            <p className="text-[11px] text-slate-500">
              Identity protected • Messages received directly by assigned officers
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
          Live Realtime
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/40">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <UserCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600">No messages in this grievance thread yet.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Send a message below to provide updates or ask questions.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = isStudent ? msg.sender_role === 'student' : msg.sender_role !== 'student';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400 font-medium">
                  <span>{isMe ? 'You' : msg.sender_display_name}</span>
                  <span>•</span>
                  <span>{formatDateRelative(msg.created_at)}</span>
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>

                {isMe && (
                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-400">
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                    <span>Delivered</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Message Composer */}
      <MessageComposer
        onSendMessage={onSendMessage}
        placeholder={isStudent ? 'Send update as ' + anonymousPublicId + '...' : 'Reply to student grievance...'}
        senderLabel={senderLabel}
      />
    </div>
  );
};
