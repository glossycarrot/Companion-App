
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
  Heart,
  StickyNote
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
  
  // Manage which side panel/tool is open
  const [activePanel, setActivePanel] = useState<'settings' | 'notes' | null>(null);
  const [notes, setNotes] = useState(DEFAULT_NOTES_TEMPLATE);
  
  // Auto-save state for notes
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Updated default config for the "Sage" persona
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.85
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the last message. If it's from a user and pending, we need to reply.
  const lastMessage = messages[messages.length - 1];
  const isUserTurn = lastMessage?.role === 'user';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-generate suggestion when a new user message arrives
  useEffect(() => {
    if (isUserTurn && messages.length > 0) {
       handleGenerateSuggestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isUserTurn]);

  // Update typing status in parent when draft changes
  useEffect(() => {
    setOperatorTyping(draft.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  // Auto-save effect for notes
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
    setDraft(''); // Clear previous draft while loading
    
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

  const togglePanel = (panel: 'settings' | 'notes') => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400" />
          <h2 className="font-semibold tracking-wide">Coaching Dashboard</h2>
          <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
            Human-in-the-loop
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => togglePanel('notes')}
            className={`p-2 rounded hover:bg-slate-700 transition-colors ${activePanel === 'notes' ? 'bg-slate-700 text-rose-400' : 'text-slate-400'}`}
            title="Session Notes"
          >
            <StickyNote className="w-5 h-5" />
          </button>
          <button 
            onClick={() => togglePanel('settings')}
            className={`p-2 rounded hover:bg-slate-700 transition-colors ${activePanel === 'settings' ? 'bg-slate-700 text-rose-400' : 'text-slate-400'}`}
            title="Bot Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tools Panel (Collapsible) */}
      {activePanel === 'settings' && (
        <div className="bg-slate-850 p-4 border-b border-slate-700 space-y-4 bg-black/20 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="block text-xs font-medium text-rose-300 mb-1">Coach Persona (System Instruction)</label>
            <textarea 
              value={systemConfig.systemInstruction}
              onChange={(e) => setSystemConfig({...systemConfig, systemInstruction: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-sm text-slate-200 focus:ring-1 focus:ring-rose-500 focus:outline-none h-32 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-rose-300 mb-1">Temperature: {systemConfig.temperature}</label>
             <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={systemConfig.temperature}
                onChange={(e) => setSystemConfig({...systemConfig, temperature: parseFloat(e.target.value)})}
                className="w-full accent-rose-500 cursor-pointer"
             />
             <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Precise</span>
                <span>Creative</span>
             </div>
          </div>
        </div>
      )}

      {activePanel === 'notes' && (
        <div className="bg-slate-850 p-4 border-b border-slate-700 space-y-2 bg-black/20 animate-in slide-in-from-top-2 duration-200">
           <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-rose-300">Session Notes & Observations</span>
              <span className={`transition-colors ${isSaving ? 'text-purple-400' : 'text-slate-500'}`}>
                  {isSaving ? (
                    <span className="flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"/>
                       Saving...
                    </span>
                  ) : lastSaved ? (
                    `Saved ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                  ) : (
                    'Private'
                  )}
              </span>
           </div>
           <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-sm text-slate-200 focus:ring-1 focus:ring-rose-500 focus:outline-none h-48 resize-none font-mono"
              placeholder="Track user progress here..."
            />
        </div>
      )}

      {/* Messages Preview */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
         {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                <User className="w-12 h-12 opacity-20" />
                <p className="text-sm">Waiting for user...</p>
            </div>
         ) : (
             messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-xl px-4 py-3 text-sm shadow-sm ${
                      msg.role === 'user' 
                      ? 'bg-slate-800 text-slate-300 rounded-tr-none border border-slate-700' 
                      : 'bg-gradient-to-br from-rose-900/40 to-purple-900/40 text-rose-100 border border-rose-500/30 rounded-tl-none'
                  }`}>
                      {msg.content}
                  </div>
              </div>
             ))
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Controls & Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700 space-y-3">
        
        {/* AI Suggestion Status */}
        {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-purple-400 animate-pulse px-1">
                <Sparkles className="w-3 h-3" />
                <span>Sage is crafting a response...</span>
            </div>
        )}

        {/* Quick Actions / Suggestion */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
           {QUICK_REPLIES.map((reply, i) => (
               <button 
                key={i}
                onClick={() => setDraft(draft + (draft ? ' ' : '') + reply)}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 transition-colors border border-slate-600"
               >
                {reply}
               </button>
           ))}
           <button 
             onClick={handleGenerateSuggestion}
             disabled={isGenerating}
             className="whitespace-nowrap px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-full text-xs flex items-center gap-1 transition-colors"
           >
             <Cpu className="w-3 h-3" />
             Regenerate
           </button>
        </div>

        {/* Input Box */}
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl opacity-20 group-focus-within:opacity-50 transition duration-500 blur"></div>
            <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type response or use AI suggestion..."
                className="relative w-full bg-slate-900 border border-slate-600 rounded-xl p-3 pr-12 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500/50 focus:border-transparent focus:outline-none resize-none h-28 shadow-inner"
            />
            <button 
                onClick={handleSend}
                disabled={!draft.trim()}
                className="absolute bottom-3 right-3 p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/20"
            >
                <SendHorizontal className="w-4 h-4" />
            </button>
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-slate-500 px-1">
            <div className="flex items-center gap-1">
               <Clock className="w-3 h-3" />
               <span>Latency: ~120ms</span>
            </div>
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-500/80">System Online</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
