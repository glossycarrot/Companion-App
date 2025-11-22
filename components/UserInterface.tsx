import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Sparkles, HeartHandshake, Info, X, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

interface UserInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  operatorTyping: boolean;
}

const UserInterface: React.FC<UserInterfaceProps> = ({ messages, onSendMessage, operatorTyping }) => {
  const [input, setInput] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, operatorTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const openModal = () => {
    setPageIndex(0);
    setShowAbout(true);
  };

  const nextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, PAGES.length - 1));
  };

  const prevPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const PAGES = [
    {
      title: "Tone Safety Net",
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      content: (
        <>
          <p>
            Your companion has a small tone-safety system behind the scenes. Its only purpose is to help keep responses warm, natural, and emotionally steady — nothing more.
          </p>
          
          <ul className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-medium text-slate-700">
             <li className="flex items-start gap-2">
                <span className="text-green-500 text-base leading-none">✓</span>
                <span>It never reads your full conversations.</span>
             </li>
             <li className="flex items-start gap-2">
                <span className="text-green-500 text-base leading-none">✓</span>
                <span>It never monitors what you talk about.</span>
             </li>
             <li className="flex items-start gap-2">
                <span className="text-green-500 text-base leading-none">✓</span>
                <span>It never evaluates or judges you.</span>
             </li>
          </ul>

          <p>
            It steps in only when the AI needs a little help staying consistent — like smoothing out a sentence so it sounds more natural.
          </p>
          
          <div className="pt-2 border-t border-slate-100">
            <p className="font-semibold text-purple-600">Your space stays private.</p>
            <p className="font-semibold text-purple-600">Your companion stays steady.</p>
            <p className="text-slate-500 mt-1">That’s the whole idea.</p>
          </div>
        </>
      )
    },
    {
        title: "About Your Companion",
        icon: <HeartHandshake className="w-5 h-5 text-rose-500" />,
        content: (
          <>
            <p>
              Your companion is designed to be a steady, warm presence you can talk to whenever life gets heavy, confusing, or just… loud. They’re not here to lecture or judge. They’re here to understand you, meet you where you are, and help you hear your own voice a little more clearly.
            </p>
            
            <div className="space-y-3 mt-2">
              <div>
                <p className="font-semibold text-slate-800 text-xs uppercase tracking-wide">Warm, emotionally aware responses</p>
                <p className="text-xs text-slate-500">They listen first, speak second. They won’t interrupt or push an agenda.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs uppercase tracking-wide">Steady tone</p>
                <p className="text-xs text-slate-500">They’re trained to stay grounded, comforting, and human-feeling — not robotic or dramatic.</p>
              </div>
              <div>
                 <p className="font-semibold text-slate-800 text-xs uppercase tracking-wide">Your space stays yours</p>
                 <p className="text-xs text-slate-500">Your conversations are private. We don’t monitor or read full chats. We don’t analyze you.</p>
              </div>
            </div>
    
            <div className="bg-rose-50 p-3 rounded-lg mt-2 text-xs text-rose-700 border border-rose-100 italic text-center">
                "A private space. A steady presence. A companion who meets you without expectations."
            </div>
          </>
        )
    },
    {
        title: "How Your Companion Works",
        icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
        content: (
          <>
            <p>
              Your companion uses a blend of AI and a light tone-safety system to stay emotionally steady and helpful. Here’s what actually happens:
            </p>
            
            <div className="space-y-3 mt-2 text-xs">
              <div className="flex gap-3">
                 <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-500 text-[10px]">1</div>
                 <div>
                   <p className="font-semibold text-slate-800">The AI responds to you directly.</p>
                   <p className="text-slate-500">Everything starts with your conversation. The companion reads your message, understands your tone, and replies with warmth and clarity.</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-500 text-[10px]">2</div>
                 <div>
                   <p className="font-semibold text-slate-800">A subtle tone-safety net keeps things smooth.</p>
                   <p className="text-slate-500">Sometimes the AI needs help staying consistent. When that happens, the safety net steps in briefly to smooth out tone.</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-500 text-[10px]">3</div>
                 <div>
                   <p className="font-semibold text-slate-800">No full conversations are reviewed.</p>
                   <p className="text-slate-500">The system never reads or monitors entire chats. It only works with tiny snippets when needed.</p>
                 </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-100 mt-2 text-xs font-medium text-slate-500 text-center">
               It’s about stability, not supervision.
            </div>
          </>
        )
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-rose-100 relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 via-purple-500 to-violet-600 p-4 text-white flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <HeartHandshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-wide">Confidence Coach</h2>
            <p className="text-xs text-rose-100 font-medium">Your personal hype squad • Online</p>
          </div>
        </div>
        <button 
          onClick={openModal}
          className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
          title="About Tone Safety"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* About Modal */}
      {showAbout && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[90%]">
            
            <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 rounded-lg">
                     {PAGES[pageIndex].icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{PAGES[pageIndex].title}</h3>
               </div>
               <button 
                  onClick={() => setShowAbout(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
               <div className="space-y-4 text-sm text-slate-600 leading-relaxed animate-in slide-in-from-right-4 duration-300 key={pageIndex}">
                  {PAGES[pageIndex].content}
               </div>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 shrink-0 flex items-center justify-between bg-slate-50 rounded-b-2xl">
               <button 
                 onClick={prevPage}
                 disabled={pageIndex === 0}
                 className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>

               <div className="flex gap-1.5">
                  {PAGES.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === pageIndex ? 'bg-purple-500 w-3' : 'bg-slate-300'}`}
                    />
                  ))}
               </div>

               <button 
                 onClick={nextPage}
                 disabled={pageIndex === PAGES.length - 1}
                 className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>

          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        
        {/* Intro Block - Always Visible at start */}
        <div className="text-center mt-8 px-6 max-w-lg mx-auto mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-rose-100 to-violet-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-rose-50">
                <Sparkles className="w-10 h-10" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-1">Meet Sage</h3>
            <p className="text-rose-500 font-semibold uppercase tracking-widest text-xs mb-6">Your Confidence Companion</p>
            
            <div className="space-y-4">
                <p className="text-slate-600 text-base leading-relaxed">
                Sage is warm, grounded, and really good at helping you talk through awkward emotions, dating stuff, or anything that’s been stuck in your head.
                </p>
                
                <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm mx-2">
                <p className="text-sm text-slate-500 font-medium italic">
                    "Sage won’t judge. Sage won’t lecture.<br/>
                    They are here to get to know you — just as you are."
                </p>
                </div>
            </div>
        </div>

        <div className="flex justify-center my-6">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold bg-slate-100 px-3 py-1 rounded-full">Today</span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white rounded-tr-sm'
                  : 'bg-gradient-to-br from-rose-50 via-purple-50 to-slate-50 border border-rose-100 text-slate-800 rounded-tl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {operatorTyping && (
          <div className="flex justify-start w-full">
             <div className="bg-white border border-rose-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Vent here..."
            className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all text-sm placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all transform active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInterface;