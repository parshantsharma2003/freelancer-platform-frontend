import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, User } from 'lucide-react';
import { messageAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const formatDateLabel = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const messageDate = new Date(date);
  messageDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (messageDate.getTime() === today.getTime()) return 'Today';
  if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const DirectMessagePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthResolved, accessToken } = useAuth();
  const [messageText, setMessageText] = useState('');

  const { data: recipient, isLoading: recipientLoading } = useQuery(
    ['direct-message-recipient', userId],
    () => userAPI.getUserById(userId),
    {
      enabled: !!userId,
      select: (response) => response?.data?.data?.user || response?.data?.data || null
    }
  );

  const { data: threadData, isLoading: threadLoading } = useQuery(
    ['direct-message-thread', userId],
    () => messageAPI.getDirectMessages(userId),
    {
      enabled: !!userId && isAuthResolved && !!accessToken,
      refetchOnWindowFocus: false,
      refetchInterval: 10000,
      select: (response) => response?.data?.data || null
    }
  );

  const sendMutation = useMutation(
    () => messageAPI.sendMessage({ receiverId: userId, content: messageText.trim(), messageType: 'text' }),
    {
      onSuccess: () => {
        setMessageText('');
        queryClient.invalidateQueries(['direct-message-thread', userId]);
        queryClient.invalidateQueries(['direct-message-recipient', userId]);
      }
    }
  );

  const messages = threadData?.messages || [];
  const conversation = threadData?.conversation || null;
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();
      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ type: 'group', messages: currentGroup });
          currentGroup = [];
        }
        groups.push({ type: 'date', date: message.createdAt });
        currentDate = messageDate;
      }

      currentGroup.push(message);
    });

    if (currentGroup.length > 0) {
      groups.push({ type: 'group', messages: currentGroup });
    }

    return groups;
  }, [messages]);

  const recipientName = recipient ? `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() : 'Conversation';
  const recipientRole = recipient?.role ? recipient.role.replace('_', ' ') : 'user';
  const canSend = !!messageText.trim() && !sendMutation.isLoading;

  const onSubmit = (event) => {
    event.preventDefault();
    if (!canSend) return;
    sendMutation.mutate();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSubmit(event);
    }
  };

  if (recipientLoading || threadLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-slate-600">Opening conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-[#111b21] rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
          <div className="px-5 py-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                {recipient?.avatar ? (
                  <img
                    src={recipient.avatar}
                    alt={recipientName}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-emerald-300" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-[#e9edef] truncate">{recipientName}</h1>
                <p className="text-sm text-[#8696a0] capitalize">{recipientRole}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/messages')}
              className="px-3 py-2 rounded-lg bg-[#2a3942] text-[#d1d7db] hover:bg-[#31424d] text-sm"
            >
              Open inbox
            </button>
          </div>

          <div className="bg-[#efeae2] min-h-[65vh] p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-3">
              {conversation?.job || conversation?.proposal ? (
                <div className="rounded-2xl bg-white/80 backdrop-blur px-4 py-3 border border-white shadow-sm text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-medium text-slate-900 mb-1">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    Pre-hire conversation
                  </div>
                  <p>
                    This thread is private and can be used to discuss the project before a contract is created.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/80 backdrop-blur px-4 py-3 border border-white shadow-sm text-sm text-slate-600">
                  Start the conversation with a short introduction or project question.
                </div>
              )}

              {groupedMessages.length === 0 ? (
                <div className="py-20 text-center text-slate-600">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="font-medium text-slate-700">No messages yet</p>
                  <p className="text-sm mt-1">Send the first message to start the discussion.</p>
                </div>
              ) : (
                groupedMessages.map((item, index) => {
                  if (item.type === 'date') {
                    return (
                      <div key={`date-${index}`} className="flex justify-center my-4">
                        <span className="px-3 py-1 rounded-lg bg-white/90 text-xs font-medium text-slate-600 shadow-sm">
                          {formatDateLabel(item.date)}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={`group-${index}`} className="space-y-1">
                      {item.messages.map((message) => {
                        const isMine = message.sender?._id === user?._id;

                        return (
                          <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? 'bg-emerald-600 text-white rounded-br-md' : 'bg-white text-slate-800 rounded-bl-md'}`}>
                              <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                              <p className={`mt-1 text-[11px] ${isMine ? 'text-emerald-100' : 'text-slate-500'}`}>
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-4 bg-[#202c33] border-t border-[#2a3942]">
            <div className="flex items-end gap-3">
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={`Message ${recipientName}`}
                className="flex-1 resize-none rounded-2xl px-4 py-3 bg-[#2a3942] text-[#e9edef] placeholder:text-[#8696a0] outline-none focus:ring-2 focus:ring-emerald-500 min-h-[52px] max-h-32"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-[#1f2c34] disabled:text-[#54656f] transition-colors"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DirectMessagePage;