import { useState } from "react";
import { milestoneAPI } from "../../services/api";
import { uploadChatAsset } from "../../lib/uploadHelper";

const SubmitWorkModal = ({ milestone, onClose, refresh }) => {

  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addAttachment = async (file) => {
    if (!file) return;

    const uploaded = await uploadChatAsset({ file, assetType: "file" });
    setAttachments((prev) => [
      ...prev,
      {
        name: uploaded.name || file.name,
        url: uploaded.url,
        type: uploaded.type || file.type,
        size: uploaded.size || file.size
      }
    ]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {

      await milestoneAPI.submitWork(milestone._id, {
        description,
        attachments
      });

      refresh();
      onClose();

    } catch (error) {
      setError(error.response?.data?.message || "Submission failed");

    }

    setLoading(false);
  };

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-lg w-[500px]">

        <h2 className="text-xl font-bold mb-4">
          Submit Work
        </h2>

        <p className="text-sm text-gray-500 mb-3">
          Milestone: {milestone.title}
        </p>

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}

        <textarea
          className="border w-full p-2 mb-3"
          placeholder="Describe the work you completed or link progress notes..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          className="border w-full p-2 mb-2"
          onChange={(e) => addAttachment(e.target.files?.[0])}
        />

        {attachments.length > 0 && (
          <div className="mb-4 space-y-1 text-xs text-gray-600">
            {attachments.map((attachment, index) => (
              <a
                key={`${attachment.url}-${index}`}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="block underline break-all"
              >
                {attachment.name}
              </a>
            ))}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Submitting..." : "Submit Work"}
        </button>

        <button
          onClick={onClose}
          className="mt-3 text-gray-500 w-full"
        >
          Cancel
        </button>

      </div>

    </div>
  );
};

export default SubmitWorkModal;