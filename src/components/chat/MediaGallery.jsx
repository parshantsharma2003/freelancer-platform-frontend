import { Image as ImageIcon, FileText, X } from 'lucide-react';

const isImageAttachment = (attachment) => {
  const type = (attachment?.type || '').toLowerCase();
  const url = (attachment?.url || '').toLowerCase();
  return type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/.test(url);
};

const MediaGallery = ({ mediaItems, isOpen, onClose, onPreview }) => {
  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-[320px] border-l border-[#202c33] bg-[#111b21] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#202c33]">
        <h3 className="text-sm font-semibold text-[#e9edef]">Media & Files</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[#202c33] text-[#aebac1]"
          aria-label="Close media gallery"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {mediaItems.length === 0 ? (
          <p className="text-sm text-[#8696a0] text-center mt-8">No shared media yet</p>
        ) : (
          mediaItems.map((item) => {
            const isImage = isImageAttachment(item.attachment);
            const name = item.attachment?.name || 'Attachment';

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onPreview(item.attachment)}
                className="w-full p-3 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-left transition-colors"
              >
                {isImage ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={item.attachment.url}
                      alt={name}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-[#d1d7db] truncate">{name}</p>
                      <p className="text-xs text-[#8696a0]">Image</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-[#2a3942] flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#aebac1]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-[#d1d7db] truncate">{name}</p>
                      <p className="text-xs text-[#8696a0]">File</p>
                    </div>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default MediaGallery;
