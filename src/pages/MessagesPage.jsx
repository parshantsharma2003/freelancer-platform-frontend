import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { chatAPI } from '../services/api';
import socketService from '../services/socketService';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Search, Send, User, Check, CheckCheck } from 'lucide-react';
import { formatRelativeTime } from '../lib/utils';

// Format time as HH:MM (e.g., "14:32")
const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Format date separator (Today, Yesterday, or date)
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

// Group messages by date and sender
const groupMessages = (messages) => {
  const groups = [];
  let currentDate = null;
  let currentSender = null;
  let currentGroup = [];

  messages.forEach((message, index) => {
    const messageDate = new Date(message.createdAt).toDateString();
    const senderId = message.sender?._id;

    // Add date separator if date changed
    if (messageDate !== currentDate) {
      if (currentGroup.length > 0) {
        groups.push({ type: 'group', messages: currentGroup });
        currentGroup = [];
      }
      groups.push({ type: 'date', date: message.createdAt });
      currentDate = messageDate;
      currentSender = null;
    }

    // Create new group if sender changed
    if (senderId !== currentSender) {
      if (currentGroup.length > 0) {
        groups.push({ type: 'group', messages: currentGroup });
      }
      currentGroup = [message];
      currentSender = senderId;
    } else {
      currentGroup.push(message);
    }

    // Push last group
    if (index === messages.length - 1 && currentGroup.length > 0) {
      groups.push({ type: 'group', messages: currentGroup });
    }
  });

  return groups;
};

// Get the OTHER participant in the conversation (not the current user)
// Based on comparing client and freelancer IDs to current user ID
const getOtherParticipant = (chat, currentUserId) => {
  if (!chat?.contract) return null;
  
  const { client, freelancer } = chat.contract;
  
  // If current user is the client (by ID comparison), show freelancer
  if (client?._id === currentUserId) {
    return freelancer;
  }
  // If current user is the freelancer (by ID comparison), show client
  if (freelancer?._id === currentUserId) {
    return client;
  }
  
  // Fallback: use participant field from chat
  return chat.participant;
};

// Get participant name safely
const getParticipantName = (participant) => {
  if (!participant) return 'Unknown User';
  return `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Unknown User';
};

// Get participant initials for avatar
const getParticipantInitials = (participant) => {
  if (!participant) return '?';
  const first = (participant.firstName || '').charAt(0).toUpperCase();
  const last = (participant.lastName || '').charAt(0).toUpperCase();
  return (first + last) || '?';
};

const ChatListSkeleton = () => (
  <div className="p-4 space-y-3">
    {Array.from({ length: 6 }).map((_, idx) => (
      <div key={idx} className="animate-pulse flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/2" />
          <div className="h-3 bg-slate-100 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const MessagesPage = () => {
  const { user, accessToken, isAuthResolved } = useAuth();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeContractId, setActiveContractId] = useState(searchParams.get('contract') || null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typingByContract, setTypingByContract] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousContractRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const { data: chats = [], isLoading: chatsLoading } = useQuery(
    ['chats'],
    () => chatAPI.getChats(),
    {
      enabled: isAuthResolved && !!accessToken,
      refetchOnWindowFocus: false,
      refetchInterval: 12000,
      select: (response) => response?.data?.data?.chats || []
    }
  );

  const activeChat = useMemo(
    () => chats.find((chat) => chat?.contract?._id === activeContractId) || null,
    [chats, activeContractId]
  );

  const { data: messagesPayload, isLoading: messagesLoading } = useQuery(
    ['chatMessages', activeContractId],
    () => chatAPI.getContractMessages(activeContractId),
    {
      enabled: !!activeContractId && isAuthResolved && !!accessToken,
      refetchOnWindowFocus: false,
      refetchInterval: 12000,
      select: (response) => response?.data?.data
    }
  );

  const messages = messagesPayload?.messages || [];
  const isReadOnly = !!messagesPayload?.isReadOnly;

  const filteredChats = useMemo(() => {
    if (!searchTerm.trim()) return chats;
    const term = searchTerm.toLowerCase();

    return chats.filter((chat) => {
      const other = chat.participant;
      const displayName = other
        ? `${other.firstName || ''} ${other.lastName || ''}`.trim().toLowerCase()
        : (chat.participants || [])
            .map((participant) => `${participant.firstName || ''} ${participant.lastName || ''}`.trim())
            .join(' & ')
            .toLowerCase();

      const lastMessage = (chat.lastMessage?.content || '').toLowerCase();
      return displayName.includes(term) || lastMessage.includes(term);
    });
  }, [chats, searchTerm]);

  const sendMutation = useMutation(
    ({ contractId, content }) => chatAPI.sendContractMessage(contractId, { content, messageType: 'text' }),
    {
      onSuccess: () => {
        setMessageText('');
        queryClient.invalidateQueries(['chatMessages', activeContractId]);
        queryClient.invalidateQueries(['chats']);
      }
    }
  );

  useEffect(() => {
    if (!messagesEndRef.current || userScrolled) return;
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, userScrolled]);

  // Detect user scrolling
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

  // Auto-focus input when chat opens
  useEffect(() => {
    if (activeContractId && !isReadOnly && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [activeContractId, isReadOnly]);

  useEffect(() => {
    if (activeContractId) return;

    if (!chats.length) return;

    const requestedContract = searchParams.get('contract');
    if (requestedContract && chats.some((chat) => chat?.contract?._id === requestedContract)) {
      setActiveContractId(requestedContract);
      return;
    }

    setActiveContractId(chats[0].contract?._id || null);
  }, [chats, activeContractId, searchParams]);

  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      const connected = await socketService.connect();
      if (!connected || !isMounted) return;

      const handleIncomingMessage = (payload) => {
        const payloadContractId = payload?.data?.contractId || payload?.contractId;
        queryClient.invalidateQueries(['chats']);
        if (payloadContractId && payloadContractId === activeContractId) {
          queryClient.invalidateQueries(['chatMessages', activeContractId]);
        }
      };

      const handleRead = (payload) => {
        const payloadContractId = payload?.contractId || payload?.data?.contractId;
        queryClient.invalidateQueries(['chats']);
        if (payloadContractId && payloadContractId === activeContractId) {
          queryClient.invalidateQueries(['chatMessages', activeContractId]);
        }
      };

      const handleTyping = (payload) => {
        if (!payload?.contractId || payload?.userId === user?._id) return;
        setTypingByContract((prev) => ({
          ...prev,
          [payload.contractId]: payload.isTyping
        }));
      };

      const handlePresence = (payload) => {
        if (!payload?.userId) return;
        setOnlineUsers((prev) => ({ ...prev, [payload.userId]: payload.status }));
      };

      const handleConnect = () => {
        if (activeContractId) {
          socketService.emit('contract:join', activeContractId);
        }
      };

      socketService.on('connect', handleConnect);
      socketService.on('message:new', handleIncomingMessage);
      socketService.on('message_received', handleIncomingMessage);
      socketService.on('message_sent', handleIncomingMessage);
      socketService.on('message:read', handleRead);
      socketService.on('typing:indicator', handleTyping);
      socketService.on('presence:update', handlePresence);
      socketService.on('presence:status', handlePresence);
    };

    setupSocket();

    return () => {
      isMounted = false;
      socketService.off('connect');
      socketService.off('message:new');
      socketService.off('message_received');
      socketService.off('message_sent');
      socketService.off('message:read');
      socketService.off('typing:indicator');
      socketService.off('presence:update');
      socketService.off('presence:status');
    };
  }, [activeContractId, queryClient, user?._id]);

  useEffect(() => {
    if (!activeContractId || !socketService.connected()) return;

    if (previousContractRef.current && previousContractRef.current !== activeContractId) {
      socketService.emit('contract:leave', previousContractRef.current);
    }

    socketService.emit('contract:join', activeContractId);
    socketService.emit('message:read', activeContractId);
    previousContractRef.current = activeContractId;
  }, [activeContractId]);

  useEffect(() => {
    if (!activeContractId || !socketService.connected()) return;

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
  }, [messageText, activeContractId]);

  const onSendMessage = (event) => {
    event?.preventDefault?.();
    if (!activeContractId || !messageText.trim() || isReadOnly || sendMutation.isLoading) return;

    sendMutation.mutate({
      contractId: activeContractId,
      content: messageText.trim()
    });
    
    // Reset scroll lock when sending
    setUserScrolled(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage(event);
    }
  };

  // Get the OTHER participant (not the current user) for the active chat
  const activeParticipant = getOtherParticipant(activeChat, user?._id);
  const typingActive = !!typingByContract[activeContractId];
  const activeParticipantOnline = activeParticipant?._id
    ? onlineUsers[activeParticipant._id] === 'online'
    : false;

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="min-h-screen bg-slate-100">
      <div className="h-screen flex overflow-hidden">
        <aside className={`w-full md:w-[380px] bg-white border-r border-slate-200 flex flex-col ${activeContractId ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-5 border-b border-slate-200 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Messages</h2>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-0 bg-white shadow-sm outline-none focus:ring-2 focus:ring-emerald-700 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <ChatListSkeleton />
            ) : filteredChats.length === 0 ? (
              <div className="h-full flex items-center justify-center px-6 text-center">
                <div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <p className="text-slate-900 font-bold text-lg">No conversations yet</p>
                  <p className="text-sm text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
                    {searchTerm ? 'No chats match your search.' : 'Accept a proposal to start chatting with contract partners.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredChats.map((chat) => {
                  const contractId = chat?.contract?._id;
                  const isActive = contractId === activeContractId;
                  const unreadCount = chat.unreadCount || 0;
                  
                  // Get the OTHER participant (not the current user)
                  const otherParticipant = getOtherParticipant(chat, user?._id);
                  const participantName = getParticipantName(otherParticipant);

                  return (
                    <button
                      key={chat._id}
                      type="button"
                      onClick={() => setActiveContractId(contractId)}
                      className={`
                        w-full px-4 py-3 text-left transition-all duration-150
                        ${isActive 
                          ? 'bg-emerald-50 border-l-4 border-emerald-600' 
                          : 'hover:bg-slate-50 border-l-4 border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {otherParticipant?.avatar ? (
                          <img
                            src={otherParticipant.avatar}
                            alt={participantName}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                            {getParticipantInitials(otherParticipant)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-semibold truncate ${unreadCount > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                              {participantName || 'Contract chat'}
                            </p>
                            {chat.lastMessageAt && (
                              <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                                {formatMessageTime(chat.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                              {chat.lastMessage?.content || 'No messages yet'}
                            </p>
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white flex-shrink-0 min-w-[20px] text-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className={`flex-1 flex flex-col ${activeContractId ? 'flex' : 'hidden md:flex'}`}>
          {!activeContractId ? (
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
          ) : (
            <>
              <div className="px-4 md:px-6 py-3 border-b border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveContractId(null)}
                      className="md:hidden px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition text-sm font-medium text-slate-700"
                    >
                      ← Back
                    </button>
                    
                    {/* Avatar */}
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
                      <p className="font-semibold text-slate-900 truncate">
                        {getParticipantName(activeParticipant)}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        {activeParticipantOnline && (
                          <>
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              Online
                            </span>
                            <span className="text-slate-400">•</span>
                          </>
                        )}
                        <span className="text-slate-500 capitalize">
                          {messagesPayload?.contract?.status || activeChat?.contract?.status || 'Contract'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isReadOnly && (
                    <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Read only
                    </span>
                  )}
                </div>
              </div>

              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 md:px-6 py-4 bg-[#efeae2] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0wIDUwTDUwIDEwMEwxMDAgNTBMNTAgMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')]">
                <div className="max-w-4xl mx-auto space-y-2">
                  {messagesLoading ? (
                    <div className="py-10 text-center text-slate-500 text-sm">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="py-14 text-center">
                      <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-700 font-medium">No messages yet</p>
                      <p className="text-sm text-slate-500 mt-1">Start the conversation with your contract partner.</p>
                    </div>
                  ) : (
                    groupMessages(messages).map((item, groupIndex) => {
                      if (item.type === 'date') {
                        return (
                          <div key={`date-${groupIndex}`} className="flex justify-center my-4">
                            <span className="px-3 py-1 rounded-lg bg-white/80 backdrop-blur text-xs font-medium text-slate-600 shadow-sm">
                              {formatDateSeparator(item.date)}
                            </span>
                          </div>
                        );
                      }

                      const groupMessages = item.messages;
                      const firstMessage = groupMessages[0];
                      const isMine = firstMessage.sender?._id === user?._id;
                      const senderName = isMine 
                        ? 'You' 
                        : `${firstMessage.sender?.firstName || ''} ${firstMessage.sender?.lastName || ''}`.trim() || 'Unknown';

                      return (
                        <div key={`group-${groupIndex}`} className="space-y-0.5">
                          <div className={`flex gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                            {/* Avatar for received messages (only show for first message in group) */}
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
                              {/* Sender name for received messages */}
                              {!isMine && (
                                <span className="text-xs font-medium text-slate-600 px-2 mb-0.5">
                                  {senderName}
                                </span>
                              )}

                              {/* Message bubbles */}
                              {groupMessages.map((message, msgIndex) => {
                                const isFirstInGroup = msgIndex === 0;
                                const isLastInGroup = msgIndex === groupMessages.length - 1;

                                return (
                                  <div
                                    key={message._id}
                                    className={`
                                      animate-[slideIn_0.2s_ease-out]
                                      group relative px-3 py-2 shadow-sm
                                      ${isMine 
                                        ? 'bg-[#dcf8c6] text-slate-900' 
                                        : 'bg-white text-slate-900'
                                      }
                                      ${isFirstInGroup && isMine ? 'rounded-t-xl rounded-bl-xl rounded-br-md' : ''}
                                      ${isFirstInGroup && !isMine ? 'rounded-t-xl rounded-br-xl rounded-bl-md' : ''}
                                      ${!isFirstInGroup && !isLastInGroup ? 'rounded-xl' : ''}
                                      ${isLastInGroup && !isFirstInGroup && isMine ? 'rounded-b-xl rounded-tl-xl rounded-tr-md' : ''}
                                      ${isLastInGroup && !isFirstInGroup && !isMine ? 'rounded-b-xl rounded-tr-xl rounded-tl-md' : ''}
                                      ${isFirstInGroup && isLastInGroup && isMine ? 'rounded-xl rounded-br-md' : ''}
                                      ${isFirstInGroup && isLastInGroup && !isMine ? 'rounded-xl rounded-bl-md' : ''}
                                    `}
                                  >
                                    <p className="break-words text-[15px] leading-relaxed pr-12">
                                      {message.content}
                                    </p>
                                    <div className={`
                                      absolute bottom-1 right-2 flex items-center gap-1 
                                      text-[10px] ${isMine ? 'text-slate-600' : 'text-slate-500'}
                                    `}>
                                      <span>{formatMessageTime(message.createdAt)}</span>
                                      {isMine && (
                                        message.isRead ? (
                                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                        ) : (
                                          <Check className="w-3.5 h-3.5 text-slate-500" />
                                        )
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing indicator */}
                  {typingActive && (
                    <div className="flex gap-2 justify-start animate-[slideIn_0.2s_ease-out]">
                      <div className="flex-shrink-0 w-8" /> {/* Spacer for alignment */}
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

              <form onSubmit={onSendMessage} className="px-4 md:px-6 py-3 border-t border-slate-200 bg-white">
                <div className="max-w-4xl mx-auto flex items-end gap-2">
                  <textarea
                    ref={messageInputRef}
                    rows={1}
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isReadOnly ? 'This chat is read-only' : 'Type a message'}
                    disabled={isReadOnly}
                    className="flex-1 resize-none rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500 max-h-32 text-[15px]"
                    style={{ 
                      minHeight: '44px',
                      maxHeight: '128px',
                      overflowY: messageText.split('\n').length > 3 ? 'auto' : 'hidden'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || sendMutation.isLoading || isReadOnly}
                    className={`
                      p-3 rounded-full transition-all duration-200 flex-shrink-0
                      ${!messageText.trim() || sendMutation.isLoading || isReadOnly
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-md'
                      }
                    `}
                    aria-label="Send message"
                  >
                    {sendMutation.isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </form>
            </>
          )}
        </section>
      </div>
      </div>
    </>
  );
};

export default MessagesPage;
