import React from 'react';
import { Mic, Square, Pause, Play, Trash2, AlertCircle } from 'lucide-react';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { Button } from '../ui/Button';
import { AudioPlayer } from './AudioPlayer';

export interface AudioRecorderProps {
  onAudioReady: (blob: Blob, url: string) => void;
  onAudioRemoved?: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, onAudioRemoved }) => {
  const {
    status,
    audioUrl,
    audioBlob,
    duration,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  } = useMediaRecorder();

  const handleStopAndSave = () => {
    stopRecording();
  };

  React.useEffect(() => {
    if (status === 'stopped' && audioBlob && audioUrl) {
      onAudioReady(audioBlob, audioUrl);
    }
  }, [status, audioBlob, audioUrl, onAudioReady]);

  const handleDiscard = () => {
    resetRecording();
    if (onAudioRemoved) onAudioRemoved();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Voice Note Evidence</h4>
            <p className="text-xs text-slate-500">Record a verbal grievance description (Up to 3 mins)</p>
          </div>
        </div>

        {status === 'recording' && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-full animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span className="text-xs font-bold text-rose-700 font-mono">{formatTimer(duration)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* State: IDLE */}
      {status === 'idle' && (
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-white rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-500 mb-3 text-center">
            Click to start voice recording using your device microphone
          </p>
          <Button
            type="button"
            onClick={startRecording}
            variant="primary"
            size="sm"
            leftIcon={<Mic className="w-4 h-4" />}
          >
            Start Recording
          </Button>
        </div>
      )}

      {/* State: RECORDING or PAUSED */}
      {(status === 'recording' || status === 'paused') && (
        <div className="bg-navy-900 text-white p-4 rounded-xl shadow-inner space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${status === 'recording' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-xs font-semibold text-slate-300 capitalize">{status}...</span>
            </div>
            <span className="font-mono text-lg font-bold text-blue-400">{formatTimer(duration)}</span>
          </div>

          {/* Sound wave visualizer simulation */}
          <div className="flex items-center justify-center gap-1.5 h-10 py-1">
            {[14, 28, 45, 60, 30, 80, 65, 40, 75, 90, 50, 35, 70, 45, 20].map((h, idx) => (
              <div
                key={idx}
                className="w-1.5 bg-blue-500 rounded-full transition-all duration-150"
                style={{
                  height: status === 'recording' ? `${Math.max(8, (h * (Math.sin(Date.now() / 200 + idx) + 1.2)) / 2)}px` : '6px',
                  opacity: status === 'recording' ? 0.9 : 0.4,
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            {status === 'recording' ? (
              <Button
                type="button"
                onClick={pauseRecording}
                variant="secondary"
                size="sm"
                leftIcon={<Pause className="w-3.5 h-3.5" />}
              >
                Pause
              </Button>
            ) : (
              <Button
                type="button"
                onClick={resumeRecording}
                variant="secondary"
                size="sm"
                leftIcon={<Play className="w-3.5 h-3.5" />}
              >
                Resume
              </Button>
            )}

            <Button
              type="button"
              onClick={handleStopAndSave}
              variant="danger"
              size="sm"
              leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
            >
              Stop & Attach
            </Button>
          </div>
        </div>
      )}

      {/* State: STOPPED (Attached) */}
      {status === 'stopped' && audioUrl && (
        <div className="space-y-3">
          <AudioPlayer src={audioUrl} fileName="Recorded Grievance Voice Note" />
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="text-emerald-700 font-medium">✓ Ready for submission</span>
            <button
              type="button"
              onClick={handleDiscard}
              className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete & Re-record
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
