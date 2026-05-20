import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Trash2 } from 'lucide-react';

const VoiceRecorder = ({ onSend, disabled, isLoading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!isRecording) return;

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    };

    startTimer();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio({
          blob: audioBlob,
          url: audioUrl,
          duration
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (!audioRef.current || !recordedAudio) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const onAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleSend = () => {
    if (!recordedAudio || isLoading) return;

    onSend({
      blob: recordedAudio.blob,
      fileName: `voice-${Date.now()}.wav`,
      mimeType: recordedAudio.blob?.type || 'audio/wav',
      durationSeconds: recordedAudio.duration,
      durationLabel: formatTime(recordedAudio.duration),
      content: `Voice message (${formatTime(recordedAudio.duration)})`
    });

    if (recordedAudio?.url) {
      URL.revokeObjectURL(recordedAudio.url);
    }

    // Reset after sending
    setRecordedAudio(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const handleDiscard = () => {
    if (recordedAudio?.url) {
      URL.revokeObjectURL(recordedAudio.url);
    }
    setRecordedAudio(null);
    setDuration(0);
    setIsPlaying(false);
  };

  // Recording mode
  if (isRecording) {
    return (
      <div className="flex items-center justify-between gap-3 bg-[#2a3942] rounded-xl px-4 py-3 border border-[#31424d]">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#d1d7db]">Recording</span>
          </div>
          <span className="text-sm text-[#8696a0]">{formatTime(duration)}</span>
        </div>

        <button
          type="button"
          onClick={stopRecording}
          className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
          aria-label="Stop recording"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Playback mode (after recording)
  if (recordedAudio) {
    return (
      <div className="flex items-center justify-between gap-3 bg-[#2a3942] rounded-xl px-4 py-3 border border-[#31424d]">
        <audio
          ref={audioRef}
          src={recordedAudio.url}
          onEnded={onAudioEnded}
          className="hidden"
        />

        <button
          type="button"
          onClick={playRecording}
          className={`p-2 rounded-full transition-colors ${
            isPlaying ? 'bg-emerald-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <Mic className="w-4 h-4" />
        </button>

        <span className="text-sm text-[#d1d7db]">{formatTime(recordedAudio.duration)}</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDiscard}
            className="p-2 rounded-full bg-red-600/30 text-red-400 hover:bg-red-600/50 transition-colors"
            aria-label="Discard recording"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isLoading ? 'bg-[#1f2c34] text-[#54656f] cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
            aria-label="Send voice message"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Initial state (no recording)
  return null;
};

export default VoiceRecorder;
