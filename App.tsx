
import React, { useState } from 'react';
import { Message } from './types';
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

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now(),
      status: role === 'user' ? 'pending' : 'approved'
    };
    setMessages(prev => [...prev, newMessage]);
    
    // If user sent message, switch mobile view to operator to simulate "server side" receiving it
    // In a real demo, you might want to stay on user view, but here we want to show the flow.
    // For now, we just notify.
    if (role === 'user') {
       // Optionally play a sound or show a badge
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-100">
      {/* Application Header / View Switcher */}
      <nav className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-gradient-to-br from-rose-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md transform rotate-3 hover:rotate-0 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
           </div>
           <div>
             <h1 className="font-bold text-slate-800 hidden sm:block tracking-tight text-lg">GlowUp <span className="text-rose-500 font-light">Chat</span></h1>
           </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg lg:hidden">
          <button
            onClick={() => setActiveView('user')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeView === 'user' 
                ? 'bg-white text-rose-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            User
          </button>
          <button
            onClick={() => setActiveView('operator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeView === 'operator' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Laptop2 className="w-4 h-4" />
            Coach
            {messages.length > 0 && messages[messages.length-1].role === 'user' && (
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>
        
        <div className="hidden lg:block text-sm text-slate-500">
            <span className="bg-white px-3 py-1 rounded-full text-xs border border-slate-200 shadow-sm text-slate-400 font-medium tracking-wide">Active Session</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative p-4 lg:p-6 gap-6 flex bg-slate-100">
        
        {/* User Interface Pane */}
        <div className={`
          flex-1 h-full transition-all duration-300 ease-in-out
          ${activeView === 'user' ? 'block' : 'hidden lg:block'}
        `}>
          <UserInterface 
            messages={messages} 
            onSendMessage={(text) => addMessage('user', text)}
            operatorTyping={operatorTyping}
          />
        </div>

        {/* Operator Dashboard Pane */}
        <div className={`
          flex-1 h-full transition-all duration-300 ease-in-out
          ${activeView === 'operator' ? 'block' : 'hidden lg:block'}
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
