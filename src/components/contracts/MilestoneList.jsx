import { useEffect, useState } from "react";
import { disputeAPI, milestoneAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { uploadChatAsset } from "../../lib/uploadHelper";
import FundMilestoneModal from "../payments/FundMilestoneModal";
import SubmitWorkModal from "./SubmitWorkModal";

const MilestoneList = ({ milestones = [], refresh, contractId, contractStatus }) => {
  const { user } = useAuth();
  const [items, setItems] = useState(milestones);
  const [draggingId, setDraggingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    amount: "",
    dueDate: ""
  });
  const [commentDraft, setCommentDraft] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fundingMilestone, setFundingMilestone] = useState(null);
  const [submittingMilestone, setSubmittingMilestone] = useState(null);
  const [reviewDraft, setReviewDraft] = useState({});
  const [disputeDraft, setDisputeDraft] = useState({});

  useEffect(() => {
    setItems([...milestones].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)));
  }, [milestones]);

  const canMutateMilestones = user?.role === "client" && contractStatus === "active";
  const canReorder = canMutateMilestones && items.every((item) => !item?.escrow?.isHeld);

  const runAction = async (fn) => {
    try {
      setError("");
      setBusy(true);
      await fn();
      await refresh();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteMilestone = async (milestoneId) => {
    await runAction(async () => {
      await milestoneAPI.deleteMilestone(milestoneId);
    });
  };

  const startWork = async (milestoneId) => {
    await runAction(async () => {
      await milestoneAPI.startWork(milestoneId);
    });
  };

  const approveMilestone = async (milestoneId) => {
    const feedback = String(reviewDraft[milestoneId] || "").trim();
    await runAction(async () => {
      const approvalResponse = await milestoneAPI.approveMilestone(milestoneId, {
        feedback,
        revisionRequested: false
      });
      if (!approvalResponse?.data?.data?.requiresRevision) {
        await milestoneAPI.releasePayment(milestoneId);
      }
      setReviewDraft((prev) => ({ ...prev, [milestoneId]: "" }));
    });
  };

  const requestChanges = async (milestoneId) => {
    const revisionNotes = String(reviewDraft[milestoneId] || "").trim();
    if (!revisionNotes) return;

    await runAction(async () => {
      await milestoneAPI.approveMilestone(milestoneId, {
        feedback: revisionNotes,
        revisionRequested: true,
        revisionNotes
      });
      setReviewDraft((prev) => ({ ...prev, [milestoneId]: "" }));
    });
  };

  const raiseDispute = async (milestone) => {
    const reason = String(disputeDraft[milestone._id]?.reason || "").trim();
    const description = String(disputeDraft[milestone._id]?.description || "").trim();

    if (!reason) return;

    await runAction(async () => {
      await disputeAPI.raiseDispute({
        contractId,
        reason,
        description: description || `Dispute raised for milestone: ${milestone.title}`
      });
      setDisputeDraft((prev) => ({ ...prev, [milestone._id]: { reason: "", description: "" } }));
    });
  };

  const beginEdit = (milestone) => {
    setEditingId(milestone._id);
    setEditForm({
      title: milestone.title || "",
      description: milestone.description || "",
      amount: milestone.amount || "",
      dueDate: milestone.dueDate ? new Date(milestone.dueDate).toISOString().slice(0, 10) : ""
    });
  };

  const saveEdit = async (milestoneId) => {
    await runAction(async () => {
      await milestoneAPI.updateMilestone(milestoneId, {
        ...editForm,
        amount: Number(editForm.amount)
      });
      setEditingId(null);
    });
  };

  const addComment = async (milestoneId) => {
    const content = String(commentDraft[milestoneId] || "").trim();
    if (!content) return;

    await runAction(async () => {
      await milestoneAPI.addComment(milestoneId, { content });
      setCommentDraft((prev) => ({ ...prev, [milestoneId]: "" }));
    });
  };

  const uploadAttachment = async (milestoneId, file) => {
    if (!file) return;

    await runAction(async () => {
      const uploaded = await uploadChatAsset({ file, assetType: "file" });
      await milestoneAPI.addAttachment(milestoneId, uploaded);
    });
  };

  const onDropMilestone = async (targetId) => {
    if (!canReorder || !draggingId || draggingId === targetId) return;

    const next = [...items];
    const fromIndex = next.findIndex((item) => item._id === draggingId);
    const toIndex = next.findIndex((item) => item._id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [dragged] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, dragged);
    setItems(next);
    setDraggingId(null);

    await runAction(async () => {
      await milestoneAPI.reorderMilestones({
        contractId,
        milestoneIds: next.map((item) => item._id)
      });
    });
  };

  if (items.length === 0) {
    return <p className="text-gray-500">No milestones created</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {canReorder && (
        <p className="text-xs text-gray-500">Drag milestones to reorder before funding.</p>
      )}

      {user?.role === "freelancer" && (
        <p className="text-xs text-gray-500">
          Funded milestones can be started, updated, and submitted by freelancers.
        </p>
      )}

      {items.map((milestone) => {
        const canEditPreFunding =
          canMutateMilestones &&
          milestone.status === "pending" &&
          !milestone?.escrow?.isHeld;
        const canDeletePreFunding = canEditPreFunding;
        const canShowClientControls = canMutateMilestones;
        const canFreelancerStart =
          user?.role === "freelancer" &&
          milestone?.escrow?.isHeld &&
          ["funded", "changes_requested"].includes(milestone.status);
        const canFreelancerSubmit =
          user?.role === "freelancer" &&
          milestone?.escrow?.isHeld &&
          milestone.status === "in_progress";
        const canFreelancerUpdate =
          user?.role === "freelancer" &&
          milestone?.escrow?.isHeld &&
          ["funded", "in_progress", "changes_requested"].includes(milestone.status);
        const canClientReview = user?.role === "client" && milestone.status === "submitted";
        const reviewState = reviewDraft[milestone._id] || "";
        const disputeState = disputeDraft[milestone._id] || {};

        return (
          <div
            key={milestone._id}
            draggable={canReorder}
            onDragStart={() => setDraggingId(milestone._id)}
            onDragOver={(event) => {
              if (canReorder) event.preventDefault();
            }}
            onDrop={() => onDropMilestone(milestone._id)}
            className="border rounded-lg p-4 bg-white"
          >
            {editingId === milestone._id ? (
              <div className="grid grid-cols-1 gap-2 mb-3">
                <input
                  className="border p-2"
                  value={editForm.title}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                <textarea
                  className="border p-2 min-h-[80px]"
                  value={editForm.description}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    className="border p-2"
                    value={editForm.amount}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, amount: event.target.value }))}
                  />
                  <input
                    type="date"
                    className="border p-2"
                    value={editForm.dueDate}
                    onChange={(event) => setEditForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={busy}
                    onClick={() => saveEdit(milestone._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 border rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">{milestone.title}</p>
                  <p className="text-sm text-gray-600">{milestone.description || "No description"}</p>
                  <p className="text-sm text-gray-500 mt-1">Amount: ${milestone.amount}</p>
                  <p className="text-xs text-gray-400">Due: {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : "N/A"}</p>
                  <p className="text-xs text-gray-400">Status: {milestone.status}</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {canFreelancerStart && (
                    <button
                      disabled={busy}
                      onClick={() => startWork(milestone._id)}
                      className="px-3 py-1 bg-indigo-600 text-white rounded"
                    >
                      Start Work
                    </button>
                  )}

                  {canFreelancerSubmit && (
                    <button
                      disabled={busy}
                      onClick={() => setSubmittingMilestone(milestone)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Submit Work
                    </button>
                  )}

                  {canEditPreFunding && (
                    <button
                      disabled={busy}
                      onClick={() => beginEdit(milestone)}
                      className="px-3 py-1 border rounded"
                    >
                      Edit
                    </button>
                  )}

                  {canDeletePreFunding && (
                    <button
                      disabled={busy}
                      onClick={() => {
                        const confirmed = window.confirm("Delete this milestone before funding?");
                        if (confirmed) {
                          deleteMilestone(milestone._id);
                        }
                      }}
                      className="px-3 py-1 border border-red-300 text-red-700 rounded"
                    >
                      Delete
                    </button>
                  )}

                  {canShowClientControls && milestone.status === "pending" && !milestone?.escrow?.isHeld && (
                    <button
                      disabled={busy}
                      onClick={() => setFundingMilestone(milestone)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      Fund Milestone
                    </button>
                  )}

                  {canClientReview && (
                    <>
                      <button
                        disabled={busy}
                        onClick={() => approveMilestone(milestone._id)}
                        className="px-3 py-1 bg-green-700 text-white rounded"
                      >
                          Approve & Release
                      </button>
                      <button
                        disabled={busy || !reviewState.trim()}
                        onClick={() => requestChanges(milestone._id)}
                        className="px-3 py-1 border border-amber-300 text-amber-700 rounded"
                      >
                        Request Changes
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  {user?.role === "freelancer" ? "Upload Work Files" : "Attachments"}
                </p>
                {(user?.role === "client" || canFreelancerUpdate) && (
                  <input
                    type="file"
                    disabled={busy}
                    onChange={(event) => uploadAttachment(milestone._id, event.target.files?.[0])}
                    className="text-xs"
                  />
                )}
                <div className="mt-2 space-y-1">
                  {(milestone.attachments || []).map((attachment, index) => (
                    <a
                      key={`${milestone._id}-attachment-${index}`}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs text-blue-600 underline break-all"
                    >
                      {attachment.name}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  {user?.role === "freelancer" ? "Send Update" : "Comments"}
                </p>
                <div className="space-y-1 mb-2 max-h-28 overflow-auto">
                  {(milestone.comments || []).map((comment, index) => (
                    <p key={`${milestone._id}-comment-${index}`} className="text-xs text-gray-700">
                      <span className="font-medium">{comment?.user?.firstName || "User"}:</span> {comment.content}
                    </p>
                  ))}
                </div>
                {(user?.role === "client" || user?.role === "freelancer") && (
                  <div className="flex gap-2">
                    <input
                      className="border p-1 text-xs w-full"
                      value={commentDraft[milestone._id] || ""}
                      onChange={(event) =>
                        setCommentDraft((prev) => ({ ...prev, [milestone._id]: event.target.value }))
                      }
                      placeholder={user?.role === "freelancer" ? "Post work update" : "Add feedback"}
                    />
                    <button
                      disabled={busy}
                      onClick={() => addComment(milestone._id)}
                      className="px-2 py-1 text-xs bg-gray-900 text-white rounded"
                    >
                      {user?.role === "freelancer" ? "Send" : "Post"}
                    </button>
                  </div>
                )}

                {canClientReview && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      className="border p-2 text-xs w-full min-h-[72px]"
                      value={reviewState}
                      onChange={(event) =>
                        setReviewDraft((prev) => ({ ...prev, [milestone._id]: event.target.value }))
                      }
                      placeholder="Leave approval notes or change requests"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button
                        disabled={busy}
                        onClick={() => raiseDispute(milestone)}
                        className="px-3 py-1 border border-red-300 text-red-700 rounded"
                      >
                        Raise Dispute
                      </button>
                      <input
                        className="border p-1 text-xs flex-1 min-w-[120px]"
                        value={disputeState.reason || ""}
                        onChange={(event) =>
                          setDisputeDraft((prev) => ({
                            ...prev,
                            [milestone._id]: {
                              ...(prev[milestone._id] || {}),
                              reason: event.target.value
                            }
                          }))
                        }
                        placeholder="Dispute reason"
                      />
                    </div>
                    <input
                      className="border p-1 text-xs w-full"
                      value={disputeState.description || ""}
                      onChange={(event) =>
                        setDisputeDraft((prev) => ({
                          ...prev,
                          [milestone._id]: {
                            ...(prev[milestone._id] || {}),
                            description: event.target.value
                          }
                        }))
                      }
                      placeholder="Optional dispute description"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {fundingMilestone && (
        <FundMilestoneModal
          contractId={contractId}
          milestone={fundingMilestone}
          refresh={refresh}
          onClose={() => setFundingMilestone(null)}
        />
      )}

      {submittingMilestone && (
        <SubmitWorkModal
          milestone={submittingMilestone}
          refresh={refresh}
          onClose={() => setSubmittingMilestone(null)}
        />
      )}
    </div>
  );
};

export default MilestoneList;
