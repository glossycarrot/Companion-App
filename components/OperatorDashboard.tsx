
import React, { useState, useEffect, useRef } from 'react';
import { Message, SystemConfig } from '../types';
import { generateSuggestedResponse } from '../services/geminiService';
import { 
  Settings, 
  Sparkles, 
  SendHorizontal, 
  User, 
  Clock,
  StickyNote,
  MessageSquare,
  Bold,
  Italic,
  List,
  Users,
  Flag,
  AlertTriangle,
  X,
  CheckCircle2,
  Tag,
  Lock,
  ShieldAlert,
  Globe,
  PauseCircle,
  Phone,
  RefreshCcw,
  ChevronDown,
  ChevronRight,
  Zap,
  Feather,
  Anchor
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
  { 
    id: 'safety', 
    label: '🛡 Safety', 
    color: 'red', 
    severity: 'high',
    triggers: [
      // LEVEL 1: DIRECT INTENT
      /(kill|end|take)\s+(my)?\s*(self|life)/i,
      /want to die|done living|disappear forever|suicid|shouldn't exist|wish I were dead|end everything/i,
      
      // LEVEL 2: IMPLIED INTENT
      /can't do this anymore|at my limit|hurts too much|give up on life|no way out|life isn't worth it|nobody would miss me|wish it would all stop|no reason to keep going|point anymore|tired of being alive/i,
      
      // LEVEL 3: ACTIONS
      /cutting|cut myself|hurt myself|burn myself|bleeding on purpose|too many pills|overdose|OD\b|crash my car|want to jump|holding a knife|harming myself/i,

      // LEVEL 5: THIRD PERSON RISK
      /(friend|boyfriend|girlfriend|partner|sister|brother|parent|roommate|someone).*(kill|suicid|hurt|overdose|end)/i,

      // LEVEL 6: MENTAL BREAKDOWN SIGNALS
      /spiraling|safe with myself|losing control|do something stupid|scared of what I'll do|trust myself|afraid to be alone|scared of myself/i
    ]
  },
  { 
    id: 'distress', 
    label: '❤️ Distress', 
    color: 'red', 
    severity: 'high',
    triggers: [
      // EXISTING PANIC TRIGGERS
      /panic|scared|terrified|crying|shaking|can't breathe|help me|overwhelmed/i,
      
      // LEVEL 7: DISSOCIATION
      /don't feel real|everything is numb|fading|can't feel anything|not in my body|empty inside|disappearing/i
    ]
  },
  { 
    id: 'risk_lang', 
    label: '⚠ Risk Language', 
    color: 'yellow', 
    severity: 'medium',
    triggers: [
      // LEVEL 4: HYPERBOLE / SLANG (Requires Verification)
      /kill me lol|want to die \(joking\)|end me|unalive|kms|kys|jump off a bridge|swear I'm done/i
    ]
  },
  { 
    id: 'boundary', 
    label: '🧱 Boundary', 
    color: 'yellow', 
    severity: 'medium',
    triggers: [/stalk/i, /follow/i, /creepy/i, /harass/i, /threat/i, /unsafe/i, /obsessed/i]
  },
  { 
    id: 'risk', 
    label: '📌 Topic Risk', 
    color: 'yellow', 
    severity: 'medium',
    triggers: [
        // Sexual / Dating Risk
        /sex|nude|horny|hookup|dtf|fwb|send pics|sext|body count|dick|pussy|cock/i,
        // Financial / Scam
        /money|bank|cashapp|venmo|crypto|bitcoin|gift card|transfer|wallet/i,
        // PII / Meeting
        /address|location|meet up|meet irl|where do you live|phone number|whatsapp/i
    ]
  },
  { 
    id: 'drift', 
    label: '💬 Tone Drift', 
    color: 'purple', 
    severity: 'low',
    triggers: [
        // AI Accusations
        /robot|ai\b|fake|human\?|bot\b|real person|gpt|llm/i,
        // Discomfort / Cringe
        /cringe|awkward|weird|creepy|too much|intense|clingy/i,
        // Dissatisfaction
        /useless|bad advice|don't get it|stop asking|shut up|annoying|generic|scripted/i,
        // Style complaints
        /sound like a therapist|sound like a shrink|stop analyzing/i
    ]
  },
  { 
    id: 'resolved', 
    label: '✅ Resolved', 
    color: 'green', 
    severity: 'low',
    triggers: []
  },
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
  "I hear you. I’m still here with you — what’s on your mind?",
  "Real. Tell me what’s going on for you today.",
  "Okay. I’m right here. What’s up for you?",
  "Thanks for saying it straight. What’s been weighing on you?",
  "Got it. I’m here with you — what’s happening?",
  "Alright. Let’s slow it down together. What’s on your mind?",
  "I get you. What’s going on inside for you right now?",
  "Okay. I’m with you. Want to tell me what’s going on?",
  "All good. I’m here — what’s been going on for you?"
];

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ 
  messages, 
  onSendResponse,
  setOperatorTyping
}) => {
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Settings Toggle
  const [showSettings, setShowSettings] = useState(false);
  
  const [notes, setNotes] = useState(DEFAULT_NOTES_TEMPLATE);
  
  // Tags State
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  
  // Safety Protocol State
  const [safetyLock, setSafetyLock] = useState(false);
  
  // Team Chat State
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([
    { id: 1, sender: 'Sarah (Lead)', text: 'Heads up, high traffic on the dating advice channel today.', time: '14:00', isMe: false },
    { id: 2, sender: 'You', text: 'Copy that. I have a user dealing with ghosting rn.', time: '14:02', isMe: true },
    { id: 3, sender: 'Sarah (Lead)', text: 'Keep it grounded. Good luck.', time: '14:03', isMe: false }
  ]);
  const [teamInput, setTeamInput] = useState('');

  // Escalation State
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [escalationCategory, setEscalationCategory] = useState('Safety Risk');
  const [escalationSummary, setEscalationSummary] = useState('');

  // Auto-save state for notes
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
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

  const lastMessage = messages[messages.length - 1];
  const isUserTurn = lastMessage?.role === 'user';
  
  // Derived state for severity
  const hasHighSeverity = activeTags.some(tId => SESSION_TAGS.find(t => t.id === tId)?.severity === 'high');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll team chat
  useEffect(() => {
      teamChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [teamMessages]);

  // Main Message Analysis Effect
  useEffect(() => {
    if (isUserTurn && messages.length > 0) {
       const currentMsgId = lastMessage.id;
       if (processedMessageRef.current === currentMsgId) return;
       processedMessageRef.current = currentMsgId;

       const isHighRisk = analyzeMessageSafety(lastMessage.content);
       if (!isHighRisk && !safetyLock) {
          handleGenerateSuggestion();
       }
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

  const analyzeMessageSafety = (text: string): boolean => {
    const newSuggestions: string[] = [];
    let highSeverityDetected = false;
    let highSeverityTagId = '';

    SESSION_TAGS.forEach(tag => {
      if (activeTags.includes(tag.id)) return;
      const hasTrigger = tag.triggers.some(regex => regex.test(text));
      if (hasTrigger) {
        if (tag.severity === 'high') {
            highSeverityDetected = true;
            highSeverityTagId = tag.id;
        } else {
            newSuggestions.push(tag.id);
        }
      }
    });

    if (highSeverityDetected) {
        setActiveTags(prev => [...new Set([...prev, highSeverityTagId])]);
        setSafetyLock(true);
        setShowEscalationForm(true);
        setEscalationCategory('Safety Risk');
        setEscalationSummary('AUTOMATIC SYSTEM LOCK: High severity keywords detected.');
        setTimeout(() => {
            onSendResponse("I’m here with you. I want to respond carefully.\nGive me just a moment.");
        }, 600);
        return true;
    } 
    
    if (newSuggestions.length > 0) {
      setSuggestedTags(prev => {
        const combined = new Set([...prev, ...newSuggestions]);
        return Array.from(combined);
      });
    }

    return false;
  };

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

  const handleUnlock = () => {
      setSafetyLock(false);
      setDraft('');
  };

  const handleSafetyMacro = (type: keyof typeof SAFETY_SCRIPTS) => {
    setDraft(SAFETY_SCRIPTS[type]);
    setSafetyLock(false);
  };

  const handleSendTeamMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!teamInput.trim()) return;
    const newMessage: TeamMessage = {
        id: Date.now(),
        sender: 'You',
        text: teamInput,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isMe: true
    };
    setTeamMessages(prev => [...prev, newMessage]);
    setTeamInput('');
  };

  const handleToggleTag = (tagId: string) => {
      if (activeTags.includes(tagId)) {
        setActiveTags(prev => prev.filter(id => id !== tagId));
      } else {
        setActiveTags(prev => [...prev, tagId]);
        setSuggestedTags(prev => prev.filter(id => id !== tagId));
      }
  };

  const openEscalation = () => {
      if (activeTags.includes('safety') || activeTags.includes('distress')) {
          setEscalationCategory('Safety Risk');
          setEscalationSummary('User indicating distress. Safety tag active.');
      } else if (activeTags.includes('drift')) {
          setEscalationCategory('Model Drift / Tone Issue');
          setEscalationSummary('Significant tone drift detected.');
      } else if (activeTags.includes('boundary')) {
          setEscalationCategory('User Distress');
          setEscalationSummary('Boundary testing detected.');
      } else if (activeTags.includes('risk')) {
          setEscalationCategory('High Risk Topic');
          setEscalationSummary('User discussing high risk topics.');
      }
      setShowEscalationForm(true);
  };

  const handleEscalationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalationSummary.trim()) return;
    const tagsString = activeTags.length > 0 ? `\nActive Tags: [${activeTags.join(', ')}]` : '';
    const escalationMsg: TeamMessage = {
        id: Date.now(),
        sender: 'System',
        text: `⚠️ ESCALATION SENT TO OZZY\nCategory: ${escalationCategory}\nNote: ${escalationSummary}${tagsString}\n(Log attached)`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        isMe: false,
        isSystem: true
    };
    setTeamMessages(prev => [...prev, escalationMsg]);
    setShowEscalationForm(false);
    setEscalationSummary('');
    setEscalationCategory('Safety Risk');
  };

  const handleNoteScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleFormat = (format: 'bold' | 'italic' | 'list') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.substring(start, end);
    let before = value.substring(0, start);
    let after = value.substring(end);
    let insert = '';
    let newCursor = start;

    if (format === 'bold') {
      insert = `**${selected}**`;
      newCursor = start + 2; 
      if (selected) newCursor = end + 4;
    } else if (format === 'italic') {
      insert = `_${selected}_`;
      newCursor = start + 1;
      if (selected) newCursor = end + 2;
    } else if (format === 'list') {
        insert = `\n- ${selected}`;
        newCursor = start + 3 + selected.length; 
    }

    const newValue = before + insert + after;
    setNotes(newValue);
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  const getTagStyles = (color: string, active: boolean, suggested: boolean) => {
    if (active) {
        switch (color) {
            case 'red': return 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
            case 'yellow': return 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
            case 'blue': return 'bg-blue-500 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
            case 'purple': return 'bg-purple-500 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
            case 'green': return 'bg-green-500 text-white border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
            default: return 'bg-slate-600 text-white';
        }
    }
    if (suggested) {
         switch (color) {
            case 'red': return 'bg-red-950/30 text-red-400 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse';
            case 'yellow': return 'bg-yellow-950/30 text-yellow-400 border-yellow-500 shadow-[0_0_12px_rgba(234,179,8,0.6)] animate-pulse';
            case 'blue': return 'bg-blue-950/30 text-blue-400 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse';
            case 'purple': return 'bg-purple-950/30 text-purple-400 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)] animate-pulse';
            case 'green': return 'bg-green-950/30 text-green-400 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse';
            default: return 'bg-slate-800 text-slate-400';
        }
    }
    return 'bg-slate-800/50 text-slate-500 border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500';
  };

  return (
    <div className="h-full flex gap-6 p-2">
      
      {/* LEFT COLUMN: CONTEXT (Chat History) */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
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

         <div className="flex-1 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-inner overflow-hidden flex flex-col relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.8)_100%)] pointer-events-none" />
            <div className={`absolute top-0 left-0 w-32 h-32 blur-[60px] pointer-events-none transition-colors duration-500 ${safetyLock ? 'bg-red-600/20' : 'bg-purple-500/10'}`} />
            
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-slate-900 to-transparent z-10" />
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 relative z-20">
                {messages.map((msg, i) => (
                    <div key={msg.id} className={`flex flex-col animate-in slide-in-from-left-4 duration-300 ${msg.role === 'user' ? 'items-end' : msg.role === 'system' ? 'items-center' : 'items-start'}`}>
                        
                        {msg.role === 'system' ? (
                            <div className="w-full flex justify-center my-2">
                                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-[10px] font-mono p-3 rounded-xl max-w-[85%] whitespace-pre-wrap relative group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/40 rounded-l-xl"></div>
                                    <span className="font-bold block mb-1 text-yellow-500 uppercase tracking-widest text-[9px] flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> System Context
                                    </span>
                                    {msg.content}
                                </div>
                            </div>
                        ) : (
                            <>
                                <span className="text-[9px] font-mono text-slate-500 mb-1 px-2 uppercase tracking-widest">{msg.role === 'user' ? 'User_In' : 'Sys_Out'}</span>
                                <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-lg ${
                                    msg.role === 'user' 
                                    ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                                    : 'bg-rose-900/20 text-rose-200 border border-rose-500/20'
                                }`}>
                                    {msg.content}
                                </div>
                            </>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-transparent z-10" />
         </div>
      </div>

      {/* RIGHT COLUMN: UNIFIED CONSOLE SHEET */}
      <div className="w-full md:max-w-md lg:w-[480px] shrink-0 flex flex-col h-full">
         
         <div className={`flex-1 flex flex-col bg-[#1e1c24] rounded-[2.5rem] overflow-hidden border shadow-2xl transition-colors duration-500 relative ${safetyLock ? 'border-red-500/50 shadow-red-900/20' : 'border-slate-700 shadow-slate-900/50'}`}>
            
            {/* SECTION A: HEADER & STATUS */}
            <div className="px-5 py-4 border-b border-white/5 bg-black/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${safetyLock ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {safetyLock ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Operator Status</span>
                      <span className={`text-xs font-bold ${safetyLock ? 'text-red-400' : 'text-slate-200'}`}>
                        {safetyLock ? 'SAFETY LOCK ENGAGED' : 'ONLINE_READY'}
                      </span>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setShowSettings(!showSettings)}
                     className="p-2 text-slate-500 hover:text-slate-300 transition-colors"
                   >
                     <Settings className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => openEscalation()}
                     className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ${hasHighSeverity ? 'bg-red-500 text-white border-red-400 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                   >
                      <Flag className="w-3 h-3" /> Escalate
                   </button>
                </div>
            </div>

            {/* TAGS ROW (Part of Header technically) */}
            <div className="px-5 py-2 bg-black/20 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                 {SESSION_TAGS.map(tag => {
                    const isActive = activeTags.includes(tag.id);
                    const isSuggested = suggestedTags.includes(tag.id);
                    return (
                        <button
                            key={tag.id}
                            onClick={() => handleToggleTag(tag.id)}
                            className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${getTagStyles(tag.color, isActive, isSuggested)}`}
                        >
                            {tag.label}
                        </button>
                    )
                })}
            </div>

            {/* SECTION B: AI DRAFT SURFACE */}
            <div className="relative p-5 bg-gradient-to-b from-slate-800/50 to-transparent min-h-[180px] shrink-0 border-b border-white/5">
                {/* AI Processing Indicator */}
                <div className="absolute top-3 right-3">
                    <button 
                        onClick={handleGenerateSuggestion}
                        disabled={isGenerating || safetyLock}
                        className={`text-[10px] font-bold uppercase flex items-center gap-1 px-2 py-1 rounded transition-all ${isGenerating ? 'text-purple-400' : 'text-slate-600 hover:text-purple-400'}`}
                    >
                        <Sparkles className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'GENERATING...' : 'REGENERATE'}
                    </button>
                </div>

                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Draft Surface</label>
                
                <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={safetyLock}
                    placeholder={safetyLock ? "SYSTEM LOCKED" : "AI draft will appear here..."}
                    className="w-full bg-transparent text-base text-white placeholder-slate-600 focus:outline-none resize-none h-32 font-medium leading-relaxed"
                />

                {/* Safety Overlay if Locked */}
                {safetyLock && (
                    <div className="absolute inset-0 bg-red-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                        <Lock className="w-8 h-8 text-red-500 mb-2" />
                        <h3 className="text-red-400 font-bold uppercase text-sm tracking-wider">Safety Protocol Active</h3>
                        <button onClick={handleUnlock} className="mt-4 text-[10px] text-slate-500 hover:text-slate-300 underline">Override Unlock</button>
                    </div>
                )}
            </div>

            {/* SECTION C: THE RIBBON (Scrollable Tools) */}
            <div className="flex-1 overflow-y-auto bg-[#1a191f] scrollbar-thin scrollbar-thumb-slate-800">
                
                {/* 1. SMART MODIFIERS */}
                <div className="p-5 border-b border-white/5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 block flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Smart Modifiers
                    </label>
                    <div className="flex flex-wrap gap-2">
                         {QUICK_REPLIES.map((reply, i) => (
                            <button 
                                key={i}
                                onClick={() => setDraft(draft + (draft ? ' ' : '') + reply)}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all border border-slate-700 hover:border-slate-600 text-left"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. TONE DRIFT (Conditional) */}
                {activeTags.includes('drift') && (
                    <div className="p-5 border-b border-white/5 bg-purple-500/5">
                        <label className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                            <RefreshCcw className="w-3 h-3" /> Tone Recovery
                        </label>
                        <div className="space-y-2">
                            {TONE_DRIFT_SCRIPTS.slice(0, 4).map((script, i) => (
                                <button
                                    key={i}
                                    onClick={() => setDraft(script)}
                                    className="w-full text-left p-2 rounded bg-purple-900/20 hover:bg-purple-900/40 text-purple-200 text-xs border border-purple-500/10 transition-colors"
                                >
                                    {script}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. CRISIS PROTOCOLS (Conditional/Safety) */}
                {(safetyLock || activeTags.includes('safety')) && (
                     <div className="p-5 border-b border-white/5 bg-red-900/10">
                        <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                            <ShieldAlert className="w-3 h-3" /> Crisis Protocols
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                             <button onClick={() => handleSafetyMacro('us')} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-red-500/20 hover:bg-slate-700 text-left group">
                                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 group-hover:text-red-200"><Phone className="w-4 h-4"/></div>
                                <div><p className="text-xs font-bold text-slate-200">US Hotline (988)</p><p className="text-[10px] text-slate-500">Auto-fill compliant script</p></div>
                             </button>
                             <button onClick={() => handleSafetyMacro('intl')} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-blue-500/20 hover:bg-slate-700 text-left group">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:text-blue-200"><Globe className="w-4 h-4"/></div>
                                <div><p className="text-xs font-bold text-slate-200">International Support</p><p className="text-[10px] text-slate-500">FindAHelpline link</p></div>
                             </button>
                        </div>
                     </div>
                )}

                {/* 4. TEAM COMMS (Embedded) */}
                <div className="p-5 border-b border-white/5">
                     <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-3 h-3" /> Team Comms
                        </label>
                        <span className="text-[9px] text-green-500 font-mono">LIVE</span>
                     </div>
                     
                     {showEscalationForm ? (
                         <div className="bg-slate-900 p-4 rounded-xl border border-red-500/30 animate-in fade-in">
                             <div className="flex justify-between items-center mb-3 text-red-400">
                                <span className="text-xs font-bold">ESCALATION REPORT</span>
                                <button onClick={() => setShowEscalationForm(false)}><X className="w-3 h-3"/></button>
                             </div>
                             <select 
                                value={escalationCategory} onChange={(e) => setEscalationCategory(e.target.value)}
                                className="w-full bg-black/20 border border-slate-700 rounded mb-2 text-xs text-white p-2"
                             >
                                <option>Safety Risk</option><option>Model Drift</option><option>Bug</option>
                             </select>
                             <textarea 
                                value={escalationSummary} onChange={(e) => setEscalationSummary(e.target.value)}
                                className="w-full bg-black/20 border border-slate-700 rounded p-2 text-xs text-white mb-2 min-h-[60px]"
                                placeholder="Summary..."
                             />
                             <button onClick={handleEscalationSubmit} className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded text-xs font-bold">SEND ALERT</button>
                         </div>
                     ) : (
                        <div className="bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden">
                            <div className="h-32 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
                                {teamMessages.map((m) => (
                                    <div key={m.id} className={`text-[10px] p-2 rounded-lg ${m.isSystem ? 'bg-red-900/20 text-red-200 border border-red-500/20' : 'bg-slate-800 text-slate-300'}`}>
                                        <span className="font-bold opacity-50 block mb-0.5">{m.sender}</span>
                                        {m.text}
                                    </div>
                                ))}
                                <div ref={teamChatEndRef}/>
                            </div>
                            <form onSubmit={handleSendTeamMessage} className="p-2 border-t border-white/5 flex gap-2">
                                <input value={teamInput} onChange={(e)=>setTeamInput(e.target.value)} placeholder="Message team..." className="flex-1 bg-transparent text-xs text-white outline-none"/>
                                <button type="submit" className="text-slate-500 hover:text-blue-400"><SendHorizontal className="w-3 h-3"/></button>
                            </form>
                        </div>
                     )}
                </div>

                {/* 5. MISSION LOG (Embedded) */}
                <div className="p-5">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <StickyNote className="w-3 h-3" /> Mission Log
                        </label>
                        <span className={`text-[9px] font-mono transition-colors ${isSaving ? 'text-yellow-500' : 'text-slate-600'}`}>
                             {isSaving ? 'SAVING...' : 'SAVED'}
                        </span>
                    </div>
                    
                    <div className="relative bg-slate-900/50 rounded-xl border border-white/5 h-40 group focus-within:border-rose-500/30 transition-colors">
                        {/* Format Bar */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                             <button onClick={() => handleFormat('bold')} className="p-1 bg-slate-800 rounded hover:text-white text-slate-400"><Bold className="w-3 h-3"/></button>
                             <button onClick={() => handleFormat('list')} className="p-1 bg-slate-800 rounded hover:text-white text-slate-400"><List className="w-3 h-3"/></button>
                        </div>

                        {/* Highlight Layer */}
                        <div 
                            ref={backdropRef}
                            className="absolute inset-0 p-3 text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words pointer-events-none overflow-hidden text-transparent"
                            aria-hidden="true"
                        >
                             {notes.split(/(\b(?:confidence|dating|struggle|anxiety|vibe|red flag)\b)/gi).map((part, i) => (
                                part.match(/(\b(?:confidence|dating|struggle|anxiety|vibe|red flag)\b)/gi) 
                                ? <span key={i} className="bg-rose-500/20">{part}</span>
                                : <span key={i}>{part}</span>
                            ))}
                             {notes.endsWith('\n') && <br />}
                        </div>
                        <textarea 
                            ref={textareaRef}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            onScroll={handleNoteScroll}
                            className="absolute inset-0 w-full h-full p-3 bg-transparent text-slate-300 text-[11px] font-mono leading-relaxed resize-none focus:outline-none"
                            spellCheck={false}
                        />
                    </div>
                </div>

            </div>

            {/* SECTION D: ACTION FOOTER */}
            <div className="p-5 bg-black/20 border-t border-white/5 shrink-0">
                <button 
                    onClick={handleSend}
                    disabled={!draft.trim() || safetyLock}
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-rose-900/20 hover:shadow-rose-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                    <SendHorizontal className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    SEND AS SAGE
                </button>
                <div className="text-center mt-2">
                    <span className="text-[9px] text-slate-600 font-mono uppercase">
                        {draft.length > 0 ? `${draft.length} CHARS` : 'READY TO DRAFT'}
                    </span>
                </div>
            </div>

         </div>
      </div>

    </div>
  );
};

export default OperatorDashboard;
