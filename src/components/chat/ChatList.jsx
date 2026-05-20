import { MessageCircle, Search, MoreVertical } from 'lucide-react';

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

const ChatList = ({
  chatsLoading,
  filteredChats,
  activeContractId,
  setActiveContractId,
  searchTerm,
  setSearchTerm,
  chatFilter,
  setChatFilter,
  userId,
  getOtherParticipant,
  getParticipantName,
  getParticipantInitials,
  formatMessageTime
}) => {
  return (
    <aside className={`w-full md:w-[390px] bg-[#111b21] border-r border-[#202c33] flex flex-col ${activeContractId ? 'hidden md:flex' : 'flex'}`}>
      <div className="px-4 py-3 border-b border-[#202c33] bg-[#202c33]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#d1d7db]" />
            </div>
            <h2 className="text-xl font-semibold text-[#e9edef]">Chats</h2>
          </div>
          <button type="button" className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="More options">
            <MoreVertical className="w-5 h-5 text-[#aebac1]" />
          </button>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-[#8696a0] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-0 bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0] outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setChatFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              chatFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-[#2a3942] text-[#aebac1] hover:bg-[#31424d]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setChatFilter('unread')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              chatFilter === 'unread'
                ? 'bg-emerald-600 text-white'
                : 'bg-[#2a3942] text-[#aebac1] hover:bg-[#31424d]'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chatsLoading ? (
          <ChatListSkeleton />
        ) : filteredChats.length === 0 ? (
          <div className="h-full flex items-center justify-center px-6 text-center">
            <div>
              <div className="w-20 h-20 rounded-full bg-[#202c33] flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-[#8696a0]" />
              </div>
              <p className="text-[#e9edef] font-semibold text-lg">No conversations yet</p>
              <p className="text-sm text-[#8696a0] mt-2 max-w-xs mx-auto leading-relaxed">
                {searchTerm ? 'No chats match your search.' : 'Accept a proposal to start chatting with contract partners.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#202c33]">
            {filteredChats.map((chat) => {
              const contractId = chat?.contract?._id;
              const isActive = contractId === activeContractId;
              const unreadCount = chat.unreadCount || 0;
              const otherParticipant = getOtherParticipant(chat, userId);
              const participantName = getParticipantName(otherParticipant);

              return (
                <button
                  key={chat._id}
                  type="button"
                  onClick={() => setActiveContractId(contractId)}
                  className={`
                    w-full px-4 py-3 text-left transition-all duration-150
                    ${isActive
                      ? 'bg-[#2a3942] border-l-4 border-emerald-500'
                      : 'hover:bg-[#182229] border-l-4 border-transparent'
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
                        <p className={`font-medium truncate ${unreadCount > 0 ? 'text-[#e9edef]' : 'text-[#d1d7db]'}`}>
                          {participantName || 'Contract chat'}
                        </p>
                        {chat.lastMessageAt && (
                          <span className={`text-xs ml-2 flex-shrink-0 ${unreadCount > 0 ? 'text-emerald-400' : 'text-[#8696a0]'}`}>
                            {formatMessageTime(chat.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-[#e9edef]' : 'text-[#8696a0]'}`}>
                          {chat.lastMessage?.content || 'No messages yet'}
                        </p>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-[#111b21] flex-shrink-0 min-w-[20px] text-center">
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
  );
};

export default ChatList;
