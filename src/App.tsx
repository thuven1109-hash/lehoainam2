import React from "react";
import { IntroScreen } from "./components/IntroScreen";
import { ChatInterface } from "./components/ChatInterface";
import { Sidebar } from "./components/Sidebar";
import { UserInfo, ChatSession, Message, CustomSideCharacter } from "./types";
import { FIRST_MESSAGE } from "./constants";
import { sendMessage } from "./services/gemini";
import { motion, AnimatePresence } from "motion/react";
import { ApiKeyModal } from "./components/ApiKeyModal";

const STORAGE_KEY = "hoi_uc_nam_ky_sessions";
const API_KEY_STORAGE = "user_api_key";
const MODEL_STORAGE = "selectedModel";
const NOTEBOOK_STORAGE = "user_notebook_content";
const NOTEBOOK_ENABLED_STORAGE = "user_notebook_enabled";

export default function App() {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  
  // Notebook & Custom Character State
  const [notebookEvents, setNotebookEvents] = React.useState<string[]>([]);
  const [customCharacters, setCustomCharacters] = React.useState<CustomSideCharacter[]>([]);

  // API Key & Model State
  const [apiKey, setApiKey] = React.useState<string | null>(() => localStorage.getItem(API_KEY_STORAGE));
  const [selectedModel, setSelectedModel] = React.useState<string>(() => localStorage.getItem(MODEL_STORAGE) || "gemini-flash-latest");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = React.useState(false);
  const [apiKeyError, setApiKeyError] = React.useState<string | null>(null);

  const handleSaveApiKey = (key: string, model: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    localStorage.setItem(MODEL_STORAGE, model);
    setApiKey(key);
    setSelectedModel(model);
    setIsApiKeyModalOpen(false);
    setApiKeyError(null);
  };

  // Load sessions from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save sessions to localStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartChat = (userInfo: UserInfo) => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chuyện của ${userInfo.name}`,
      messages: [
        {
          id: "first",
          role: "assistant",
          content: FIRST_MESSAGE,
          timestamp: Date.now(),
        },
      ],
      lastUpdate: Date.now(),
      userInfo,
      inventory: [],
      customCharacters: [],
      notebookEvents: [],
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setNotebookEvents([]);
    setCustomCharacters([]);
  };

  const processAIResponse = (text: string, sessionId: string) => {
    let processedText = text;
    const inventoryUpdates: string[] = [];

    // Extract [GET: Item Name]
    const getRegex = /\[GET:\s*(.*?)\]/g;
    let match;
    while ((match = getRegex.exec(text)) !== null) {
      inventoryUpdates.push(match[1].trim());
    }

    // Remove [GET: ...] from display text
    processedText = processedText.replace(getRegex, "").trim();

    // Update session
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const newInventory = [...s.inventory];
          inventoryUpdates.forEach((item) => {
            if (!newInventory.includes(item)) {
              newInventory.push(item);
              showToast(`Bạn đã nhận được [${item}]`);
            }
          });
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: processedText,
                timestamp: Date.now(),
              },
            ],
            inventory: newInventory,
            lastUpdate: Date.now(),
          };
        }
        return s;
      })
    );
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId || !currentSession) return;

    // Detect item removal
    const removalKeywords = ["sử dụng", "bán", "bỏ", "vứt", "tặng", "trao"];
    const itemMatch = content.match(/\[(.*?)\]/);
    let itemToRemove: string | null = null;

    if (itemMatch) {
      const itemName = itemMatch[1].trim();
      const lowerContent = content.toLowerCase();
      if (removalKeywords.some((kw) => lowerContent.includes(kw))) {
        // Check if item exists in current inventory
        if (currentSession.inventory.includes(itemName)) {
          itemToRemove = itemName;
        }
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    // Update UI immediately
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const newInventory = itemToRemove
            ? s.inventory.filter((i) => i !== itemToRemove)
            : s.inventory;
          
          if (itemToRemove) {
            showToast(`Đã dùng/bỏ: [${itemToRemove}]`);
          }

          return {
            ...s,
            messages: [...s.messages, userMessage],
            inventory: newInventory,
            lastUpdate: Date.now(),
          };
        }
        return s;
      })
    );

    setIsTyping(true);
    try {
      if (!apiKey) throw new Error("MISSING_KEY");
      
      let additionalPrompt = "";
      if (notebookEvents.length > 0) {
        additionalPrompt += `SỔ TAY SỰ KIỆN (Ghi nhớ quan trọng):\n${notebookEvents.map((e, i) => `${i+1}. ${e}`).join("\n")}\n\n`;
      }
      if (customCharacters.length > 0) {
        additionalPrompt += `NHÂN VẬT PHỤ MỚI XUẤT HIỆN:\n${customCharacters.map(c => `- ${c.name} (${c.gender}): ${c.role}. ${c.description}`).join("\n")}\n\n`;
      }

      const response = await sendMessage(
        [...currentSession.messages, userMessage],
        currentSession.userInfo.name,
        currentSession.userInfo.appearance,
        apiKey,
        selectedModel,
        additionalPrompt
      );
      processAIResponse(response, currentSessionId);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("invalid") || error.message === "MISSING_KEY") {
        setApiKeyError("Mã Key không hợp lệ, vui lòng kiểm tra lại");
        setIsApiKeyModalOpen(true);
      } else {
        showToast("Có lỗi xảy ra khi kết nối với nhân vật...");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      setNotebookEvents(session.notebookEvents || []);
      setCustomCharacters(session.customCharacters || []);
    }
  };

  const handleAddNotebookEvent = (event: string) => {
    if (notebookEvents.length >= 20) return;
    const newEvents = [...notebookEvents, event];
    setNotebookEvents(newEvents);
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, notebookEvents: newEvents } : s));
  };

  const handleDeleteNotebookEvent = (index: number) => {
    const newEvents = notebookEvents.filter((_, i) => i !== index);
    setNotebookEvents(newEvents);
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, notebookEvents: newEvents } : s));
  };

  const handleAddCustomCharacter = (char: CustomSideCharacter) => {
    const newChars = [...customCharacters, char];
    setCustomCharacters(newChars);
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, customCharacters: newChars } : s));
  };

  const handleDeleteCustomCharacter = (index: number) => {
    const newChars = customCharacters.filter((_, i) => i !== index);
    setCustomCharacters(newChars);
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, customCharacters: newChars } : s));
  };
  const handleRefresh = async () => {
    if (!currentSessionId || !currentSession || isTyping) return;
    
    // Remove last message if it was from assistant
    const lastMsg = currentSession.messages[currentSession.messages.length - 1];
    if (lastMsg.role !== "assistant") return;

    const newMessages = currentSession.messages.slice(0, -1);
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: newMessages, lastUpdate: Date.now() }
          : s
      )
    );

    setIsTyping(true);
    try {
      if (!apiKey) throw new Error("MISSING_KEY");

      let additionalPrompt = "";
      if (notebookEvents.length > 0) {
        additionalPrompt += `SỔ TAY SỰ KIỆN (Ghi nhớ quan trọng):\n${notebookEvents.map((e, i) => `${i+1}. ${e}`).join("\n")}\n\n`;
      }
      if (customCharacters.length > 0) {
        additionalPrompt += `NHÂN VẬT PHỤ MỚI XUẤT HIỆN:\n${customCharacters.map(c => `- ${c.name} (${c.gender}): ${c.role}. ${c.description}`).join("\n")}\n\n`;
      }

      const response = await sendMessage(
        newMessages,
        currentSession.userInfo.name,
        currentSession.userInfo.appearance,
        apiKey,
        selectedModel,
        additionalPrompt
      );
      processAIResponse(response, currentSessionId);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("invalid") || error.message === "MISSING_KEY") {
        setApiKeyError("Mã Key không hợp lệ, vui lòng kiểm tra lại");
        setIsApiKeyModalOpen(true);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleFastForward = async () => {
    if (!currentSessionId || !currentSession || isTyping) return;
    
    setIsTyping(true);
    try {
      if (!apiKey) throw new Error("MISSING_KEY");

      let additionalPrompt = "";
      if (notebookEvents.length > 0) {
        additionalPrompt += `SỔ TAY SỰ KIỆN (Ghi nhớ quan trọng):\n${notebookEvents.map((e, i) => `${i+1}. ${e}`).join("\n")}\n\n`;
      }
      if (customCharacters.length > 0) {
        additionalPrompt += `NHÂN VẬT PHỤ MỚI XUẤT HIỆN:\n${customCharacters.map(c => `- ${c.name} (${c.gender}): ${c.role}. ${c.description}`).join("\n")}\n\n`;
      }

      const response = await sendMessage(
        currentSession.messages,
        currentSession.userInfo.name,
        currentSession.userInfo.appearance,
        apiKey,
        selectedModel,
        additionalPrompt
      );
      processAIResponse(response, currentSessionId);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("invalid") || error.message === "MISSING_KEY") {
        setApiKeyError("Mã Key không hợp lệ, vui lòng kiểm tra lại");
        setIsApiKeyModalOpen(true);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    if (currentSessionId === id) setCurrentSessionId(null);
  };

  return (
    <div className="font-sans text-[#333]">
      <AnimatePresence mode="wait">
        {!currentSessionId ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <IntroScreen 
              onStart={handleStartChat} 
              onToggleSidebar={() => setIsSidebarOpen(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChatInterface
              messages={currentSession.messages}
              userInfo={currentSession.userInfo}
              onSendMessage={handleSendMessage}
              onBack={() => setCurrentSessionId(null)}
              onToggleSidebar={() => setIsSidebarOpen(true)}
              onRefresh={handleRefresh}
              onFastForward={handleFastForward}
              inventory={currentSession.inventory}
              onUseItem={() => {}} // Handled inside ChatInterface
              isTyping={isTyping}
              modelName={selectedModel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId || ""}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={() => setCurrentSessionId(null)}
        onChangeApiKey={() => setIsApiKeyModalOpen(true)}
        notebookEvents={notebookEvents}
        onAddNotebookEvent={handleAddNotebookEvent}
        onDeleteNotebookEvent={handleDeleteNotebookEvent}
        customCharacters={customCharacters}
        onAddCustomCharacter={handleAddCustomCharacter}
        onDeleteCustomCharacter={handleDeleteCustomCharacter}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onSave={handleSaveApiKey}
        error={apiKeyError}
        initialModel={selectedModel}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#ff99cc] text-white px-6 py-3 rounded-full shadow-lg z-50 font-bold text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
