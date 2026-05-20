import { Check, CheckCheck, Play, Pause } from 'lucide-react';
import { useState } from 'react';
import MessageActions from './MessageActions';
import FileAttachment from './FileAttachment';

const MessageBubble = ({
  message,
  isMine,
  isFirstInGroup,
  isLastInGroup,
  formatMessageTime,
  isHighlighted,
  onReply,
  onForward,
  onDelete,
  onPreviewAttachment
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const [showActions, setShowActions] = useState(false);

  const bubbleShape = isFirstInGroup && isLastInGroup
    ? (isMine ? 'rounded-xl rounded-br-md' : 'rounded-xl rounded-bl-md')
    : isFirstInGroup
      ? (isMine ? 'rounded-t-xl rounded-bl-xl rounded-br-md' : 'rounded-t-xl rounded-br-xl rounded-bl-md')
      : isLastInGroup
        ? (isMine ? 'rounded-b-xl rounded-tl-xl rounded-tr-md' : 'rounded-b-xl rounded-tr-xl rounded-tl-md')
        : 'rounded-xl';

  const text = typeof message?.content === 'string' ? message.content : '';
  const timestamp = message?.createdAt ? formatMessageTime(message.createdAt) : '';
  const isRead = !!message?.isRead;
  const isVoiceMessage = message?.messageType === 'voice';

  const handlePlayPause = () => {
    if (!audioRef) return;

    if (isPlaying) {
      audioRef.pause();
      setIsPlaying(false);
    } else {
      audioRef.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Extract voice URL from attachments
  const voiceUrl = isVoiceMessage && Array.isArray(message?.attachments)
    ? message.attachments[0]?.url
    : null;

  return (
    <div
      className={`
        animate-[slideIn_0.2s_ease-out]
        group relative px-3 py-2 shadow-sm
        ${isMine ? 'bg-[#dcf8c6] text-slate-900' : 'bg-white text-slate-900'}
        ${isHighlighted ? 'ring-2 ring-emerald-400' : ''}
        ${bubbleShape}
      `}
    >
      {isVoiceMessage && voiceUrl ? (
        <div className="flex items-center gap-2">
          <audio
            ref={setAudioRef}
            src={voiceUrl}
            onEnded={handleAudioEnded}
            className="hidden"
          />
          <button
            type="button"
            onClick={handlePlayPause}
            className={`flex-shrink-0 p-2 rounded-full transition-colors ${
              isMine
                ? isPlaying ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                : isPlaying ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <span className="text-sm font-medium">{text}</span>
        </div>
      ) : (
        <p className="break-words text-[15px] leading-relaxed pr-12">{text}</p>
      )}

      {Array.isArray(message?.attachments) && message.attachments.length > 0 && !isVoiceMessage && (
        <div className="mt-3 space-y-2">
          {message.attachments.map((attachment, index) => (
            <FileAttachment
              key={`${message._id}-attachment-${index}`}
              attachment={attachment}
              onPreview={onPreviewAttachment}
              isMine={isMine}
            />
          ))}
        </div>
      )}

      <MessageActions
        message={message}
        isMine={isMine}
        onReply={onReply}
        onForward={onForward}
        onDelete={onDelete}
        isOpen={showActions}
        setIsOpen={setShowActions}
      />

      <div
        className={`
          absolute bottom-1 right-2 flex items-center gap-1
          text-[10px] ${isMine ? 'text-slate-600' : 'text-slate-500'}
        `}
      >
        <span>{timestamp}</span>
        {isMine && (
          isRead ? (
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          ) : (
            <Check className="w-3.5 h-3.5 text-slate-500" />
          )
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
