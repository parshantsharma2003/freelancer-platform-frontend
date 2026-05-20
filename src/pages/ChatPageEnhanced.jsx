import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { chatAPI, messageAPI } from '../services/api';
import { uploadChatAsset } from '../lib/uploadHelper';
import socketService from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import { Loader } from 'lucide-react';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatChatListTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return formatMessageTime(timestamp);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatPresenceLabel = (status, timestamp) => {
  if (status === 'online') return 'online';
  if (!timestamp) return 'last seen recently';

  const seenAt = new Date(timestamp);
  if (Number.isNaN(seenAt.getTime())) return 'last seen recently';

  const now = Date.now();
  const diffMs = Math.max(0, now - seenAt.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'last seen just now';
  if (diffMins < 60) return `last seen ${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `last seen ${diffHours}h ago`;

  return `last seen ${seenAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

const formatDateSeparator = (timestamp) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  messageDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (messageDate.getTime() === today.getTime()) return 'Today';
  if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday';

  const day = messageDate.getDate();
  const month = messageDate.toLocaleDateString('en-US', { month: 'short' });
  const year = messageDate.getFullYear() !== today.getFullYear() ? ` ${messageDate.getFullYear()}` : '';
  return `${month} ${day}${year}`;
};

const groupMessages = (messages) => {
  const groups = [];
  let currentDate = null;
  let currentSender = null;
  let currentGroup = [];

  messages.forEach((message, index) => {
    const messageDate = new Date(message.createdAt).toDateString();
    const senderId = message.sender?._id;

    if (messageDate !== currentDate) {
      if (currentGroup.length > 0) {
        groups.push({ type: 'group', messages: currentGroup });
        currentGroup = [];
      }
      groups.push({ type: 'date', date: message.createdAt });
      currentDate = messageDate;
      currentSender = null;
    }

    if (senderId !== currentSender) {
      if (currentGroup.length > 0) {
        groups.push({ type: 'group', messages: currentGroup });
      }
      currentGroup = [message];
      currentSender = senderId;
    } else {
      currentGroup.push(message);
    }

    if (index === messages.length - 1 && currentGroup.length > 0) {
      groups.push({ type: 'group', messages: currentGroup });
    }
  });

  return groups;
};

const getOtherParticipant = (chat, currentUserId) => {
  if (!chat?.contract) return null;

  const { client, freelancer } = chat.contract;

  if (client?._id === currentUserId) {
    return freelancer;
  }

  if (freelancer?._id === currentUserId) {
    return client;
  }

  return chat.participant;
};

const getParticipantName = (participant) => {
  if (!participant) return 'Unknown User';
  return `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Unknown User';
};

const getParticipantInitials = (participant) => {
  if (!participant) return '?';
  const first = (participant.firstName || '').charAt(0).toUpperCase();
  const last = (participant.lastName || '').charAt(0).toUpperCase();
  return (first + last) || '?';
};

const isValidObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

// ============================================
// ENHANCED CHAT PAGE COMPONENT
// ============================================

const ChatPage = () => {
  const { user, accessToken, isAuthResolved } = useAuth();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const requestedContractId = searchParams.get('contract');
  const initialContractId = isValidObjectId(requestedContractId) ? requestedContractId : null;

  // ===== STATE =====
  const [activeContractId, setActiveContractId] = useState(initialContractId);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatFilter, setChatFilter] = useState('all'); // 'all' or 'unread'
  const [typingByContract, setTypingByContract] = useState({});
  const [presenceByUser, setPresenceByUser] = useState({});
  const [userScrolled, setUserScrolled] = useState(false);
  const [showAttachmentComposer, setShowAttachmentComposer] = useState(false);
  const [attachmentDraft, setAttachmentDraft] = useState({ file: null, name: '' });
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [deletedMessageIds, setDeletedMessageIds] = useState({});
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // ===== REFS =====
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousContractRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  // ===== QUERIES =====
  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useQuery(
    ['chats'],
    () => chatAPI.getChats(),
    {
      enabled: isAuthResolved && !!accessToken,
      refetchOnWindowFocus: false,
      refetchInterval: 30000, // Increased to 30s for less polling
      select: (response) => response?.data?.data?.chats || []
    }
  );

  // ✨ FILTER: Only show conversations where messages exist (chatted with this person)
  const chattedChats = useMemo(() => {
    return chats.filter((chat) => {
      const hasMessages = chat.messageCount > 0 || chat.lastMessage;
      return hasMessages;
    });
  }, [chats]);

  const activeChat = useMemo(
    () => chattedChats.find((chat) => chat?.contract?._id === activeContractId) || null,
    [chattedChats, activeContractId]
  );

  const { data: messagesPayload, isLoading: messagesLoading } = useQuery(
    ['chatMessages', activeContractId],
    () => chatAPI.getContractMessages(activeContractId),
    {
      enabled: isValidObjectId(activeContractId) && isAuthResolved && !!accessToken,
      refetchOnWindowFocus: false,
      refetchInterval: 0, // Real-time via socket, not polling
      select: (response) => response?.data?.data
    }
  );

  const rawMessages = messagesPayload?.messages || [];
  const messages = rawMessages.filter((message) => !deletedMessageIds[message._id]);
  const isReadOnly = !!messagesPayload?.isReadOnly;

  // ===== FILTERING & GROUPING =====
  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chattedChats;
    const term = searchTerm.toLowerCase();

    return chattedChats.filter((chat) => {
      const other = getOtherParticipant(chat, user?._id);
      const displayName = other
        ? `${other.firstName || ''} ${other.lastName || ''}`.trim().toLowerCase()
        : (chat.participants || [])
            .map((participant) => `${participant.firstName || ''} ${participant.lastName || ''}`.trim())
            .join(' & ')
            .toLowerCase();

      const lastMessage = (chat.lastMessage?.content || '').toLowerCase();
      return displayName.includes(term) || lastMessage.includes(term);
    });
  }, [chattedChats, searchTerm, user?._id]);

  const visibleChats = useMemo(() => {
    if (chatFilter === 'unread') {
      return filteredChats.filter((chat) => (chat.unreadCount || 0) > 0);
    }
    return filteredChats;
  }, [filteredChats, chatFilter]);

  const groupedItems = useMemo(() => groupMessages(messages), [messages]);

  // ===== MUTATIONS =====
  const sendMutation = useMutation(
    ({ contractId, payload }) => chatAPI.sendContractMessage(contractId, payload),
    {
      onMutate: async ({ contractId, payload }) => {
        if (!contractId || !user?._id) return {};

        await queryClient.cancelQueries(['chatMessages', contractId]);
        const previousMessages = queryClient.getQueryData(['chatMessages', contractId]);

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
          _id: tempId,
          content: payload.content,
          messageType: payload.messageType || 'text',
          attachments: payload.attachments || [],
          sender: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
          },
          receiver: null,
          isRead: false,
          createdAt: new Date().toISOString(),
          _optimistic: true
        };

        queryClient.setQueryData(['chatMessages', contractId], (old) => {
          const current = old || {};
          const currentMessages = Array.isArray(current.messages) ? current.messages : [];
          return {
            ...current,
            messages: [...currentMessages, optimisticMessage]
          };
        });

        return { previousMessages, contractId };
      },
      onSuccess: () => {
        setMessageText('');
        setReplyToMessage(null);
        setEditingMessageId(null);
        setShowAttachmentComposer(false);
        setAttachmentDraft({ file: null, name: '' });
        queryClient.invalidateQueries(['chatMessages', activeContractId]);
        queryClient.invalidateQueries(['chats']);
      },
      onError: (_error, _variables, context) => {
        console.error('Chat send failed:', {
          status: _error?.response?.status,
          message: _error?.response?.data?.message || _error?.message,
          details: _error?.response?.data
        });
        if (context?.contractId) {
          queryClient.setQueryData(['chatMessages', context.contractId], context.previousMessages);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['chats']);
      }
    }
  );

  // ===== EFFECTS: Auto-scroll to bottom =====
  useEffect(() => {
    if (!messagesEndRef.current || userScrolled) return;
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }, [messages, userScrolled]);

  // ===== EFFECTS: Detect scroll position =====
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setUserScrolled(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // ===== EFFECTS: Auto-focus message input =====
  useEffect(() => {
    if (activeContractId && !isReadOnly && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [activeContractId, isReadOnly]);

  // ===== EFFECTS: Set initial active contract =====
  useEffect(() => {
    if (activeContractId || !chattedChats.length) return;

    const requestedContract = searchParams.get('contract');
    if (
      isValidObjectId(requestedContract) &&
      chattedChats.some((chat) => chat?.contract?._id === requestedContract)
    ) {
      setActiveContractId(requestedContract);
      return;
    }

    setActiveContractId(chattedChats[0]?.contract?._id || null);
  }, [chattedChats, activeContractId, searchParams]);

  // ===== EFFECTS: Validate contract ID =====
  useEffect(() => {
    if (!activeContractId || isValidObjectId(activeContractId)) return;
    setActiveContractId(null);
  }, [activeContractId]);

  // ===== EFFECTS: Socket setup & real-time listeners =====
  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      const connected = await socketService.connect();
      if (!connected || !isMounted) {
        setSocketConnected(false);
        return;
      }

      setSocketConnected(true);

      // ======= REAL-TIME MESSAGE HANDLERS =======

      const handleIncomingMessage = (payload) => {
        const payloadContractId = payload?.data?.contractId || payload?.contractId;
        refetchChats();
        if (payloadContractId && payloadContractId === activeContractId) {
          queryClient.invalidateQueries(['chatMessages', activeContractId]);
        }
      };

      const handleMessageDeleted = (payload) => {
        const messageId = payload?.data?.messageId;
        const payloadContractId = payload?.data?.contractId;
        
        if (messageId && payloadContractId === activeContractId) {
          setDeletedMessageIds((prev) => ({ ...prev, [messageId]: true }));
          queryClient.invalidateQueries(['chatMessages', activeContractId]);
        }
      };

      const handleMessageEdited = (payload) => {
        const payloadContractId = payload?.data?.contractId;
        if (payloadContractId === activeContractId) {
          queryClient.invalidateQueries(['chatMessages', activeContractId]);
        }
      };

      const handleRead = (payload) => {
        const payloadContractId = payload?.contractId || payload?.data?.contractId;
        refetchChats();
        if (payloadContractId && payloadContractId === activeContractId) {
          queryClient.invalidateQueries(['chatMessages', activeContractId]);
        }
      };

      // ======= TYPING INDICATORS =======
      const handleTyping = (payload) => {
        if (!payload?.contractId || payload?.userId === user?._id) return;
        
        setTypingByContract((prev) => ({
          ...prev,
          [payload.contractId]: payload.isTyping
        }));

        // Auto-stop typing after 2 seconds
        if (payload.isTyping) {
          setTimeout(() => {
            setTypingByContract((prev) => ({
              ...prev,
              [payload.contractId]: false
            }));
          }, 2000);
        }
      };

      // ======= PRESENCE TRACKING =======
      const handlePresence = (payload) => {
        if (!payload?.userId) return;
        setPresenceByUser((prev) => ({
          ...prev,
          [payload.userId]: {
            status: payload.status || 'offline',
            timestamp: payload.timestamp || new Date().toISOString()
          }
        }));
      };

      const handleConnect = () => {
        setSocketConnected(true);
        if (activeContractId) {
          socketService.emit('contract:join', activeContractId);
        }
      };

      const handleDisconnect = () => {
        setSocketConnected(false);
      };

      // ======= REGISTER LISTENERS =======
      socketService.on('connect', handleConnect);
      socketService.on('disconnect', handleDisconnect);
      socketService.on('message:new', handleIncomingMessage);
      socketService.on('message_received', handleIncomingMessage);
      socketService.on('message_sent', handleIncomingMessage);
      socketService.on('message:deleted', handleMessageDeleted);
      socketService.on('message:edited', handleMessageEdited);
      socketService.on('message:read', handleRead);
      socketService.on('typing:indicator', handleTyping);
      socketService.on('presence:update', handlePresence);
      socketService.on('presence:status', handlePresence);
      socketService.on('presence:check', handlePresence);

      return () => {
        isMounted = false;
      };
    };

    setupSocket();

    return () => {
      isMounted = false;
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('message:new');
      socketService.off('message_received');
      socketService.off('message_sent');
      socketService.off('message:deleted');
      socketService.off('message:edited');
      socketService.off('message:read');
      socketService.off('typing:indicator');
      socketService.off('presence:update');
      socketService.off('presence:status');
      socketService.off('presence:check');
    };
  }, [activeContractId, queryClient, user?._id, refetchChats]);

  // ===== EFFECTS: Join/Leave contract room =====
  useEffect(() => {
    if (!activeContractId || !socketConnected) return;

    if (previousContractRef.current && previousContractRef.current !== activeContractId) {
      socketService.emit('contract:leave', previousContractRef.current);
    }

    socketService.emit('contract:join', activeContractId);
    socketService.emit('message:read', activeContractId);
    previousContractRef.current = activeContractId;
  }, [activeContractId, socketConnected]);

  // ===== EFFECTS: Check presence of active participant =====
  useEffect(() => {
    const activeParticipant = getOtherParticipant(activeChat, user?._id);
    if (!activeParticipant?._id || !socketConnected) return;
    socketService.emit('presence:check', activeParticipant._id);
  }, [activeChat, user?._id, socketConnected]);

  // ===== EFFECTS: Real-time typing indicator =====
  useEffect(() => {
    if (!activeContractId || !socketConnected) return;

    if (messageText.trim().length > 0) {
      socketService.emit('typing:start', activeContractId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.emit('typing:stop', activeContractId);
      }, 1200);
    } else {
      socketService.emit('typing:stop', activeContractId);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [messageText, activeContractId, socketConnected]);

  // ===== MESSAGE ACTIONS =====

  const onSendMessage = (event) => {
    event?.preventDefault?.();
    if (
      !activeContractId ||
      !messageText.trim() ||
      isReadOnly ||
      sendMutation.isLoading ||
      isUploadingAsset
    ) {
      return;
    }

    const baseContent = messageText.trim();
    const payloadContent = replyToMessage
      ? `Replying to: ${replyToMessage.content || 'message'}\n${baseContent}`
      : baseContent;

    sendMutation.mutate({
      contractId: activeContractId,
      payload: {
        content: payloadContent,
        messageType: 'text'
      }
    });

    setUserScrolled(false);
  };

  const onSendAttachment = async (event) => {
    event?.preventDefault?.();
    if (!activeContractId || isReadOnly || sendMutation.isLoading || isUploadingAsset) return;
    if (!attachmentDraft.file) return;

    setIsUploadingAsset(true);
    try {
      const uploaded = await uploadChatAsset({
        file: attachmentDraft.file,
        fileName: attachmentDraft.name.trim() || attachmentDraft.file.name,
        mimeType: attachmentDraft.file.type,
        assetType: attachmentDraft.file.type?.startsWith('image/') ? 'image' : 'file'
      });

      sendMutation.mutate({
        contractId: activeContractId,
        payload: {
          content: `Shared file: ${uploaded.name}`,
          messageType: 'file',
          attachments: [uploaded]
        }
      });

      setUserScrolled(false);
    } catch (error) {
      console.error('Attachment upload failed', error);
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const onSendVoiceMessage = async (payload) => {
    if (!activeContractId || isReadOnly || sendMutation.isLoading || isUploadingAsset) return;
    if (!payload?.blob) return;

    setIsUploadingAsset(true);
    try {
      const uploaded = await uploadChatAsset({
        file: payload.blob,
        fileName: payload.fileName || `voice-${Date.now()}.webm`,
        mimeType: payload.mimeType || payload.blob.type || 'audio/webm',
        assetType: 'voice'
      });

      sendMutation.mutate({
        contractId: activeContractId,
        payload: {
          content: payload.content || `Voice message (${payload.durationLabel || '0:00'})`,
          messageType: 'voice',
          attachments: [
            {
              ...uploaded,
              duration: payload.durationSeconds || 0
            }
          ]
        }
      });

      setUserScrolled(false);
    } catch (error) {
      console.error('Voice upload failed', error);
    } finally {
      setIsUploadingAsset(false);
    }
  };

  const onReplyMessage = (message) => {
    setReplyToMessage(message);
    setEditingMessageId(null);
    messageInputRef.current?.focus?.();
  };

  const onEditMessage = (message) => {
    setEditingMessageId(message._id);
    setMessageText(message.content);
    setReplyToMessage(null);
    messageInputRef.current?.focus?.();
  };

  const onForwardMessage = (message) => {
    const forwardText = message?.content ? `Forwarded: ${message.content}` : 'Forwarded message';
    setMessageText(forwardText);
    setReplyToMessage(null);
    setEditingMessageId(null);
    messageInputRef.current?.focus?.();
  };

  const onDeleteMessageForMe = async (messageId) => {
    if (!messageId) return;
    setDeletedMessageIds((prev) => ({ ...prev, [messageId]: true }));
    try {
      await messageAPI.deleteMessage(messageId);
      queryClient.invalidateQueries(['chats']);
      queryClient.invalidateQueries(['chatMessages', activeContractId]);
    } catch {
      // Keep local hide behavior even if backend deletion fails
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage(event);
    }
  };

  // ===== COMPUTED VALUES =====
  const activeParticipant = getOtherParticipant(activeChat, user?._id);
  const typingActive = !!typingByContract[activeContractId];
  const activePresence = activeParticipant?._id ? presenceByUser[activeParticipant._id] : null;
  const activeParticipantOnline = activePresence?.status === 'online';
  const activePresenceLabel = formatPresenceLabel(activePresence?.status, activePresence?.timestamp);

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* NO SCROLLBARS - Full screen chat */
        .messages-container {
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .messages-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Socket connection indicator */}
      {!socketConnected && (
        <div className="fixed top-0 right-0 bg-yellow-500 text-white px-4 py-2 rounded-bl-lg text-xs flex items-center gap-2 z-50">
          <Loader className="w-3 h-3 animate-spin" />
          Reconnecting...
        </div>
      )}

      <div className="min-h-screen bg-slate-100 flex">
        {/* CHAT LIST SIDEBAR */}
        <ChatList
          chatsLoading={chatsLoading}
          filteredChats={visibleChats}
          activeContractId={activeContractId}
          setActiveContractId={setActiveContractId}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          chatFilter={chatFilter}
          setChatFilter={setChatFilter}
          userId={user?._id}
          getOtherParticipant={getOtherParticipant}
          getParticipantName={getParticipantName}
          getParticipantInitials={getParticipantInitials}
          formatMessageTime={formatChatListTime}
        />

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <ChatWindow
            activeContractId={activeContractId}
            setActiveContractId={setActiveContractId}
            activeParticipant={activeParticipant}
            activeParticipantOnline={activeParticipantOnline}
            activePresenceLabel={activePresenceLabel}
            activeChat={activeChat}
            messagesPayload={messagesPayload}
            groupedItems={groupedItems}
            messagesLoading={messagesLoading}
            typingActive={typingActive}
            userId={user?._id}
            getParticipantName={getParticipantName}
            getParticipantInitials={getParticipantInitials}
            formatDateSeparator={formatDateSeparator}
            formatMessageTime={formatMessageTime}
            messageText={messageText}
            setMessageText={setMessageText}
            onSendMessage={onSendMessage}
            onSendAttachment={onSendAttachment}
            onSendVoiceMessage={onSendVoiceMessage}
            replyToMessage={replyToMessage}
            setReplyToMessage={setReplyToMessage}
            editingMessageId={editingMessageId}
            setEditingMessageId={setEditingMessageId}
            onReplyMessage={onReplyMessage}
            onEditMessage={onEditMessage}
            onForwardMessage={onForwardMessage}
            onDeleteMessageForMe={onDeleteMessageForMe}
            sendLoading={sendMutation.isLoading || isUploadingAsset}
            isReadOnly={isReadOnly}
            showAttachmentComposer={showAttachmentComposer}
            setShowAttachmentComposer={setShowAttachmentComposer}
            attachmentDraft={attachmentDraft}
            setAttachmentDraft={setAttachmentDraft}
            userScrolled={userScrolled}
            handleKeyDown={handleKeyDown}
            messageInputRef={messageInputRef}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
            socketConnected={socketConnected}
          />
        </div>
      </div>
    </>
  );
};

export default ChatPage;
