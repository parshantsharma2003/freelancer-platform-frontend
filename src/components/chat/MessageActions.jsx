import { useRef, useEffect } from 'react';
import { 
  Copy, 
  MessageCircle, 
  Share2, 
  Trash2, 
  MoreVertical 
} from 'lucide-react';

const MessageActions = ({
  message,
  isMine,
  onReply,
  onForward,
  onDelete,
  isOpen,
  setIsOpen,
  position
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  const handleCopy = () => {
    const text = message?.content || '';
    navigator.clipboard.writeText(text).then(() => {
      setIsOpen(false);
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="opacity-0 group-hover:opacity-100 absolute top-0 right-0 p-1 rounded-lg transition-opacity"
        aria-label="Message actions"
      >
        <MoreVertical className="w-4 h-4 text-slate-500" />
      </button>
    );
  }

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full mb-2 right-0 bg-[#202c33] border border-[#31424d] rounded-lg shadow-lg z-50 min-w-max"
      style={{
        top: position?.y ? `${position.y}px` : 'auto',
        left: position?.x ? `${position.x}px` : 'auto'
      }}
    >
      <div className="p-1">
        {/* Copy */}
        <button
          type="button"
          onClick={handleCopy}
          className="w-full px-4 py-2 text-sm text-[#d1d7db] hover:bg-[#2a3942] rounded-md flex items-center gap-2 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>

        {/* Reply */}
        <button
          type="button"
          onClick={() => {
            onReply(message);
            setIsOpen(false);
          }}
          className="w-full px-4 py-2 text-sm text-[#d1d7db] hover:bg-[#2a3942] rounded-md flex items-center gap-2 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Reply
        </button>

        {/* Forward */}
        <button
          type="button"
          onClick={() => {
            onForward(message);
            setIsOpen(false);
          }}
          className="w-full px-4 py-2 text-sm text-[#d1d7db] hover:bg-[#2a3942] rounded-md flex items-center gap-2 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Forward
        </button>

        {/* Delete for me (only for sender) */}
        {isMine && (
          <button
            type="button"
            onClick={() => {
              onDelete(message._id);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-600/20 rounded-md flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete for me
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageActions;
