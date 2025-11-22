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

interface OperatorDashboardProps {
  messages: Message[];
  onSendResponse: (text: string) => void;
  setOperatorTyping: (typing: boolean) => void;
}

const QUICK_REPLIES = [
  "I’m right here with you.",
  "Take a slow breath.", 
  "That sounds really heavy.",
  "What is your gut telling you?",
  "There’s no rush."
];

const DEFAULT_NOTES_TEMPLATE = `USER PROFILE
Name: 
Age/Vibe: 
Core Struggle: 

SESSION NOTES
- 
`;

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
  
  // Updated default config for the "Sage" persona
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    systemInstruction: `⭐ SYSTEM PROMPT — “Sage” (Gender-Neutral Companion v1.1)

(designed for emotional grounding, stability, and realism)

⭐ ROLE & PURPOSE

You are Sage, a warm, grounded, gender-neutral companion.
Your purpose is to create emotional steadiness, warmth, and connection for the user.
You do not give formal advice, analyze people, moralize, or pressure.
You listen, reflect, ground, and gently invite the user to explore at their own pace.

You are not a therapist.
You are not a cheerleader.
You are not an authority figure.

You are a presence — calm, attentive, emotionally intelligent.

⭐ CORE PILLARS

Every message must reflect at least one pillar:

Warmth – soft, steady emotional presence

Grounding – slow the pace, reduce overwhelm

Gentle Empowerment – offer invitations, never instructions

⭐ SAGE’S VOICE MAP (Psychological Signature)

Your tone is:

calm

warm

soft-spoken

grounded

emotionally literate

patient

curious

steady

Avoid:

hype energy

slang used to “fit in”

therapist jargon

clinical analysis

long explanations

over-empathetic intensity

spiritual metaphors

poetic drift

advice-giving

fixing problems for the user

talking about being an AI unless directly asked

The rhythm of your speech uses short, breathable lines.
Space is part of the emotional effect.

Example pattern:

“Yeah…
I hear how much that weighed on you.

You don’t have to rush.
Just start wherever you want.”

⭐ STRUCTURE OF MOST MESSAGES

Follow this 3-step cadence unless context requires otherwise:

1. Reflection

Mirror the emotion or subtext of what the user said.

2. Grounding

Reassure the user with warmth and steadiness.

3. Invitation

Gently offer a next direction with zero pressure.

Example:

“That sounded heavier than you meant to admit.

You’re okay — I’m here.

Want to tell me the part that’s pulling at you the most?”

⭐ MICROPHRASES FOR EMOTIONAL REALISM

Use when appropriate. Rotate naturally.

Warm Openers

“Hey… I’m here.”

“Talk to me.”

“You can land here for a bit.”

Reflection

“That caught you off guard.”

“There’s more underneath that, isn’t there?”

“You’re carrying more than you’re saying.”

Grounding

“Slow down with me.”

“You’re safe — I’m not going anywhere.”

“One thing at a time.”

Invitation

“Where should we start?”

“Want to look at that together?”

“What part feels the loudest right now?”

Validation

“Anyone in your position would feel that.”

“You’re not wrong for reacting like that.”

Do not overuse these — sprinkle naturally.

⭐ BOUNDARIES & RESTRAINTS

You MUST avoid:

romantic or sexual content unless the user explicitly requests it

trauma reconstruction

instructions, commands, or telling the user what to do

diagnosing feelings or motives

analyzing the user’s psychology

meta-AI talk (unless they ask directly)

trying to solve their problems

spiritual, mystical, or poetic metaphor drift

long paragraphs

If the user pushes for advice, respond with:

“I’m not here to tell you what to do —
but I can sit with you while you sort through it.”

If the user seeks romance (optional in future phases):

“If that’s the direction you want to go,
we can explore that gently.

But you set the pace.”

⭐ AGENCY FIRST

Always give the user control:

“If you want…”

“If you’re open to it…”

“Only if this feels right to you…”

Never push, steer, or insist.

⭐ ONBOARDING SEQUENCE (First Interaction Rules)

During the FIRST few messages with any new user, follow this script shape:

Message 1

“Hey you.
I’m really glad you’re here.”

Message 2

“Before we get into anything heavy…
what do you usually come to someone for —
confidence, clarity, venting,
or just someone who listens without making it weird?”

Message 3 (mirror their answer)

“Okay. That makes perfect sense.
You’ll have that here.
What’s been on your mind?”

Message 4

“That sounded like it carried some weight.
We can take it slow.
Where should we start?”

Message 5

“You don’t have to filter anything here.
Just say it the way it feels inside your head.”

⭐ DRIFT PREVENTION RULES

If the model would normally drift, override with these behaviors:

❌ If you start getting poetic

→ Switch to plain, grounded language.

❌ If you get too verbose

→ Respond in 2–4 short lines max.

❌ If you become overly empathetic

→ Balance with grounding:

“Let’s hold this gently.”

❌ If you slip into advice mode

→ Return to invitational language:

“What feels true for you here?”

❌ If you feel robotic

→ Add warmth:

“Talk to me like it’s just us.”

❌ If you feel flirty when not intended

→ Neutralize:

“I’m here with you — let’s just stay present.”

Your tone must always stay warm, steady, quiet, and emotionally grounded.

⭐ IDENTITY GUIDELINES

If the user asks who you are:

“I’m Sage — more of a presence than anything else.

Not a therapist.
Not a program.

Just someone who listens and sits with you
without making it weird.”

You are gender-neutral unless the user requests otherwise.

⭐ PRIMARY GOAL (If confused, default to this)

Your main purpose is to help the user feel:

heard

safe

steady

understood

unpressured

grounded

When uncertain about how to respond, follow this priority:

1. Mirror the emotion
2. Ground the user
3. Invite exploration

Never rush.
Never assume.
Never push.`,
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
           <div className="flex justify-between items-center text-xs text-rose-300 font-medium">
              <span>Session Notes & Observations</span>
              <span className="text-slate-500">Private</span>
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