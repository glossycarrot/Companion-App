
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { 
  Send, 
  Sparkles, 
  HeartHandshake, 
  Info, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight,
  Wind,
  VolumeX,
  Smile
} from 'lucide-react';

interface UserInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSessionStart: (vibe: string, text: string) => void;
  operatorTyping: boolean;
}

const UserInterface: React.FC<UserInterfaceProps> = ({ messages, onSendMessage, onSessionStart, operatorTyping }) => {
  const [input, setInput] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  
  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedVibe, setSelectedVibe] = useState('Warm & Soft');
  const [onboardingInput, setOnboardingInput] = useState('');

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

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingInput.trim()) return;
    
    // Use explicit session start to separate vibe (system) from message (user)
    onSessionStart(selectedVibe, onboardingInput);
    setShowOnboarding(false);
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
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
      
      {/* ONBOARDING MODAL */}
      {showOnboarding && (
        <div className="absolute inset-0 z-[60] bg-white flex flex-col animate-in fade-in duration-500">
           
           {/* Onboarding Content Container */}
           <div className="flex-1 flex flex-col p-6 justify-center relative overflow-y-auto scrollbar-hide">
              
              {/* Decorative Blobs */}
              <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-100/50 rounded-full blur-[60px] pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-violet-100/50 rounded-full blur-[60px] pointer-events-none" />

              {/* STEP 1: WELCOME */}
              {onboardingStep === 0 && (
                <div className="relative z-10 flex flex-col h-full justify-center items-center text-center animate-in slide-in-from-bottom-8 duration-500">
                   <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-orange-300 rounded-3xl flex items-center justify-center shadow-xl shadow-rose-200/50 mb-8 transform rotate-3">
                        <span className="text-4xl">✨</span>
                   </div>
                   <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Hey. I’m Sage.</h1>
                   <p className="text-xl font-medium text-rose-500 mb-6">I’m glad you’re here.</p>
                   <p className="text-slate-500 text-lg leading-relaxed max-w-xs">
                     This is a calm space to talk, think out loud, or get some clarity.
                     <br/><br/>
                     Nothing heavy. Nothing judged.
                     <br/>
                     You set the pace.
                   </p>
                </div>
              )}

              {/* STEP 2: WHAT SAGE IS */}
              {onboardingStep === 1 && (
                <div className="relative z-10 flex flex-col h-full justify-center animate-in slide-in-from-right-8 duration-500">
                   <h2 className="text-3xl font-black text-slate-800 mb-8">What I’m here for</h2>
                   
                   <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">✓</div>
                        <p className="text-slate-700 font-medium">Someone to talk to without pressure</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">✓</div>
                        <p className="text-slate-700 font-medium">A warm voice when your mind feels loud</p>
                      </div>
                      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">✓</div>
                        <p className="text-slate-700 font-medium">Help slowing down, sorting thoughts, or feeling steady</p>
                      </div>
                   </div>

                   <h3 className="text-xl font-bold text-slate-400 mb-4">What I’m not</h3>
                   <div className="space-y-3 opacity-70">
                      <div className="flex items-center gap-3">
                         <X className="w-5 h-5 text-slate-400" />
                         <p className="text-slate-500">Not therapy</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <X className="w-5 h-5 text-slate-400" />
                         <p className="text-slate-500">Not diagnosis</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <X className="w-5 h-5 text-slate-400" />
                         <p className="text-slate-500">Not here to judge or analyze you</p>
                      </div>
                   </div>
                </div>
              )}

              {/* STEP 3: YOUR SPACE */}
              {onboardingStep === 2 && (
                <div className="relative z-10 flex flex-col h-full justify-center items-center text-center animate-in slide-in-from-right-8 duration-500">
                   <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mb-8">
                      <Wind className="w-10 h-10 text-violet-500" />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800 mb-4">You choose how we talk</h2>
                   <p className="text-slate-600 text-lg leading-relaxed max-w-xs mb-8">
                     You can use Sage to vent, check in, get clarity, or just have someone listen.
                   </p>
                   <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-lg transform -rotate-2">
                      <p className="font-handwriting text-slate-500 italic text-lg">
                        "Short messages, long ones, messy ones — all welcome."
                      </p>
                   </div>
                </div>
              )}

              {/* STEP 4: PRIVACY */}
              {onboardingStep === 3 && (
                <div className="relative z-10 flex flex-col h-full justify-center animate-in slide-in-from-right-8 duration-500">
                   <ShieldCheck className="w-12 h-12 text-rose-400 mb-6" />
                   <h2 className="text-3xl font-black text-slate-800 mb-6">Your messages stay between you and Sage</h2>
                   
                   <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 mb-8">
                      <p className="text-rose-800 leading-relaxed">
                        Your chats are private. Sage only uses your messages to talk with you in the moment.
                        <br/><br/>
                        <span className="font-bold">Nothing you say is ever shown to other users.</span>
                      </p>
                   </div>

                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">A quick note about safety</h3>
                   <p className="text-slate-500 text-sm leading-relaxed">
                     If you ever mention something that sounds like someone might be in danger, Sage may pause for a moment to send you a grounding message or share a crisis resource.
                     <br/><br/>
                     No lectures, no judgment — just support.
                   </p>
                </div>
              )}

              {/* STEP 5: EXPECTATIONS */}
              {onboardingStep === 4 && (
                 <div className="relative z-10 flex flex-col h-full justify-center items-center text-center animate-in slide-in-from-right-8 duration-500">
                    <h2 className="text-3xl font-black text-slate-800 mb-8">You don’t have to know what to say</h2>
                    <p className="text-slate-500 mb-8">You can start with anything:</p>

                    <div className="flex flex-col gap-4 w-full max-w-xs">
                       <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-slate-700 font-medium transform -rotate-1">
                         “How’s it going?”
                       </div>
                       <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-slate-700 font-medium transform rotate-1">
                         “I feel weird today.”
                       </div>
                       <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-slate-700 font-medium transform -rotate-1">
                         “Can you help me think this through?”
                       </div>
                       <div className="bg-violet-100 border border-violet-200 p-4 rounded-2xl shadow-sm text-violet-700 font-bold transform rotate-2">
                         Or even just: “Hey.”
                       </div>
                    </div>
                    
                    <p className="mt-10 text-slate-400 font-medium">Sage meets you where you are.</p>
                 </div>
              )}

              {/* STEP 6: VIBE CHECK */}
              {onboardingStep === 5 && (
                 <div className="relative z-10 flex flex-col h-full justify-center animate-in slide-in-from-right-8 duration-500">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Want Sage to match your vibe?</h2>
                    <p className="text-slate-500 mb-8">Choose how you want Sage to talk today. You can change this anytime.</p>

                    <div className="space-y-3">
                        <button 
                          onClick={() => setSelectedVibe('Warm & Soft')}
                          className={`w-full text-left p-5 rounded-3xl border-2 transition-all flex items-center gap-4 ${selectedVibe === 'Warm & Soft' ? 'border-rose-400 bg-rose-50' : 'border-slate-100 bg-white hover:border-rose-200'}`}
                        >
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedVibe === 'Warm & Soft' ? 'bg-rose-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                               <HeartHandshake className="w-5 h-5" />
                           </div>
                           <div>
                              <p className={`font-bold text-lg ${selectedVibe === 'Warm & Soft' ? 'text-rose-900' : 'text-slate-700'}`}>Warm & Soft</p>
                              <p className="text-slate-500 text-sm">Gentle, supportive, empathetic.</p>
                           </div>
                        </button>

                        <button 
                          onClick={() => setSelectedVibe('Chill & Simple')}
                          className={`w-full text-left p-5 rounded-3xl border-2 transition-all flex items-center gap-4 ${selectedVibe === 'Chill & Simple' ? 'border-blue-400 bg-blue-50' : 'border-slate-100 bg-white hover:border-blue-200'}`}
                        >
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedVibe === 'Chill & Simple' ? 'bg-blue-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                               <Smile className="w-5 h-5" />
                           </div>
                           <div>
                              <p className={`font-bold text-lg ${selectedVibe === 'Chill & Simple' ? 'text-blue-900' : 'text-slate-700'}`}>Chill & Simple</p>
                              <p className="text-slate-500 text-sm">Relaxed, straightforward, casual.</p>
                           </div>
                        </button>

                        <button 
                          onClick={() => setSelectedVibe('Quiet & Steady')}
                          className={`w-full text-left p-5 rounded-3xl border-2 transition-all flex items-center gap-4 ${selectedVibe === 'Quiet & Steady' ? 'border-violet-400 bg-violet-50' : 'border-slate-100 bg-white hover:border-violet-200'}`}
                        >
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedVibe === 'Quiet & Steady' ? 'bg-violet-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                               <VolumeX className="w-5 h-5" />
                           </div>
                           <div>
                              <p className={`font-bold text-lg ${selectedVibe === 'Quiet & Steady' ? 'text-violet-900' : 'text-slate-700'}`}>Quiet & Steady</p>
                              <p className="text-slate-500 text-sm">Minimalist, calm, grounded.</p>
                           </div>
                        </button>
                    </div>
                 </div>
              )}

              {/* STEP 7: FIRST HANDSHAKE */}
              {onboardingStep === 6 && (
                 <div className="relative z-10 flex flex-col h-full justify-center animate-in slide-in-from-right-8 duration-500">
                    <div className="flex-1 flex flex-col justify-center">
                        <h2 className="text-4xl font-black text-slate-800 mb-4">Alright. Whenever you’re ready.</h2>
                        <p className="text-xl text-rose-500 font-medium mb-2">I’m here.</p>
                        <p className="text-slate-500 text-lg">What’s on your mind right now?</p>
                    </div>

                    <form onSubmit={handleOnboardingSubmit} className="relative w-full">
                        <input
                            type="text"
                            autoFocus
                            value={onboardingInput}
                            onChange={(e) => setOnboardingInput(e.target.value)}
                            placeholder="Type something..."
                            className="w-full bg-white border-2 border-slate-200 focus:border-rose-400 rounded-3xl p-6 pr-16 text-lg shadow-xl outline-none transition-colors placeholder-slate-300"
                        />
                        <button 
                            type="submit"
                            disabled={!onboardingInput.trim()}
                            className="absolute right-3 top-3 bottom-3 w-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center hover:bg-rose-600 disabled:opacity-50 disabled:bg-slate-300 transition-all shadow-lg shadow-rose-200"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </form>
                 </div>
              )}

           </div>

           {/* Onboarding Footer Controls */}
           {onboardingStep < 6 && (
               <div className="p-6 pt-0 flex justify-center shrink-0 z-20">
                  <button 
                    onClick={() => setOnboardingStep(prev => prev + 1)}
                    className="w-full max-w-xs bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {onboardingStep === 0 ? 'Start' : onboardingStep === 5 ? 'Set My Vibe' : onboardingStep === 1 ? 'Sounds good' : onboardingStep === 2 ? 'Okay' : onboardingStep === 3 ? 'Got it' : 'Continue'}
                  </button>
               </div>
           )}

        </div>
      )}


      {/* Modular Header */}
      <div className="p-4 shrink-0 z-10">
        <div className="bg-gradient-to-r from-violet-100 via-fuchsia-50 to-rose-100 text-slate-800 border border-white rounded-[2rem] p-5 shadow-xl shadow-purple-100/50 flex items-center justify-center sm:justify-between relative overflow-hidden transition-all hover:shadow-purple-200/60">
            {/* Decorative circles */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/60 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-300/20 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-orange-300 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200/50 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <span className="text-2xl animate-[pulse_3s_ease-in-out_infinite]">✨</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <span className="bg-white/80 backdrop-blur-sm border border-white/50 px-2 py-0.5 rounded-md text-[10px] font-black text-rose-500 uppercase tracking-widest shadow-sm">
                                GlowUp
                             </span>
                        </div>
                        <h2 className="font-black text-2xl leading-none text-slate-800 tracking-tight">Sage</h2>
                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            <p className="text-xs text-slate-600 font-medium">Your Confidence Coach</p>
                        </div>
                    </div>
                </div>
            </div>

            <button 
            onClick={openModal}
            className="relative z-10 w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center transition-all backdrop-blur-md text-slate-600 shadow-sm hover:scale-110 border border-white/50 hidden sm:flex"
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
            <div className="p-6 overflow-y-auto scrollbar-hide">
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
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2 space-y-6 perspective-[1000px] scrollbar-hide">
        
        {/* Intro Block */}
        {!showOnboarding && (
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
        )}

        {messages.filter(m => m.role !== 'system').map((msg, index) => (
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
