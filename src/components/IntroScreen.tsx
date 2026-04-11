import React from "react";
import { motion } from "motion/react";
import { CHAR_AVATAR, INTRO_HISTORY } from "../constants";
import { UserInfo } from "../types";
import { Info, History as HistoryIcon, MoreVertical } from "lucide-react";

interface IntroScreenProps {
  onStart: (userInfo: UserInfo) => void;
  onToggleSidebar: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onToggleSidebar }) => {
  const [name, setName] = React.useState("");
  const [appearance, setAppearance] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"info" | "history">("info");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onStart({
      name: name.trim(),
      appearance: appearance.trim() || "Thừa hưởng nhan sắc thanh khiết hệt như một đóa sen trắng từ người mẹ quá cố.",
      age: 18,
      background: "Con gái bà Lành, bị ép làm con ở tại dinh thự Sài Gòn."
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex flex-col items-center p-6 overflow-y-auto">
      {/* Header for Intro Screen */}
      <div className="w-full max-w-2xl flex justify-end mb-4">
        <button 
          onClick={onToggleSidebar}
          className="p-3 bg-white/50 hover:bg-white rounded-full transition-colors shadow-sm border border-pink-100"
        >
          <MoreVertical className="w-6 h-6 text-[#333]" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-pink-100 mb-8"
      >
        {/* Character Info Section */}
        <div className="p-8 flex flex-col items-center text-center border-b border-pink-50">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-[#ffb6c1] p-1 shadow-lg">
              <img
                src={CHAR_AVATAR}
                alt="Lê Hoài Nam"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-2 right-0 bg-[#ff99cc] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Quan Đốc
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[#333] mb-2">Lê Hoài Nam</h1>
          <p className="text-[#ff99cc] font-medium mb-4">Đốc phủ sứ Sài Gòn - Gia Định</p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "info" ? "bg-[#ffb6c1] text-white shadow-md" : "bg-pink-50 text-[#ffb6c1]"
              }`}
            >
              <Info className="w-4 h-4" />
              Thông tin công khai
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "history" ? "bg-[#ffb6c1] text-white shadow-md" : "bg-pink-50 text-[#ffb6c1]"
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              Lịch sử
            </button>
          </div>

          <div className="text-left w-full bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
            {activeTab === "info" ? (
              <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
                <p><strong>Giới tính:</strong> Nam</p>
                <p><strong>Tuổi:</strong> 43</p>
                <p><strong>Thân thế:</strong> Quan chức hành chính cao cấp bậc nhứt thời Pháp thuộc, nắm quyền sinh sát lục tỉnh Nam Kỳ.</p>
                <p><strong>Tài sản:</strong> Giàu nứt đố đổ vách, chủ sở hữu nhiều bến cảng, chuỗi nhà kho và điền sản rộng lớn.</p>
              </div>
            ) : (
              <div className="text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto pr-2">
                {INTRO_HISTORY.split("\n\n").map((p, i) => (
                  <p key={i} className="mb-3 italic">{p}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Info Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#333] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#ff99cc] rounded-full"></span>
            Thông tin của bạn
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Tên của bạn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên..."
                className="w-full px-5 py-3 bg-pink-50 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffb6c1] transition-all text-[#333]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 ml-1">Ngoại hình / Đặc điểm</label>
              <textarea
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="Mô tả ngoại hình của bạn (mặc định: nhan sắc thanh khiết hệt như đóa sen trắng)..."
                rows={4}
                className="w-full px-5 py-3 bg-pink-50 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffb6c1] transition-all text-[#333] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#ff99cc] hover:bg-[#ff80bf] text-white font-bold text-lg rounded-2xl shadow-lg shadow-pink-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Bắt đầu trò chuyện
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
