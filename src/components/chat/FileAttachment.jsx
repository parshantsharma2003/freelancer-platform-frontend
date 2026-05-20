import { Download, File, FileText, FileArchive, FileVideo, FileAudio, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { uploadAPI } from '../../services/api';

// File type detection
const getFileType = (attachment) => {
  const mimeType = (attachment?.type || '').toLowerCase();
  const fileName = (attachment?.name || '').toLowerCase();
  const url = (attachment?.url || '').toLowerCase();

  // Image
  if (mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp|tiff)$/i.test(fileName)) {
    return 'image';
  }

  // Video
  if (mimeType.startsWith('video/') || /\.(mp4|mpeg|mov|avi|mkv|webm|3gp)$/i.test(fileName)) {
    return 'video';
  }

  // Audio
  if (mimeType.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac|m4a|webm)$/i.test(fileName)) {
    return 'audio';
  }

  // PDF
  if (mimeType === 'application/pdf' || /\.pdf$/i.test(fileName)) {
    return 'pdf';
  }

  // Documents
  if (/\.(doc|docx|txt|rtf)$/i.test(fileName) || mimeType.includes('word') || mimeType.includes('document') || mimeType === 'text/plain') {
    return 'document';
  }

  // Spreadsheets
  if (/\.(xls|xlsx|csv)$/i.test(fileName) || mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    return 'spreadsheet';
  }

  // Presentations
  if (/\.(ppt|pptx)$/i.test(fileName) || mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return 'presentation';
  }

  // Archives
  if (/\.(zip|rar|7z|tar|gz|bz2)$/i.test(fileName) || mimeType.includes('archive') || mimeType.includes('compressed')) {
    return 'archive';
  }

  // Code
  if (/\.(js|ts|py|java|cpp|c|cs|php|rb|go|rust|html|css|json|xml|sql)$/i.test(fileName)) {
    return 'code';
  }

  return 'file';
};

const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image':
      return <ImageIcon className="w-6 h-6" />;
    case 'video':
      return <FileVideo className="w-6 h-6" />;
    case 'audio':
      return <FileAudio className="w-6 h-6" />;
    case 'pdf':
      return <FileText className="w-6 h-6" />;
    case 'archive':
      return <FileArchive className="w-6 h-6" />;
    case 'document':
    case 'spreadsheet':
    case 'presentation':
    case 'code':
      return <FileText className="w-6 h-6" />;
    default:
      return <File className="w-6 h-6" />;
  }
};

const getFileColor = (fileType) => {
  switch (fileType) {
    case 'image':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'video':
      return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'audio':
      return 'bg-pink-50 text-pink-600 border-pink-200';
    case 'pdf':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'archive':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'document':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'spreadsheet':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'presentation':
      return 'bg-orange-50 text-orange-600 border-orange-200';
    case 'code':
      return 'bg-gray-50 text-gray-600 border-gray-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const FileAttachment = ({ attachment, onPreview, isMine = false }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const name = attachment?.name || 'attachment';
  const url = attachment?.url;
  const size = attachment?.size;
  const uploadedAt = attachment?.uploadedAt;
  const fileType = getFileType(attachment);
  const isImage = fileType === 'image';
  const colorClass = getFileColor(fileType);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Extract relative file path from the URL
      // URL format: http://localhost:5001/uploads/chat/2026/05/filename
      // or http://localhost/uploads/chat/2026/05/filename
      const urlObj = new URL(url, window.location.origin);
      const pathname = urlObj.pathname; // /uploads/chat/2026/05/filename
      const uploadIndex = pathname.indexOf('/uploads/');
      
      if (uploadIndex === -1) {
        throw new Error('Invalid file URL format');
      }

      // Extract "chat/2026/05/filename" from "/uploads/chat/2026/05/filename"
      const relativeFilePath = pathname.substring(uploadIndex + 1); // "uploads/chat/2026/05/filename"
      const filePath = relativeFilePath.replace('uploads/', 'chat/'); // "chat/2026/05/filename"

      console.log('Downloading file:', { url, relativeFilePath, filePath });

      // Call download API with encoded path
      const response = await uploadAPI.downloadChatFile(filePath);

      // Create blob and download
      const blob = new Blob([response.data], {
        type: attachment?.type || 'application/octet-stream'
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = name || 'file';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
    } catch (error) {
      console.error('Download error:', { error, url, name });
      setDownloadError('Failed to download file');
      setTimeout(() => setDownloadError(null), 3000);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!url) return null;

  if (isImage) {
    return (
      <button
        type="button"
        onClick={() => onPreview?.(attachment)}
        className="relative group w-full text-left"
      >
        <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={url}
            alt={name}
            className="w-full max-h-48 object-cover"
          />
          <div className="px-3 py-2 bg-white border-t border-slate-200">
            <p className="text-xs font-medium text-slate-800 truncate">{name}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[11px] text-slate-600">{formatFileSize(size)}</p>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPreview?.(attachment)}
      className="w-full text-left group"
    >
      <div className={`rounded-lg border px-3 py-3 flex items-start gap-3 transition-colors hover:bg-opacity-50 ${colorClass}`}>
        <div className="flex-shrink-0 mt-1">
          {getFileIcon(fileType)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{name}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs opacity-75">{formatFileSize(size)}</p>
            {uploadedAt && (
              <>
                <span className="text-xs opacity-50">•</span>
                <p className="text-xs opacity-75">{formatTime(uploadedAt)}</p>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading || downloadError}
          className={`flex-shrink-0 p-2 rounded-lg transition-all ${
            isDownloading
              ? 'opacity-50 cursor-not-allowed'
              : downloadError
              ? 'bg-red-100 text-red-600'
              : 'hover:bg-black/10 text-current'
          }`}
          aria-label="Download file"
        >
          {downloadError ? (
            <AlertCircle className="w-4 h-4" />
          ) : isDownloading ? (
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>
      </div>

      {downloadError && (
        <div className="mt-1 text-xs text-red-600 px-1">
          {downloadError}
        </div>
      )}
    </button>
  );
};

export default FileAttachment;
