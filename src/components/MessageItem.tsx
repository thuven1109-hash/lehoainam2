import React from "react";
import { cn } from "../lib/utils";
import { CHAR_AVATAR } from "../constants";

interface MessageItemProps {
  content: string;
  role: "user" | "assistant";
  userName: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  content,
  role,
  userName,
}) => {
  const isAssistant = role === "assistant";

  // Replace {{user}} with actual name
  const processedContent = content.replace(/{{user}}/g, userName);

  // Split into paragraphs based on \n or \n\n
  const paragraphs = processedContent.split(/\n+/);

  const formatText = (text: string) => {
    // Regex for quotes: "..." or “…”
    const quoteRegex = /(".*?"|“.*?”)/g;
    
    // Split by quotes to handle them separately
    const parts = text.split(quoteRegex);

    return parts.map((part, index) => {
      if (part.match(quoteRegex)) {
        return (
          <span
            key={index}
            className="text-[#005bb5] font-medium"
          >
            {part}
          </span>
        );
      }
      // Non-quote parts are narration (italicized)
      return <span key={index} className="italic">{part}</span>;
    });
  };

  return (
    <div
      className={cn(
        "flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] items-end gap-2",
          isAssistant ? "flex-row" : "flex-row-reverse"
        )}
      >
        {isAssistant && (
          <div className="flex-shrink-0 mb-1">
            <img
              src={CHAR_AVATAR}
              alt="AI Avatar"
              className="w-8 h-8 rounded-full border border-pink-200"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        
        <div
          className={cn(
            "p-4 rounded-2xl shadow-sm",
            isAssistant
              ? "bg-white text-[#333] rounded-bl-none"
              : "bg-[#ffb6c1] text-[#333] rounded-br-none"
          )}
        >
          {paragraphs.map((p, i) => (
            <p key={i} className={cn("leading-relaxed", i < paragraphs.length - 1 && "mb-3")}>
              {formatText(p)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
