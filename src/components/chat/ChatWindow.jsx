import { useMemo, useState } from 'react';
import { MessageCircle, Send, ArrowLeft, Lock, Search, Paperclip, ChevronDown, Mic, Image } from 'lucide-react';
import MessageBubble from './MessageBubble';
import VoiceRecorder from './VoiceRecorder';
import MediaGallery from './MediaGallery';
import MediaPreviewModal from './MediaPreviewModal';
import FileUploadComposer from './FileUploadComposer';

const ChatWindow = ({
  activeContractId,
  setActiveContractId,
  activeParticipant,
  activeParticipantOnline,
  activePresenceLabel,
  activeChat,
  messagesPayload,
  groupedItems,
  messagesLoading,
  typingActive,
  userId,
  getParticipantName,
  getParticipantInitials,
  formatDateSeparator,
  formatMessageTime,
  messageText,
  setMessageText,
  onSendMessage,
  onSendAttachment,
  onSendVoiceMessage,
  replyToMessage,
  setReplyToMessage,
  onReplyMessage,
  onForwardMessage,
  onDeleteMessageForMe,
  sendLoading,
  isReadOnly,
  showAttachmentComposer,
  setShowAttachmentComposer,
  attachmentDraft,
  setAttachmentDraft,
  userScrolled,
  handleKeyDown,
  messageInputRef,
  messagesContainerRef,
  messagesEndRef
}) => {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);

  const matchingMessageIds = useMemo(() => {
    const term = messageSearchTerm.trim().toLowerCase();
    if (!term) return new Set();

    const ids = [];
    groupedItems.forEach((item) => {
      if (item.type !== 'group') return;
      item.messages.forEach((message) => {
        const content = (message?.content || '').toLowerCase();
        if (content.includes(term)) ids.push(message._id);
      });
    });

    return new Set(ids);
  }, [groupedItems, messageSearchTerm]);

  const totalSearchMatches = matchingMessageIds.size;

  const mediaItems = useMemo(() => {
    const items = [];
    groupedItems.forEach((item, groupIndex) => {
      if (item.type !== 'group') return;
      item.messages.forEach((message) => {
        if (!Array.isArray(message?.attachments)) return;
        message.attachments.forEach((attachment, attachmentIndex) => {
          if (!attachment?.url) return;
          items.push({
            key: `${groupIndex}-${message._id}-${attachmentIndex}`,
            messageId: message._id,
            attachment,
            createdAt: message.createdAt
          });
        });
      });
    });
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [groupedItems]);

  if (!activeContractId) {
    return (
      <section className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50">
          <div className="text-center px-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-slate-900 font-bold text-2xl mb-2">Welcome to Messages</h3>
            <p className="text-slate-600 text-base max-w-sm mx-auto leading-relaxed">
              Select a conversation from the sidebar to start chatting with your contract partners.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col relative">
      <div className="px-4 md:px-6 py-3 border-b border-[#202c33] bg-[#202c33] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setActiveContractId(null)}
              className="md:hidden px-3 py-1.5 rounded-lg bg-[#2a3942] hover:bg-[#31424d] transition text-sm font-medium text-[#d1d7db]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {activeParticipant?.avatar ? (
              <img
                src={activeParticipant.avatar}
                alt={getParticipantName(activeParticipant)}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                {getParticipantInitials(activeParticipant)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#e9edef] truncate">
                {getParticipantName(activeParticipant)}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#8696a0]">
                <span className={`inline-flex items-center gap-1 ${activeParticipantOnline ? 'text-emerald-400' : 'text-[#8696a0]'}`}>
                  <span className={`w-2 h-2 rounded-full ${activeParticipantOnline ? 'bg-emerald-400 animate-pulse' : 'bg-[#54656f]'}`} />
                  {activePresenceLabel}
                </span>
                <span>•</span>
                <span className="capitalize">{messagesPayload?.contract?.status || activeChat?.contract?.status || 'Contract'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowSearch((prev) => !prev)}
              className="p-2 rounded-full text-[#aebac1] hover:bg-white/10"
              aria-label="Search messages"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowMediaGallery((prev) => !prev)}
              className="p-2 rounded-full text-[#aebac1] hover:bg-white/10"
              aria-label="Open media gallery"
            >
              <Image className="w-4 h-4" />
            </button>
          </div>

          {isReadOnly && (
            <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200 ml-2">
              <Lock className="w-3.5 h-3.5" />
              Read only
            </span>
          )}
        </div>

        {showSearch && (
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={messageSearchTerm}
                onChange={(event) => setMessageSearchTerm(event.target.value)}
                placeholder="Search in conversation"
                className="w-full pl-10 pr-4 py-2 rounded-lg border-0 bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0] outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>
            <span className="text-xs text-[#8696a0] min-w-fit">{totalSearchMatches} matches</span>
          </div>
        )}
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-6 py-4 bg-[#efeae2]"
      >
        <div className="max-w-4xl mx-auto space-y-2">
          {messagesLoading ? (
            <div className="py-10 text-center text-slate-500 text-sm">Loading messages...</div>
          ) : groupedItems.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-medium">No messages yet</p>
              <p className="text-sm text-slate-500 mt-1">Start the conversation with your contract partner.</p>
            </div>
          ) : (
            groupedItems.map((item, groupIndex) => {
              if (item.type === 'date') {
                return (
                  <div key={`date-${groupIndex}`} className="flex justify-center my-4">
                    <span className="px-3 py-1 rounded-lg bg-white/80 backdrop-blur text-xs font-medium text-slate-600 shadow-sm">
                      {formatDateSeparator(item.date)}
                    </span>
                  </div>
                );
              }

              const messageGroup = item.messages;
              const firstMessage = messageGroup[0];
              const isMine = firstMessage.sender?._id === userId;
              const senderName = isMine
                ? 'You'
                : `${firstMessage.sender?.firstName || ''} ${firstMessage.sender?.lastName || ''}`.trim() || 'Unknown';

              return (
                <div key={`group-${groupIndex}`} className="space-y-0.5">
                  <div className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && (
                      <div className="flex-shrink-0 mt-auto mb-1">
                        {firstMessage.sender?.avatar ? (
                          <img
                            src={firstMessage.sender.avatar}
                            alt={senderName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">
                            {senderName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[70%] space-y-0.5`}>
                      {!isMine && (
                        <span className="text-xs font-medium text-slate-600 px-2 mb-0.5">
                          {senderName}
                        </span>
                      )}

                      {messageGroup.map((message, idx) => (
                        <MessageBubble
                          key={message._id}
                          message={message}
                          isMine={isMine}
                          isFirstInGroup={idx === 0}
                          isLastInGroup={idx === messageGroup.length - 1}
                          formatMessageTime={formatMessageTime}
                          isHighlighted={matchingMessageIds.has(message._id)}
                          onReply={onReplyMessage}
                          onForward={onForwardMessage}
                          onDelete={onDeleteMessageForMe}
                          onPreviewAttachment={setPreviewAttachment}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {typingActive && (
            <div className="flex gap-2 justify-start animate-[slideIn_0.2s_ease-out]">
              <div className="flex-shrink-0 w-8" />
              <div className="bg-white rounded-xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={onSendMessage} className="px-4 md:px-6 py-3 border-t border-[#202c33] bg-[#202c33] relative">
        {replyToMessage && (
          <div className="max-w-4xl mx-auto mb-2 rounded-lg bg-[#111b21] border border-[#31424d] px-3 py-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-emerald-400">Replying to message</p>
              <p className="text-sm text-[#d1d7db] truncate">{replyToMessage.content || 'Message'}</p>
            </div>
            <button
              type="button"
              onClick={() => setReplyToMessage(null)}
              className="text-xs px-2 py-1 rounded bg-[#2a3942] text-[#aebac1] hover:bg-[#31424d]"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="max-w-4xl mx-auto flex items-end gap-2">
          {showVoiceRecorder ? (
            <VoiceRecorder
              onSend={(payload) => {
                onSendVoiceMessage?.(payload);
                setShowVoiceRecorder(false);
              }}
              disabled={isReadOnly}
              isLoading={sendLoading}
            />
          ) : (
            <>
          <button
            type="button"
            onClick={() => {
              setShowVoiceRecorder((prev) => !prev);
              if (showAttachmentComposer) setShowAttachmentComposer(false);
            }}
            disabled={isReadOnly}
            className={`p-3 rounded-full transition-colors ${
              isReadOnly ? 'bg-[#1f2c34] text-[#54656f] cursor-not-allowed' : 'bg-[#2a3942] text-[#d1d7db] hover:bg-[#31424d]'
            } ${showVoiceRecorder ? 'bg-emerald-600 text-white' : ''}`}
            aria-label="Record voice message"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAttachmentComposer((prev) => !prev);
              if (showVoiceRecorder) setShowVoiceRecorder(false);
            }}
            disabled={isReadOnly}
            className={`p-3 rounded-full transition-colors ${isReadOnly ? 'bg-[#1f2c34] text-[#54656f] cursor-not-allowed' : 'bg-[#2a3942] text-[#d1d7db] hover:bg-[#31424d]'}`}
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={messageInputRef}
            rows={1}
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isReadOnly ? 'This chat is read-only' : 'Type a message'}
            disabled={isReadOnly}
            className="flex-1 resize-none rounded-2xl border border-transparent bg-[#2a3942] text-[#e9edef] placeholder:text-[#8696a0] px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-[#1f2c34] disabled:text-[#8696a0] max-h-32 text-[15px]"
            style={{
              minHeight: '44px',
              maxHeight: '128px',
              overflowY: messageText.split('\n').length > 3 ? 'auto' : 'hidden'
            }}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sendLoading || isReadOnly}
            className={`
              p-3 rounded-full transition-all duration-200 flex-shrink-0
              ${!messageText.trim() || sendLoading || isReadOnly
                ? 'bg-[#1f2c34] text-[#54656f] cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md'
              }
            `}
            aria-label="Send message"
          >
            {sendLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
            </>
          )}
        </div>

        {showAttachmentComposer && !isReadOnly && (
          <FileUploadComposer
            attachmentDraft={attachmentDraft}
            setAttachmentDraft={setAttachmentDraft}
            onSendAttachment={onSendAttachment}
            sendLoading={sendLoading}
            isReadOnly={isReadOnly}
            onClose={() => setShowAttachmentComposer(false)}
          />
        )}

        {userScrolled && (
          <button
            type="button"
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute right-6 -top-12 p-2 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
            aria-label="Jump to latest messages"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        <p className="text-xs text-[#8696a0] text-center mt-2">Press Enter to send, Shift+Enter for new line</p>
      </form>

      <MediaGallery
        mediaItems={mediaItems}
        isOpen={showMediaGallery}
        onClose={() => setShowMediaGallery(false)}
        onPreview={setPreviewAttachment}
      />

      <MediaPreviewModal
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />
    </section>
  );
};

export default ChatWindow;
