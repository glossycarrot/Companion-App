
import React, { useState, useEffect, useRef } from 'react';
import { Message, SystemConfig } from '../types';
import { generateSuggestedResponse } from '../services/geminiService';
import { 
  Settings, 
  Sparkles, 
  SendHorizontal, 
  User, 
  Cpu,
  Clock,
  StickyNote,
  MessageSquare
} from 'lucide-react';
import { 
  SYSTEM_INSTRUCTION, 
  QUICK_REPLIES, 
  DEFAULT_NOTES_TEMPLATE 
} from '../localConfig';

interface OperatorDashboardProps {
  messages: Message[];
  onSendResponse: (text: string) => void;
  setOperatorTyping: (typing: boolean) => void;
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ 
  messages, 
  onSendResponse,
  setOperatorTyping
}) => {
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for modular panels
  const [showNotes, setShowNotes] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const [notes, setNotes] = useState(DEFAULT_NOTES_TEMPLATE);
  
  // Auto-save state for notes
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.85
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const lastMessage = messages[messages.length - 1];
  const isUserTurn = lastMessage?.role === 'user';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isUserTurn && messages.length > 0) {
       handleGenerateSuggestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isUserTurn]);

  useEffect(() => {
    setOperatorTyping(draft.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  useEffect(() => {
    if (notes === DEFAULT_NOTES_TEMPLATE && lastSaved === null) return;

    setIsSaving(true);
    const timeoutId = setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [notes]);

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    setDraft('');
    try {
      const suggestion = await generateSuggestedResponse(messages, systemConfig);
      setDraft(suggestion);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    if (!draft.trim()) return;
    onSendResponse(draft);
    setDraft('');
  };

  return (
    <div className="h-full flex flex-col gap-4 p-2">
      
      {/* Top Bento Row: Header & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        
        {/* Brand/Status Card */}
        <div className="bg-slate-900 text-white rounded-[2rem] p-6 flex flex-col justify-between shadow-xl border border-slate-800 md:col-span-2 relative overflow-hidden group">
            {/* Subtle light glow on hover */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 blur-3xl group-hover:bg-rose-500/20 transition-colors duration-500" />
            
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 border border-rose-500/30">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg tracking-tight">Operator Console</h2>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">SYS_READY</span>
                           <span className="text-xs text-slate-400">Human-in-the-Loop</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setShowNotes(!showNotes)}
                     className={`p-3 rounded-full transition-all ${showNotes ? 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                   >
                     <StickyNote className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={() => setShowSettings(!showSettings)}
                     className={`p-3 rounded-full transition-all ${showSettings ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                   >
                     <Settings className="w-5 h-5" />
                   </button>
                </div>
            </div>
        </div>

        {/* Stats Card */}
        <div className="bg-slate-800 rounded-[2rem] p-5 flex flex-col justify-center items-center border border-slate-700 shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1 text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                    <span className="font-bold text-sm tracking-wide">ONLINE</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>LATENCY: 120ms</span>
                </div>
            </div>
        </div>
      </div>

      {/* Middle Bento: Main Content Split */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        
        {/* Left Col: Chat History & Settings */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
             
             {/* Settings Drawer */}
             {showSettings && (
                <div className="bg-[#1e1c24] rounded-[2rem] p-5 border border-slate-700 animate-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider">System Persona</label>
                    <textarea 
                        value={systemConfig.systemInstruction}
                        onChange={(e) => setSystemConfig({...systemConfig, systemInstruction: e.target.value})}
                        className="w-full bg-black/30 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:border-purple-500 focus:outline-none h-24 resize-none mb-3 font-mono"
                    />
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 w-16">Creativity</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={systemConfig.temperature}
                            onChange={(e) => setSystemConfig({...systemConfig, temperature: parseFloat(e.target.value)})}
                            className="flex-1 accent-purple-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs font-mono text-purple-400">{systemConfig.temperature}</span>
                    </div>
                </div>
             )}

             {/* Chat Stream - Enhanced with Grid and Lighting */}
             <div className="flex-1 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-inner overflow-hidden flex flex-col relative">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.6)_100%)] pointer-events-none" />
                
                {/* Corner Light Leaks */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 blur-[60px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/10 blur-[60px] pointer-events-none" />

                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-slate-900 to-transparent z-10" />
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 relative z-20">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-30">
                            <MessageSquare className="w-12 h-12 mb-2" />
                            <p className="text-sm font-medium font-mono">WAITING_FOR_SIGNAL...</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={msg.id} className={`flex flex-col animate-in slide-in-from-left-4 duration-300 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <span className="text-[9px] font-mono text-slate-500 mb-1 px-2 uppercase tracking-widest">{msg.role === 'user' ? 'User_In' : 'Sys_Out'}</span>
                                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-lg ${
                                    msg.role === 'user' 
                                    ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                                    : 'bg-rose-900/20 text-rose-200 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent z-10" />
             </div>
        </div>

        {/* Right Col: Notes & Drafting */}
        <div className="flex-1 md:max-w-md flex flex-col gap-4 min-h-0">
             
             {/* Notes Module - Tactile Mission Log Style */}
             {showNotes && (
                 <div className="bg-[#1e1c24] rounded-[2rem] p-1 flex flex-col border border-slate-700 shadow-lg h-1/3 min-h-[200px] animate-in slide-in-from-right-4 group/notes transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                    <div className="px-5 py-3 flex justify-between items-center border-b border-white/5 bg-slate-800/50 rounded-t-[1.8rem]">
                        <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider flex items-center gap-2">
                            <StickyNote className="w-3 h-3" /> Mission Log
                        </span>
                        <span className={`text-[9px] font-mono ${isSaving ? 'text-yellow-400 animate-pulse' : 'text-slate-600'}`}>
                            {isSaving ? 'WRITING_TO_DISK...' : lastSaved ? `SAVED_${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'IDLE'}
                        </span>
                    </div>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="flex-1 w-full bg-transparent text-slate-300 p-4 text-xs focus:outline-none resize-none font-mono leading-relaxed opacity-60 focus:opacity-100 group-hover/notes:opacity-100 transition-opacity duration-300 placeholder-slate-600 focus:bg-slate-900/30 rounded-b-[1.8rem]"
                        placeholder="> Enter session notes..."
                        spellCheck={false}
                    />
                 </div>
             )}

             {/* Drafting Module */}
             <div className="flex-1 bg-slate-800 rounded-[2.5rem] p-2 flex flex-col gap-2 border border-slate-700 shadow-2xl relative overflow-hidden">
                
                {/* AI Suggestion Output Area (as part of input) */}
                <div className="relative flex-1 group">
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Drafting response..."
                        className="w-full h-full bg-slate-900/50 rounded-[2rem] p-6 text-base text-white placeholder-slate-600 focus:bg-slate-900 focus:ring-2 focus:ring-rose-500/50 focus:outline-none resize-none transition-all"
                    />
                    {/* Send Button Floating */}
                    <button 
                        onClick={handleSend}
                        disabled={!draft.trim()}
                        className="absolute bottom-4 right-4 w-14 h-14 bg-rose-500 hover:bg-rose-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-900/50 transition-all disabled:opacity-50 disabled:scale-95 active:scale-90 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                    >
                        <SendHorizontal className="w-6 h-6" />
                    </button>
                </div>

                {/* Quick Actions Chips */}
                <div className="bg-slate-900/50 rounded-[2rem] p-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mask-fade px-1">
                         <button 
                             onClick={handleGenerateSuggestion}
                             disabled={isGenerating}
                             className="whitespace-nowrap px-4 py-3 bg-purple-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30 hover:bg-purple-500 transition-all hover:scale-105 active:scale-95"
                           >
                             <Sparkles className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                             {isGenerating ? 'PROCESSING...' : 'AI_DRAFT'}
                         </button>
                        {QUICK_REPLIES.map((reply, i) => (
                            <button 
                                key={i}
                                onClick={() => setDraft(draft + (draft ? ' ' : '') + reply)}
                                className="whitespace-nowrap px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-2xl text-xs font-medium transition-all border border-slate-600 hover:border-slate-500 hover:scale-105 active:scale-95"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>

             </div>
        </div>

      </div>
    </div>
  );
};

export default OperatorDashboard;
