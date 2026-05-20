import { X, Download } from 'lucide-react';

const isImageAttachment = (attachment) => {
  const type = (attachment?.type || '').toLowerCase();
  const url = (attachment?.url || '').toLowerCase();
  return type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(url);
};

const MediaPreviewModal = ({ attachment, onClose }) => {
  if (!attachment) return null;

  const isImage = isImageAttachment(attachment);
  const name = attachment?.name || 'Attachment';

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <a
          href={attachment.url}
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Download attachment"
        >
          <Download className="w-5 h-5" />
        </a>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-5xl w-full max-h-[85vh] bg-[#111b21] rounded-xl border border-[#31424d] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#31424d]">
          <p className="text-sm text-[#d1d7db] truncate">{name}</p>
        </div>
        <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto">
          {isImage ? (
            <img src={attachment.url} alt={name} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
          ) : (
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Open file
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal;
