import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, MoreVertical, Plus, Send, RotateCcw, FastForward } from "lucide-react";
import { Message, UserInfo } from "../types";
import { MessageItem } from "./MessageItem";
import { InventoryPopup } from "./InventoryPopup";
import { CHAR_AVATAR } from "../constants";
import { cn } from "../lib/utils";

interface ChatInterfaceProps {
  messages: Message[];
  userInfo: UserInfo;
  onSendMessage: (content: string) => void;
  onBack: () => void;
  onToggleSidebar: () => void;
  onRefresh: () => void;
  onFastForward: () => void;
  inventory: string[];
  onUseItem: (item: string) => void;
  isTyping: boolean;
  modelName: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  userInfo,
  onSendMessage,
  onBack,
  onToggleSidebar,
  onRefresh,
  onFastForward,
  inventory,
  onUseItem,
  isTyping,
  modelName,
}) => {
  const [input, setInput] = React.useState("");
  const [isInventoryOpen, setIsInventoryOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleInventoryAction = (item: string, type: "use" | "show") => {
    const text = type === "show" 
      ? `{{user}} lấy [${item}] ra cho {{char}} xem...`
      : `{{user}} sử dụng [${item}]...`;
    setInput(text);
    setIsInventoryOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#FFF0F5]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-pink-100 flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-pink-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-[#333]" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src={CHAR_AVATAR}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-pink-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-bold text-[#333] leading-tight">Lê Hoài Nam</p>
              <p className="text-[10px] text-[#ff99cc] font-bold uppercase tracking-wider">Quan Đốc</p>
              <p className="text-[8px] text-gray-400 font-medium">Đang trò chuyện bằng: {modelName}</p>
            </div>
          </div>
        </div>
        <button onClick={onToggleSidebar} className="p-2 hover:bg-pink-50 rounded-full transition-colors">
          <MoreVertical className="w-6 h-6 text-[#333]" />
        </button>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pt-20 pb-24 px-4 scroll-smooth"
      >
        <div className="max-w-2xl mx-auto">
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              content={msg.content}
              role={msg.role}
              userName={userInfo.name}
            />
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-6 animate-pulse">
              <div className="flex items-end gap-2">
                <img
                  src={CHAR_AVATAR}
                  alt="AI Avatar"
                  className="w-8 h-8 rounded-full border border-pink-200"
                  referrerPolicy="no-referrer"
                />
                <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-pink-200 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-200 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-pink-200 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Icons */}
          <div className="flex gap-4 mt-2 mb-8 ml-10">
            <button
              onClick={onRefresh}
              className="p-2 bg-white rounded-full shadow-sm border border-pink-100 text-[#ff99cc] hover:bg-pink-50 transition-all active:scale-95"
              title="Làm mới"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={onFastForward}
              className="p-2 bg-white rounded-full shadow-sm border border-pink-100 text-[#ff99cc] hover:bg-pink-50 transition-all active:scale-95"
              title="Tiếp tục"
            >
              <FastForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 p-4 z-20">
        <div className="max-w-2xl mx-auto relative flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsInventoryOpen(!isInventoryOpen)}
              className={cn(
                "p-3 rounded-full transition-all active:scale-90",
                isInventoryOpen ? "bg-[#ff99cc] text-white" : "bg-pink-50 text-[#ff99cc] hover:bg-pink-100"
              )}
            >
              <Plus className={cn("w-6 h-6 transition-transform", isInventoryOpen && "rotate-45")} />
            </button>
            <InventoryPopup
              isOpen={isInventoryOpen}
              items={inventory}
              onAction={handleInventoryAction}
            />
          </div>

          <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-5 py-3 bg-pink-50 border border-pink-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ffb6c1] transition-all text-[#333]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 bg-[#ff99cc] text-white rounded-full shadow-lg shadow-pink-100 disabled:opacity-50 disabled:shadow-none transition-all active:scale-90"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};
