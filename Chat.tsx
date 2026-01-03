import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/ui/Layout";
import { useUsers, usePremiumStatus } from "@/hooks/use-users";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { Search, Send, Crown, Smile, MessageSquareOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Chat() {
  const [, setLocation] = useLocation();
  const username = localStorage.getItem("username");
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!username) setLocation("/");
  }, [username, setLocation]);

  const { data: users = [] } = useUsers();
  const { data: premiumStatus } = usePremiumStatus(username);
  const { messages, sendMessage } = useChatSocket(username);

  // Filter messages for current conversation
  const currentMessages = messages.filter(
    (m) => 
      (m.from === username && m.to === selectedUser) ||
      (m.from === selectedUser && m.to === username)
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedUser) return;
    sendMessage(selectedUser, inputText);
    setInputText("");
  };

  const handleSticker = (sticker: string) => {
    if (!selectedUser) return;
    sendMessage(selectedUser, sticker);
  };

  const filteredUsers = users.filter(
    (u) => u.username !== username && u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPremium = premiumStatus?.premium;

  if (!username) return null;

  return (
    <Layout onLogout={() => { localStorage.removeItem("username"); setLocation("/"); }}>
      <div className="flex h-full w-full">
        
        {/* Users List Sidebar - Hidden on mobile if chatting */}
        <div className={cn(
          "w-full md:w-80 border-r border-gray-200 bg-white flex flex-col transition-all duration-300 absolute md:relative z-10 h-full",
          selectedUser ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold font-display mb-4 px-2">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p>No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u.username)}
                  className={cn(
                    "flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50",
                    selectedUser === u.username ? "bg-blue-50/80" : ""
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-lg font-bold text-gray-500 shadow-sm">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{u.username}</h3>
                    <p className="text-xs text-gray-500 truncate">Tap to chat</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col bg-white md:bg-gray-50 relative w-full",
          !selectedUser ? "hidden md:flex" : "flex"
        )}>
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 text-center">
              <MessageSquareOff className="w-24 h-24 mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-gray-400">Select a conversation</h3>
              <p className="max-w-xs mt-2 text-sm text-gray-400">Choose a user from the list to start chatting instantly.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex items-center space-x-4 sticky top-0 z-10 shadow-sm">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                  {selectedUser[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedUser}</h3>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-500">Active now</span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {currentMessages.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
                  </div>
                )}
                
                <AnimatePresence initial={false}>
                  {currentMessages.map((msg, idx) => {
                    const isMe = msg.from === username;
                    const isSticker = msg.msg === "🔥" || msg.msg === "👑";
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                          "flex w-full",
                          isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] px-4 py-2.5 shadow-sm",
                            isSticker ? "bg-transparent shadow-none text-5xl p-0" : "rounded-2xl text-sm md:text-base",
                            !isSticker && isMe ? "bg-primary text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                          )}
                        >
                          {msg.msg}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 max-w-4xl mx-auto">
                  
                  {/* Sticker Actions */}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleSticker("🔥")}
                      className="p-2.5 rounded-full hover:bg-orange-50 text-orange-500 transition-colors"
                      title="Send Fire"
                    >
                      <span className="text-xl">🔥</span>
                    </button>
                    
                    <button
                      onClick={() => isPremium && handleSticker("👑")}
                      disabled={!isPremium}
                      className={cn(
                        "p-2.5 rounded-full transition-all relative group",
                        isPremium 
                          ? "hover:bg-yellow-50 text-yellow-500 cursor-pointer" 
                          : "text-gray-300 cursor-not-allowed"
                      )}
                      title={isPremium ? "Send Crown" : "Premium Only"}
                    >
                      <Crown className={cn("w-6 h-6", isPremium ? "fill-yellow-400 text-yellow-500" : "")} />
                      {!isPremium && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Premium Only
                        </div>
                      )}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Message..."
                    className="flex-1 px-4 py-3 rounded-full bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                  
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="p-3 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
