import { useState, useRef } from 'react';
import { Upload, X, File, FileText, Image as ImageIcon, Music, Archive } from 'lucide-react';

const getFileIcon = (file) => {
  const type = file?.type || '';
  const name = file?.name || '';

  if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
  if (type.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(name)) return <Music className="w-4 h-4" />;
  if (type === 'application/pdf' || /\.pdf$/i.test(name)) return <FileText className="w-4 h-4" />;
  if (/\.(zip|rar|7z|tar|gz|bz2)$/i.test(name)) return <Archive className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const FileUploadComposer = ({
  attachmentDraft,
  setAttachmentDraft,
  onSendAttachment,
  sendLoading,
  isReadOnly,
  onClose
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const pickedFile = files[0];
      setAttachmentDraft((prev) => ({
        ...prev,
        file: pickedFile,
        name: prev.name || pickedFile.name
      }));
    }
  };

  const handleFileInputChange = (event) => {
    const pickedFile = event.target.files?.[0] || null;
    if (pickedFile) {
      setAttachmentDraft((prev) => ({
        ...prev,
        file: pickedFile,
        name: prev.name || pickedFile.name
      }));
    }
  };

  const handleClear = () => {
    setAttachmentDraft({ file: null, name: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!attachmentDraft.file) {
    return (
      <div
        className="max-w-4xl mx-auto mt-3 rounded-xl border-2 border-dashed border-[#31424d] bg-[#111b21] p-6 text-center transition-colors cursor-pointer hover:border-emerald-500/50 hover:bg-[#1a2630]"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isReadOnly}
        />

        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-full transition-colors ${dragActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#2a3942] text-[#8696a0]'}`}>
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#d1d7db]">
              {dragActive ? 'Drop your file here' : 'Drag and drop files or click to browse'}
            </p>
            <p className="text-xs text-[#8696a0] mt-1">
              Max file size: 15 MB • All file types supported
            </p>
          </div>
        </div>
      </div>
    );
  }

  const file = attachmentDraft.file;
  return (
    <div className="max-w-4xl mx-auto mt-3 rounded-xl border border-emerald-500/30 bg-emerald-50/5 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-[#2a3942] text-[#8696a0]">
          {getFileIcon(file)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#d1d7db] truncate">{file.name}</p>
              <p className="text-xs text-[#8696a0] mt-0.5">
                {formatFileSize(file.size)}
                {file.type && <span className="ml-2 opacity-75">• {file.type}</span>}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 p-1 rounded hover:bg-[#2a3942] text-[#8696a0] hover:text-[#d1d7db] transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3">
            <label className="text-xs text-[#8696a0] mb-1 block">Display name (optional)</label>
            <input
              type="text"
              value={attachmentDraft.name}
              onChange={(event) => setAttachmentDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Leave blank to use original name"
              className="w-full rounded-lg px-3 py-2 bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0] outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2 border-t border-[#31424d]">
        <button
          type="button"
          onClick={handleClear}
          disabled={sendLoading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2a3942] text-[#d1d7db] hover:bg-[#31424d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSendAttachment}
          disabled={!file || sendLoading || isReadOnly}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            !file || sendLoading || isReadOnly
              ? 'bg-[#1f2c34] text-[#54656f] cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
          }`}
        >
          {sendLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Send File</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUploadComposer;
