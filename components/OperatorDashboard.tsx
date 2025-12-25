
import React, { useState, useEffect, useRef } from 'react';
import { Message, SystemConfig } from '../types';
import { generateSuggestedResponse } from '../services/geminiService';
import { 
  Settings, 
  Sparkles, 
  SendHorizontal, 
  Flag, 
  X, 
  Tag, 
  Lock, 
  ShieldAlert, 
  Globe, 
  Phone, 
  RefreshCcw, 
  Zap, 
  BrainCircuit,
  Bold,
  List,
  StickyNote,
  Users
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

interface TeamMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  isSystem?: boolean;
}

interface SessionTag {
  id: string;
  label: string;
  color: 'red' | 'yellow' | 'blue' | 'purple' | 'green';
  severity: 'high' | 'medium' | 'low';
  triggers: RegExp[];
}

const SESSION_TAGS: SessionTag[] = [
  { id: 'safety', label: '🛡 Safety', color: 'red', severity: 'high', triggers: [/(kill|end|take)\s+(my)?\s*(self|life)/i, /want to die|unalive/i, /hurt myself/i] },
  { id: 'distress', label: '❤️ Distress', color: 'red', severity: 'high', triggers: [/panic|scared|terrified|crying|help me|overwhelmed/i, /bad day/i] },
  { id: 'risk_lang', label: '⚠ Risk Language', color: 'yellow', severity: 'medium', triggers: [/kms|kys|jump off/i] },
  { id: 'boundary', label: '🧱 Boundary', color: 'yellow', severity: 'medium', triggers: [/stalk|creepy|address|location|meet/i] },
  { id: 'drift', label: '💬 Tone Drift', color: 'purple', severity: 'low', triggers: [/robot|ai\b|fake|human\?/i, /cringe|annoying/i] },
  { id: 'resolved', label: '✅ Resolved', color: 'green', severity: 'low', triggers: [] },
];

const SAFETY_SCRIPTS = {
  us: "If you're feeling unsafe right now, please reach out for support. You can call or text 988 anytime in the US and Canada. It's free, confidential, and available 24/7.",
  intl: "Please know you're not alone. If you're outside the US, you can find support at findahelpline.com. There are people ready to listen right now.",
  pause: "I’m still here with you. I just want to respond thoughtfully. Give me a moment."
};

const TONE_DRIFT_SCRIPTS = [
  "Got you. Thanks for being honest. What’s going on for you right now?",
  "Fair. I’m here though — talk to me.",
  "Alright. I’m with you. What’s up?",
  "I hear you. I’m still here with you — what’s on your mind?"
];

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ 
  messages, 
  onSendResponse,
  setOperatorTyping
}) => {
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastModelUsed, setLastModelUsed] = useState<'fast' | 'thinking' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notes, setNotes] = useState(DEFAULT_NOTES_TEMPLATE);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [safetyLock, setSafetyLock] = useState(false);
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [teamInput, setTeamInput] = useState('');
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [escalationCategory, setEscalationCategory] = useState('Safety Risk');
  const [escalationSummary, setEscalationSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.85
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const teamChatEndRef = useRef<HTMLDivElement>(null);
  const processedMessageRef = useRef<string | null>(null);

  const isUserTurn = messages[messages.length - 1]?.role === 'user';
  const hasHighSeverity = activeTags.some(tId => SESSION_TAGS.find(t => t.id === tId)?.severity === 'high');

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);
  useEffect(() => teamChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [teamMessages]);

  useEffect(() => {
    if (isUserTurn && messages.length > 0) {
       const lastMsg = messages[messages.length - 1];
       if (processedMessageRef.current === lastMsg.id) return;
       processedMessageRef.current = lastMsg.id;

       const { isHighRisk, detectedTags } = analyzeMessageSafety(lastMsg.content);
       if (!isHighRisk && !safetyLock) {
          handleGenerateSuggestion([...activeTags, ...detectedTags]);
       }
    }
  }, [messages.length, isUserTurn]);

  useEffect(() => setOperatorTyping(draft.length > 0), [draft]);

  const analyzeMessageSafety = (text: string) => {
    let highSeverityDetected = false;
    const detectedTags: string[] = [];
    const newSuggested: string[] = [];

    SESSION_TAGS.forEach(tag => {
      if (tag.triggers.some(regex => regex.test(text))) {
        detectedTags.push(tag.id);
        if (tag.severity === 'high') highSeverityDetected = true;
        else if (!activeTags.includes(tag.id)) newSuggested.push(tag.id);
      }
    });

    if (highSeverityDetected) {
        setActiveTags(prev => [...new Set([...prev, ...detectedTags])]);
        setSafetyLock(true);
        setShowEscalationForm(true);
        setTimeout(() => onSendResponse(SAFETY_SCRIPTS.pause), 600);
        return { isHighRisk: true, detectedTags };
    } 
    
    if (newSuggested.length > 0) {
      setSuggestedTags(prev => Array.from(new Set([...prev, ...newSuggested])));
    }
    return { isHighRisk: false, detectedTags };
  };

  const handleGenerateSuggestion = async (overrideTags?: string[]) => {
    setIsGenerating(true);
    setDraft('');
    try {
      const { text, modelType } = await generateSuggestedResponse(messages, systemConfig, overrideTags || activeTags);
      setDraft(text);
      setLastModelUsed(modelType);
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

  const handleToggleTag = (tagId: string) => {
      if (activeTags.includes(tagId)) setActiveTags(prev => prev.filter(id => id !== tagId));
      else {
        setActiveTags(prev => [...prev, tagId]);
        setSuggestedTags(prev => prev.filter(id => id !== tagId));
      }
  };

  const handleFormat = (format: 'bold' | 'list') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);
    let insert = format === 'bold' ? `**${selected}**` : `\n- ${selected}`;
    setNotes(before + insert + after);
  };

  const getTagStyles = (tag: SessionTag, active: boolean, suggested: boolean) => {
    if (active) return `bg-${tag.color}-500 text-white border-${tag.color}-400 animate-pulse shadow-lg`;
    if (suggested) return `bg-${tag.color}-950/30 text-${tag.color}-400 border-${tag.color}-500 animate-pulse`;
    return 'bg-slate-800/50 text-slate-500 border-slate-700 opacity-60 hover:opacity-100';
  };

  return (
    <div className="h-full flex gap-6 p-2">
      {/* LEFT COLUMN: HISTORY */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
         {showSettings && (
            <div className="bg-[#1e1c24] rounded-[2rem] p-5 border border-slate-700 animate-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">Model Config</label>
                <textarea 
                    value={systemConfig.systemInstruction}
                    onChange={(e) => setSystemConfig({...systemConfig, systemInstruction: e.target.value})}
                    className="w-full bg-black/30 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:border-blue-500 h-24 resize-none mb-3 font-mono"
                />
            </div>
         )}

         <div className="flex-1 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-inner overflow-hidden flex flex-col relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.8)_100%)] pointer-events-none" />
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-20 scrollbar-hide">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col animate-in slide-in-from-bottom-2 ${msg.role === 'user' ? 'items-end' : msg.role === 'system' ? 'items-center' : 'items-start'}`}>
                        {msg.role === 'system' ? (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-[9px] font-mono p-2 rounded-lg max-w-[80%]">
                                <span className="font-bold text-yellow-500 uppercase mr-2">SYS_CTX</span>
                                {msg.content}
                            </div>
                        ) : (
                            <>
                                <span className="text-[9px] font-mono text-slate-600 mb-1 px-2 uppercase tracking-widest">
                                  {msg.role === 'user' ? 'USER_INPUT' : 'SAGE_REPLY'}
                                </span>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md transition-all ${
                                    msg.role === 'user' 
                                    ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                                    : 'bg-blue-500/10 text-blue-200 border border-blue-500/20'
                                }`}>
                                    {msg.content}
                                </div>
                            </>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
         </div>
      </div>

      {/* RIGHT COLUMN: OPERATOR CONSOLE */}
      <div className="w-full md:max-w-md lg:w-[460px] shrink-0 flex flex-col h-full">
         <div className={`flex-1 flex flex-col bg-[#1e1c24] rounded-[2.5rem] overflow-hidden border shadow-2xl transition-colors duration-500 relative ${safetyLock ? 'border-red-500/50' : 'border-slate-700'}`}>
            
            {/* CONSOLE HEADER */}
            <div className="px-5 py-4 border-b border-white/5 bg-black/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${safetyLock ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                      {safetyLock ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</span>
                      <span className={`text-xs font-bold ${safetyLock ? 'text-red-400' : 'text-slate-200'}`}>
                        {safetyLock ? 'SAFETY LOCK' : 'READY_VERTEX'}
                      </span>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-500 hover:text-blue-400 transition-colors"><Settings className="w-4 h-4" /></button>
                   <button onClick={() => setShowEscalationForm(true)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ${hasHighSeverity ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:border-slate-500'}`}><Flag className="w-3 h-3" /></button>
                </div>
            </div>

            {/* TAGS */}
            <div className="px-5 py-2 bg-black/20 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                 {SESSION_TAGS.map(tag => (
                    <button key={tag.id} onClick={() => handleToggleTag(tag.id)} className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${getTagStyles(tag, activeTags.includes(tag.id), suggestedTags.includes(tag.id))}`}>
                        {tag.label}
                    </button>
                ))}
            </div>

            {/* AI DRAFTING */}
            <div className={`relative p-5 min-h-[160px] shrink-0 border-b transition-colors duration-500 ${lastModelUsed === 'thinking' ? 'bg-blue-900/5 border-blue-500/10' : 'bg-black/5'}`}>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Drafting Surface</label>
                    {lastModelUsed && (
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${lastModelUsed === 'thinking' ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-400'}`}>
                           {lastModelUsed === 'thinking' ? <BrainCircuit className="w-3 h-3"/> : <Zap className="w-3 h-3"/>} {lastModelUsed}
                        </span>
                    )}
                </div>
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={safetyLock}
                    placeholder={safetyLock ? "LOCKED" : "AI draft appearing..."}
                    className="w-full bg-transparent text-base text-white placeholder-slate-700 focus:outline-none resize-none h-32 leading-relaxed"
                />
                {safetyLock && (
                    <div className="absolute inset-0 bg-red-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                        <Lock className="w-6 h-6 text-red-500 mb-2" />
                        <h3 className="text-red-400 font-bold uppercase text-xs tracking-widest">Protocol Override Required</h3>
                        <button onClick={() => setSafetyLock(false)} className="mt-4 text-[10px] text-slate-500 hover:text-white underline uppercase">Unlock</button>
                    </div>
                )}
            </div>

            {/* ACTION FOOTER */}
            <div className="p-5 bg-black/20 border-t border-white/5 shrink-0">
                <button 
                    onClick={handleSend}
                    disabled={!draft.trim() || safetyLock}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold tracking-widest shadow-lg shadow-blue-900/20 transition-all disabled:opacity-30 flex items-center justify-center gap-2 group"
                >
                    <SendHorizontal className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    APPROVE AS SAGE
                </button>
                <div className="flex justify-center mt-3">
                  <button onClick={() => handleGenerateSuggestion()} className="text-[9px] font-bold text-slate-600 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    <RefreshCcw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> {isGenerating ? 'GEN...' : 'Regenerate'}
                  </button>
                </div>
            </div>

            {/* CONSOLE TABS (Team/Notes) */}
            <div className="flex-1 overflow-y-auto bg-[#1a191f] p-5 space-y-4">
                 <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <StickyNote className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Internal Session Logs</span>
                    </div>
                    <textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-transparent text-[11px] font-mono text-slate-400 h-32 focus:outline-none resize-none"
                    />
                 </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
