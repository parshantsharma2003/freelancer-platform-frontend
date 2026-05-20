import { uploadAPI } from "../services/api";

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const normalizeAssetType = (assetType) => {
  if (assetType === "voice") return "voice";
  if (assetType === "image") return "image";
  return "file";
};

export const uploadChatAsset = async ({ file, assetType = "file", fileName, mimeType }) => {
  if (!file) {
    throw new Error("File is required for upload");
  }

  const resolvedMimeType = mimeType || file.type || "application/octet-stream";
  const resolvedName = fileName || file.name || `asset-${Date.now()}`;
  const dataUrl = await blobToDataUrl(file);

  const response = await uploadAPI.uploadChatAsset({
    dataUrl,
    fileName: resolvedName,
    mimeType: resolvedMimeType,
    assetType: normalizeAssetType(assetType)
  });

  const payload = response?.data?.data;
  if (!payload?.url) {
    throw new Error("Upload failed: no URL returned");
  }

  return {
    name: payload.fileName || resolvedName,
    url: payload.url,
    type: payload.mimeType || resolvedMimeType,
    size: payload.size || file.size || 0,
    uploadedAt: payload.uploadedAt || new Date().toISOString()
  };
};
