
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
      icon: <Sparkles className="w-6 h-6 text-violet-600" />,
      color: "bg-violet-100",
      content: (
        <>
          <p className="text-lg font-medium text-slate-700 mb-4">
            Keeps things warm, natural, and steady.
          </p>
          
          <div className="space-y-3 mb-6">
             <div className="bg-emerald-50 p-3 rounded-2xl flex items-center gap-3 text-emerald-800 font-medium text-sm transition-transform hover:scale-[1.02]">
                <span className="bg-emerald-100 p-1 rounded-full">✓</span>
                <span>No reading full chats.</span>
             </div>
             <div className="bg-emerald-50 p-3 rounded-2xl flex items-center gap-3 text-emerald-800 font-medium text-sm transition-transform hover:scale-[1.02]">
                <span className="bg-emerald-100 p-1 rounded-full">✓</span>
                <span>No monitoring topics.</span>
             </div>
             <div className="bg-emerald-50 p-3 rounded-2xl flex items-center gap-3 text-emerald-800 font-medium text-sm transition-transform hover:scale-[1.02]">
                <span className="bg-emerald-100 p-1 rounded-full">✓</span>
                <span>No judging you.</span>
             </div>
          </div>

          <div className="bg-slate-100 rounded-3xl p-4 text-center">
            <p className="font-bold text-violet-600">Your privacy intact.</p>
            <p className="text-slate-500 text-sm mt-1">Just helpful tone adjustments.</p>
          </div>
        </>
      )
    },
    {
        title: "About Sage",
        icon: <HeartHandshake className="w-6 h-6 text-rose-500" />,
        color: "bg-rose-100",
        content: (
          <>
            <p className="text-slate-600 mb-6">
              A steady, warm presence for when life gets loud. Not here to lecture. Here to listen.
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm transition-transform hover:rotate-1 origin-top-left">
                <p className="font-bold text-slate-800 text-sm mb-1">Warm Response</p>
                <p className="text-xs text-slate-500">Listens first. Speaks second.</p>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm transition-transform hover:-rotate-1 origin-top-right">
                <p className="font-bold text-slate-800 text-sm mb-1">Steady Tone</p>
                <p className="text-xs text-slate-500">Grounded, comforting, human.</p>
              </div>
            </div>
    
            <div className="mt-6 text-center">
                <span className="inline-block bg-rose-100 text-rose-600 px-4 py-2 rounded-full text-xs font-bold tracking-wide animate-pulse">
                    NO JUDGMENT ZONE
                </span>
            </div>
          </>
        )
    },
    {
        title: "How It Works",
        icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
        color: "bg-blue-100",
        content: (
          <>
            <div className="space-y-4">
              <div className="flex gap-4 items-start group">
                 <div className="w-8 h-8 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-600 text-sm group-hover:scale-110 transition-transform">1</div>
                 <div>
                   <p className="font-bold text-slate-800 text-sm">AI Responds</p>
                   <p className="text-xs text-slate-500 mt-1">Reads tone, replies with warmth.</p>
                 </div>
              </div>
              <div className="flex gap-4 items-start group">
                 <div className="w-8 h-8 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-600 text-sm group-hover:scale-110 transition-transform">2</div>
                 <div>
                   <p className="font-bold text-slate-800 text-sm">Safety Net Checks</p>
                   <p className="text-xs text-slate-500 mt-1">Smooths out robotic edges.</p>
                 </div>
              </div>
              <div className="flex gap-4 items-start group">
                 <div className="w-8 h-8 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 font-bold text-blue-600 text-sm group-hover:scale-110 transition-transform">3</div>
                 <div>
                   <p className="font-bold text-slate-800 text-sm">Privacy First</p>
                   <p className="text-xs text-slate-500 mt-1">No full chat reviews.</p>
                 </div>
              </div>
            </div>
          </>
        )
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc] relative font-sans overflow-hidden">
      
      {/* Modular Header */}
      <div className="p-4 shrink-0 z-10">
        <div className="bg-gradient-to-r from-violet-100 via-fuchsia-50 to-rose-100 text-slate-800 border border-white rounded-[2rem] p-5 shadow-xl shadow-purple-100/50 flex items-center justify-between relative overflow-hidden transition-all hover:shadow-purple-200/60">
            {/* Decorative circles */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/60 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-300/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-orange-300 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <span className="text-xl animate-[pulse_3s_ease-in-out_infinite]">✨</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-xl leading-tight text-slate-800">Sage</h2>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <p className="text-xs text-slate-500 font-medium">Here for you</p>
                        </div>
                    </div>
                </div>
            </div>

            <button 
            onClick={openModal}
            className="relative z-10 w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition-all backdrop-blur-md text-slate-600 shadow-sm hover:scale-110"
            >
            <Info className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* About Modal (Sheet Style) */}
      {showAbout && (
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full sm:w-[340px] sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300 overflow-hidden flex flex-col max-h-[90%]">
            
            {/* Modal Header */}
            <div className={`p-6 pb-4 ${PAGES[pageIndex].color} transition-colors duration-500`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-white/50 backdrop-blur-sm p-3 rounded-2xl shadow-sm transform transition-transform hover:scale-105">
                        {PAGES[pageIndex].icon}
                    </div>
                    <button 
                        onClick={() => setShowAbout(false)}
                        className="w-8 h-8 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition-colors text-slate-800"
                        >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{PAGES[pageIndex].title}</h3>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">
               <div className="animate-in slide-in-from-right-8 fade-in duration-300 key={pageIndex}">
                  {PAGES[pageIndex].content}
               </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 pt-2 pb-6 flex items-center justify-between">
               <button 
                 onClick={prevPage}
                 disabled={pageIndex === 0}
                 className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:bg-slate-50 flex items-center justify-center transition-all"
               >
                 <ChevronLeft className="w-5 h-5 text-slate-600" />
               </button>

               <div className="flex gap-2">
                  {PAGES.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2 rounded-full transition-all duration-300 ${i === pageIndex ? 'bg-slate-800 w-6' : 'bg-slate-200 w-2'}`}
                    />
                  ))}
               </div>

               <button 
                 onClick={nextPage}
                 disabled={pageIndex === PAGES.length - 1}
                 className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:bg-slate-200 flex items-center justify-center transition-all shadow-lg shadow-slate-200 hover:scale-105 active:scale-95"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>

          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-6 perspective-[1000px]">
        
        {/* Intro Block */}
        <div className="text-center mt-4 px-4 mb-10 animate-in fade-in zoom-in duration-700">
            <div className="inline-flex items-center justify-center p-1 bg-white rounded-full border border-slate-100 shadow-sm mb-6 hover:scale-105 transition-transform">
                <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Session Start
                </div>
            </div>
            
            <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Meet Sage.</h3>
            <p className="text-slate-500 text-base leading-relaxed max-w-[260px] mx-auto">
                Your Confidence Companion.
                <br/>
                <span className="text-rose-400 font-medium">No judgment. Just vibes.</span>
            </p>
        </div>

        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500 fill-mode-both`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`flex max-w-[85%] p-5 shadow-sm text-[15px] leading-relaxed transition-all duration-300 hover:scale-[1.02] ${
                msg.role === 'user'
                  ? 'bg-violet-100 text-slate-800 rounded-[1.5rem] rounded-br-sm hover:-rotate-1 origin-bottom-right'
                  : 'bg-white border border-slate-100 text-slate-800 rounded-[1.5rem] rounded-tl-sm hover:rotate-1 origin-bottom-left'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {operatorTyping && (
          <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2">
             <div className="bg-white border border-slate-100 rounded-[1.5rem] rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5 w-fit">
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Floating Pill */}
      <div className="p-4 pb-5 pt-0 bg-gradient-to-t from-[#fcfcfc] to-transparent shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2 shadow-2xl shadow-slate-200/60 rounded-[2rem] group hover:scale-[1.01] transition-transform">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type here..."
            className="w-full pl-6 pr-14 py-4 bg-white border-2 border-white focus:border-rose-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-50 transition-all text-base placeholder-slate-400 text-slate-800"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-2 bottom-2 w-12 bg-rose-400 text-white rounded-full hover:bg-rose-500 disabled:opacity-30 disabled:bg-slate-200 transition-all transform active:scale-90 flex items-center justify-center shadow-lg shadow-rose-200 hover:shadow-rose-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInterface;
