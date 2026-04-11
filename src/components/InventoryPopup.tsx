import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Send, Sparkles, Gem, Scroll, Coins, Gift, Utensils, Flower2, Circle } from "lucide-react";

interface InventoryPopupProps {
  isOpen: boolean;
  items: string[];
  onAction: (item: string, type: "use" | "show") => void;
}

const getItemIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("nhẫn") || n.includes("vòng") || n.includes("hột xoàn") || n.includes("trâm") || n.includes("ximen")) return <Gem className="w-4 h-4" />;
  if (n.includes("thư") || n.includes("giấy") || n.includes("sổ") || n.includes("bản đồ")) return <Scroll className="w-4 h-4" />;
  if (n.includes("tiền") || n.includes("bạc") || n.includes("vàng") || n.includes("cắc")) return <Coins className="w-4 h-4" />;
  if (n.includes("quà") || n.includes("hộp")) return <Gift className="w-4 h-4" />;
  if (n.includes("bánh") || n.includes("trà") || n.includes("rượu") || n.includes("cơm")) return <Utensils className="w-4 h-4" />;
  if (n.includes("hoa") || n.includes("sen") || n.includes("nhài")) return <Flower2 className="w-4 h-4" />;
  if (n.includes("ngọc") || n.includes("cẩm thạch")) return <Circle className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
};

export const InventoryPopup: React.FC<InventoryPopupProps> = ({
  isOpen,
  items,
  onAction,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute bottom-full left-0 mb-4 w-64 bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden z-30"
        >
          <div className="p-3 bg-pink-50 border-b border-pink-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#ff99cc]" />
            <span className="text-sm font-bold text-[#333]">Túi đồ của bạn</span>
          </div>
          
          <div className="max-h-60 overflow-y-auto p-2">
            {items.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400 italic">Túi đồ trống rỗng...</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col p-3 rounded-xl bg-white border border-pink-50 hover:border-pink-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-[#ff99cc] flex-shrink-0">
                        {getItemIcon(item)}
                      </div>
                      <span className="text-sm text-[#333] font-bold truncate flex-1">{item}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAction(item, "use")}
                        className="flex-1 py-2 bg-pink-50 text-[#ff99cc] rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold hover:bg-pink-100 transition-colors active:scale-95"
                      >
                        Sử dụng
                      </button>
                      <button
                        onClick={() => onAction(item, "show")}
                        className="flex-1 py-2 bg-[#ff99cc] text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold hover:bg-[#ff80bf] transition-colors shadow-sm shadow-pink-100 active:scale-95"
                      >
                        Khoe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
