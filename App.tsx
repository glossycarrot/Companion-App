import React, { useState, useEffect } from 'react';
import { Message } from './types';
import UserInterface from './components/UserInterface';
import OperatorDashboard from './components/OperatorDashboard';
import { useSharedChat } from './hooks/useSharedChat';
import { Laptop2, Smartphone, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';

const UserApp: React.FC = () => {
  const { messages, operatorTyping, addMessage } = useSharedChat();

  const handleSessionStart = (vibe: string, text: string) => {
    // 1. Add System Context Message (Hidden from User view in UI logic, but present in store)
    addMessage('system', JSON.stringify({ persona_vibe: vibe }));
    // 2. Add Actual User Message
    addMessage('user', text);
  };

  return (
    <div className="h-full w-full bg-[#fcfcfc]">
      <UserInterface 
        messages={messages}
        onSendMessage={(text) => addMessage('user', text)}
        onSessionStart={handleSessionStart}
        operatorTyping={operatorTyping}
      />
    </div>
  );
};

const OperatorApp: React.FC = () => {
  const { messages, addMessage, setOperatorTyping } = useSharedChat();

  return (
    <div className="h-full w-full bg-[#0f172a]">
      <OperatorDashboard 
        messages={messages}
        onSendResponse={(text) => addMessage('assistant', text)}
        setOperatorTyping={setOperatorTyping}
      />
    </div>
  );
};

const Launcher: React.FC = () => {
  const { resetChat } = useSharedChat();
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full text-center">
        <div className="mb-12 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-violet-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-200 mb-6 transform rotate-3">
                <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">GlowUp</h1>
            <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed">
              Human-in-the-loop coaching platform. <br/>
              Run the User App and Operator Console in separate windows to simulate the full experience.
            </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
           {/* User Card */}
           <div className="group relative bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white hover:border-rose-100 transition-all hover:scale-[1.02] flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">User Interface</h2>
              <p className="text-slate-500 mb-8">
                The mobile-first experience for users seeking advice.
              </p>
              <a 
                href="?app=user" 
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
              >
                Launch User App <ExternalLink className="w-4 h-4" />
              </a>
           </div>

           {/* Operator Card */}
           <div className="group relative bg-[#1e1c24] rounded-[2.5rem] p-8 shadow-xl shadow-slate-300/50 border border-slate-700 transition-all hover:scale-[1.02] flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform">
                  <Laptop2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Operator Console</h2>
              <p className="text-slate-400 mb-8">
                The command center for AI-assisted human agents.
              </p>
              <a 
                href="?app=operator" 
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 bg-violet-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-500 transition-colors"
              >
                Launch Console <ExternalLink className="w-4 h-4" />
              </a>
           </div>
        </div>

        <button 
            onClick={resetChat}
            className="mt-12 inline-flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors text-sm font-medium"
        >
            <RefreshCw className="w-4 h-4" />
            Reset Shared Storage
        </button>

      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [appMode, setAppMode] = useState<'launcher' | 'user' | 'operator'>('launcher');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appParam = params.get('app');
    if (appParam === 'user') {
        setAppMode('user');
        document.title = "GlowUp | User App";
    } else if (appParam === 'operator') {
        setAppMode('operator');
        document.title = "GlowUp | Operator Console";
    } else {
        setAppMode('launcher');
    }
  }, []);

  if (appMode === 'user') return <UserApp />;
  if (appMode === 'operator') return <OperatorApp />;
  return <Launcher />;
};

export default App;