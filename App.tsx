
import React, { useState } from 'react';
import { Message, Role } from './types';
import UserInterface from './components/UserInterface';
import OperatorDashboard from './components/OperatorDashboard';
import { Laptop2, Smartphone, Sparkles } from 'lucide-react';
import { INITIAL_GREETING } from './localConfig';

const App: React.FC = () => {
  // Initialize with Sage's opening line
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: INITIAL_GREETING,
      timestamp: Date.now(),
      status: 'approved'
    }
  ]);
  
  const [operatorTyping, setOperatorTyping] = useState(false);
  
  // View mode for mobile/tablet: 'split' (desktop default), 'user', or 'operator'
  const [activeView, setActiveView] = useState<'user' | 'operator'>('user');

  const addMessage = (role: Role, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now(),
      status: role === 'user' ? 'pending' : 'approved'
    };
    setMessages(prev => [...prev, newMessage]);
    
    // If user sent message, switch mobile view to operator to simulate "server side" receiving it
    if (role === 'user') {
       // Optionally play a sound or show a badge
    }
  };

  const handleSessionStart = (vibe: string, firstMessage: string) => {
    // 1. Add System Context Message (Visible to Operator, Hidden from User)
    const systemContext = JSON.stringify({ persona_vibe: vibe }, null, 2);
    addMessage('system', systemContext);

    // 2. Add Actual User Message
    addMessage('user', firstMessage);
  };

  return (
    <div className="h-full flex flex-col bg-[#eef2f6] relative overflow-hidden">
      {/* Abstract Background Blobs - Enhanced for "Glow" effect */}
      <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-rose-200/30 rounded-full blur-[80px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-[80px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/40 blur-[100px] pointer-events-none" />

      {/* Floating Navigation Pill */}
      <nav className="z-50 absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-lg border border-white/50 px-2 py-2 rounded-full flex items-center gap-2 shrink-0 hover:scale-105 transition-transform duration-300">
        
        <div className="flex items-center gap-2 px-4">
           <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-violet-500 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
           </div>
           <span className="font-bold text-slate-700 tracking-tight text-sm hidden sm:block">GlowUp</span>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center bg-slate-100/50 rounded-full p-1">
          <button
            onClick={() => setActiveView('user')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              activeView === 'user' 
                ? 'bg-white text-slate-800 shadow-md transform scale-105' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Phone
          </button>
          <button
            onClick={() => setActiveView('operator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
              activeView === 'operator' 
                ? 'bg-slate-800 text-white shadow-md transform scale-105' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Laptop2 className="w-3.5 h-3.5" />
            Console
            {messages.length > 0 && messages[messages.length-1].role === 'user' && (
                <span className="ml-1.5 w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content Area - Modular Cards */}
      <main className="flex-1 relative z-0 flex items-center justify-center p-4 pt-20 lg:p-8 gap-8 h-full">
        
        {/* User Interface Module - Styled like a Phone/Card */}
        <div className={`
          transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${activeView === 'user' 
            ? 'opacity-100 translate-x-0 scale-100 absolute inset-4 pt-16 lg:static lg:inset-auto lg:pt-0 lg:w-[400px] xl:w-[450px] h-full max-h-[900px] rotate-0' 
            : 'opacity-0 -translate-x-20 scale-90 absolute pointer-events-none lg:opacity-100 lg:translate-x-0 lg:scale-100 lg:static lg:pointer-events-auto lg:w-[400px] xl:w-[450px] h-full max-h-[900px]'}
        `}>
          <div className="h-full w-full shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden border-[6px] border-white bg-white ring-1 ring-slate-200/50 transform transition-transform hover:scale-[1.005] duration-500 perspective-[1500px]">
             <UserInterface 
                messages={messages} 
                onSendMessage={(text) => addMessage('user', text)}
                onSessionStart={handleSessionStart}
                operatorTyping={operatorTyping}
              />
          </div>
        </div>

        {/* Operator Dashboard Module - Styled like a Command Center */}
        <div className={`
          flex-1 h-full max-h-[900px] transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${activeView === 'operator' 
             ? 'opacity-100 translate-x-0 scale-100 absolute inset-4 pt-16 lg:static lg:inset-auto lg:pt-0' 
             : 'opacity-0 translate-x-20 scale-90 absolute pointer-events-none lg:opacity-100 lg:translate-x-0 lg:scale-100 lg:static lg:pointer-events-auto'}
        `}>
          <OperatorDashboard 
            messages={messages}
            onSendResponse={(text) => addMessage('assistant', text)}
            setOperatorTyping={setOperatorTyping}
          />
        </div>

      </main>
    </div>
  );
};

export default App;
