import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type, Chat } from '@google/genai';
import { Mic, MicOff, PhoneCall, X, ChevronDown, ChevronUp, MessageSquare, Send, Sparkles, Activity, Phone, ExternalLink, Loader2, Volume2, Waves } from 'lucide-react';
import { useStore } from '../store';
import { base64ToUint8Array, createPcmBlob, decodeAudioData } from '../utils/audioUtils';
import { useNavigate, useLocation } from 'react-router-dom';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const VoiceAssistant: React.FC = () => {
  const { products, cart, addToCart, placeOrder, checkoutFormData, setCheckoutFormData, isAssistantOpen, assistantMode, toggleAssistant, openAssistant, closeAssistant } = useStore();
  const [activeVoice, setActiveVoice] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [localMode, setLocalMode] = useState<'voice' | 'chat'>('voice');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Audio Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Buffer for incoming transcription chunks
  const currentInputTransRef = useRef('');
  const currentOutputTransRef = useRef('');

  // Refs for data access in closures
  const cartRef = useRef(cart);
  const formDataRef = useRef(checkoutFormData);
  const placeOrderRef = useRef(placeOrder);

  useEffect(() => {
    placeOrderRef.current = placeOrder;
  }, [placeOrder]);

  useEffect(() => {
      cartRef.current = cart;
  }, [cart]);

  useEffect(() => {
      formDataRef.current = checkoutFormData;
  }, [checkoutFormData]);

  // Sync with Global Store
  useEffect(() => {
    if (isAssistantOpen) {
        setLocalMode(assistantMode);
        if (assistantMode === 'voice' && !activeVoice) {
            startSession();
        } else if (assistantMode === 'chat' && activeVoice) {
            cleanupVoice();
        }
    } else {
        cleanupVoice();
    }
  }, [isAssistantOpen, assistantMode]);

  // Handle Local Mode Switch
  const handleModeSwitch = (mode: 'voice' | 'chat') => {
      setLocalMode(mode);
      if (mode === 'chat') {
          cleanupVoice();
      } else {
          startSession();
      }
  };

  // Auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, expanded, isAssistantOpen, activeVoice, localMode]);

  // Helper to parse links in text
  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-orange-400 underline hover:text-orange-300 inline-flex items-center gap-1">{part} <ExternalLink size={10}/></a>;
        }
        return part;
    });
  };

  // Define Tools
  const tools: FunctionDeclaration[] = [
    {
      name: 'getProducts',
      description: 'Get the list of available building materials and their prices.',
      parameters: { type: Type.OBJECT, properties: {} },
    },
    {
      name: 'viewProduct',
      description: 'Navigates the user to the product details page.',
      parameters: {
         type: Type.OBJECT,
         properties: {
             productId: { type: Type.STRING, description: "The ID of the product to view" }
         },
         required: ['productId']
      }
    },
    {
      name: 'addToCart',
      description: 'Add a product to the user\'s shopping cart.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING, description: 'The exact name or close match of the product' },
          quantity: { type: Type.NUMBER, description: 'Quantity to add' }
        },
        required: ['productName', 'quantity']
      }
    },
    {
      name: 'goToCheckout',
      description: 'Navigates the user to the checkout page to finalize the order.',
      parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'fillCheckoutDetails',
        description: 'Fills the checkout form fields (Name, Phone, Address) with user provided details. Call this IMMEDIATELY when user says their name, phone or address.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "Customer full name" },
                phone: { type: Type.STRING, description: "Customer phone number" },
                address: { type: Type.STRING, description: "Delivery address" }
            }
        }
    },
    {
        name: 'confirmOrder',
        description: 'Completes and places the order. Call this ONLY after the user has explicitly confirmed all details.',
        parameters: { type: Type.OBJECT, properties: {} }
    }
  ];

  const executeTool = async (name: string, args: any) => {
    if (name === 'getProducts') {
        const productList = products.map(p => `${p.name} (ID: ${p.id}, ${p.price} EUR)`).join(', ');
        return { products: productList };
    } 
    else if (name === 'viewProduct') {
        navigate(`/product/${args.productId}`);
        return { result: "Navigated to product page." };
    }
    else if (name === 'addToCart') {
        const { productName, quantity } = args;
        const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
        if (product) {
            addToCart(product, quantity || 1);
            return { result: `Added ${quantity} ${product.name} to cart. Ask the user if they want to checkout now or continue.` };
        } else {
            return { result: `Product ${productName} not found.` };
        }
    }
    else if (name === 'goToCheckout') {
        navigate('/checkout');
        return { result: "Navigated to checkout page." };
    }
    else if (name === 'fillCheckoutDetails') {
        console.log("Filling form with:", args);
        setCheckoutFormData((prev) => ({
            name: args.name || prev.name,
            phone: args.phone || prev.phone,
            address: args.address || prev.address
        }));

        if (location.pathname !== '/checkout') {
             navigate('/checkout');
        }
        return { result: "Updated checkout form inputs with user data." };
    }
else if (name === 'confirmOrder') {
        const currentData = formDataRef.current;
        
        // Optional: Keep the guardrail I gave you earlier
        if (cartRef.current.length === 0) {
             return { result: "Error: The cart is empty..." };
        }

        if (!currentData.name || !currentData.phone || !currentData.address) {
             return { result: "Error: Missing details..." };
        }

        // --- CHANGE THIS LINE ---
        // OLD: await placeOrder(currentData);
        // NEW:
        await placeOrderRef.current(currentData); 
        // ------------------------

        return { result: "Order placed successfully! The thank you screen is shown." };
    }30000
    return { result: 'Unknown tool' };
  };
  
  // --- TEXT CHAT HANDLER ---
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                // Simplified system instruction for text mode
                systemInstruction: `You are Ivan, a male construction assistant. Help with products and orders.`,
                tools: [{functionDeclarations: tools}]
            }
        });

        let response = await chat.sendMessage({ message: text });
        
        let functionCalls = response.functionCalls;
        while (functionCalls && functionCalls.length > 0) {
            const toolResponses = [];
            for (const call of functionCalls) {
                const result = await executeTool(call.name, call.args);
                if(call.name === 'addToCart') {
                     setMessages(prev => [...prev, { role: 'model', text: `✅ Добавям продукт в количката...` }]);
                }
                toolResponses.push({
                    functionResponse: {
                        name: call.name,
                        response: { result: result },
                        id: call.id
                    }
                });
            }
            response = await chat.sendMessage({ message: toolResponses });
            functionCalls = response.functionCalls;
        }

        const reply = response.text;
        if (reply) {
            setMessages(prev => [...prev, { role: 'model', text: reply }]);
        }

    } catch (e) {
        console.error(e);
        setMessages(prev => [...prev, { role: 'model', text: 'Съжалявам, възникна грешка. Моля, опитайте отново.' }]);
    } finally {
        setIsTyping(false);
    }
  };

  // --- VOICE SESSION HANDLER ---
  const startSession = async () => {
    if (!process.env.API_KEY) return;
    if (activeVoice) return;

    try {
      setConnecting(true);
      
      // Dynamic System Instruction with Cart Context
      const currentCart = cartRef.current;
      const cartSummary = currentCart.length > 0 
        ? currentCart.map(i => `${i.quantity}x ${i.name} (€${i.price})`).join(', ') 
        : 'Empty';
      const total = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
      const currentUser = formDataRef.current;
      
      const systemInstruction = `
        You are "Ivan", a male sales assistant for "NaiStroi Trans" in Sofia, Bulgaria.
        Voice Personality: Male, Deep, Professional, Helpful Construction Expert.
        
        Current Cart Context: ${cartSummary}.
        Total Order Value: €${total}.
        Current User Details: Name=${currentUser.name || 'Unknown'}, Phone=${currentUser.phone || 'Unknown'}, Address=${currentUser.address || 'Unknown'}.

        CRITICAL INSTRUCTIONS:
        1. FORM FILLING: If the user speaks their Name, Phone, or Address, call 'fillCheckoutDetails' IMMEDIATELY.
           Do NOT ask them to type.
           
        2. ORDER CONFIRMATION: Before calling 'confirmOrder', you MUST explicitly summarize the order.
           Say something like: "Let's review. You have [Items]. Delivery to [Address] for [Name]. Total is [Total]. Do you confirm?"
           Only call 'confirmOrder' after they say "Yes" or "Confirm".

        3. LANGUAGE: Speak Bulgarian primarily, but understand English.
           Use "EUR" for currency, or convert to BGN (x1.95) if asked.

        4. BEHAVIOR:
           - If user asks for products -> 'getProducts'
           - If user wants to buy -> 'addToCart'
           - If user says "Order" or "Checkout" -> 'goToCheckout' then ask for missing details.
      `;

      if(messages.length === 0) {
          setMessages([{ role: 'model', text: 'Здравейте! Аз съм Иван. С какво мога да помогна за строежа?' }]);
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Init Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setConnecting(false);
            setActiveVoice(true);

            // Input Streaming Logic
            if (!inputContextRef.current) return;
            const source = inputContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Transcription
            if (msg.serverContent?.outputTranscription) {
               currentOutputTransRef.current += msg.serverContent.outputTranscription.text;
            }
            if (msg.serverContent?.inputTranscription) {
               currentInputTransRef.current += msg.serverContent.inputTranscription.text;
            }

            if (msg.serverContent?.turnComplete) {
               if (currentInputTransRef.current.trim()) {
                 setMessages(prev => [...prev, { role: 'user', text: currentInputTransRef.current }]);
                 currentInputTransRef.current = '';
               }
               if (currentOutputTransRef.current.trim()) {
                 setMessages(prev => [...prev, { role: 'model', text: currentOutputTransRef.current }]);
                 currentOutputTransRef.current = '';
               }
            }

            // Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputContextRef.current) {
               setIsSpeaking(true);
               const audioData = base64ToUint8Array(base64Audio);
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current.currentTime);
               
               const buffer = await decodeAudioData(audioData, outputContextRef.current, 24000, 1);
               const source = outputContextRef.current.createBufferSource();
               source.buffer = buffer;
               const gainNode = outputContextRef.current.createGain();
               source.connect(gainNode);
               gainNode.connect(outputContextRef.current.destination);
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += buffer.duration;
               
               sourcesRef.current.add(source);
               source.onended = () => {
                 sourcesRef.current.delete(source);
                 if (sourcesRef.current.size === 0) setIsSpeaking(false);
               };
            }

            // Interruption
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
              currentOutputTransRef.current = '';
            }

            // Tools
            if (msg.toolCall) {
              for (const call of msg.toolCall.functionCalls) {
                // Use the Ref-aware execute function
                const result = await executeTool(call.name, call.args);
                sessionPromise.then(session => session.sendToolResponse({
                  functionResponses: {
                    id: call.id,
                    name: call.name,
                    response: { result: result }
                  }
                }));
              }
            }
          },
          onclose: () => cleanupVoice(),
          onerror: (err) => {
            console.error(err);
            cleanupVoice();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } }, // Male Voice
          systemInstruction,
          tools: [{ functionDeclarations: tools }]
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setConnecting(false);
      setActiveVoice(false);
    }
  };

  const cleanupVoice = () => {
    setActiveVoice(false);
    setConnecting(false);
    setIsSpeaking(false);
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    if (inputContextRef.current) inputContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();
    if(sessionRef.current) sessionRef.current = null;
  };

  if (!isAssistantOpen && !activeVoice) {
      // Small Floating Button when closed
      return (
        <div className="fixed bottom-6 right-6 z-50">
             <button
                onClick={toggleAssistant}
                className="group relative flex items-center justify-center w-16 h-16 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all duration-300 transform hover:scale-110 bg-gradient-to-br from-orange-500 to-red-600 text-white hover:shadow-orange-500/60"
             >
                <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-30"></div>
                <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-pulse"></div>
                <PhoneCall size={28} className="drop-shadow-md relative z-10" />
            </button>
        </div>
      );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end font-sans w-full sm:w-auto p-4 sm:p-0">
        <div className={`
          bg-neutral-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-orange-500/30 
          mb-0 sm:mb-4 transition-all overflow-hidden flex flex-col 
          ${expanded ? 'w-full sm:w-96 h-[500px] sm:h-[600px] max-h-[80vh]' : 'w-auto h-auto'}
          animate-fade-in-up
        `}>
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white p-4 flex justify-between items-center border-b border-white/10 relative overflow-hidden shrink-0 z-30">
            <div className="absolute inset-0 bg-orange-500/5"></div>
            <span className="font-heading font-bold flex items-center gap-2 tracking-wide text-orange-500 text-lg relative z-10">
              <PhoneCall size={18} className="animate-pulse" /> 
              {expanded ? 'АСИСТЕНТ ИВАН' : 'ИВАН'}
            </span>
            <div className="flex gap-2 relative z-10">
               <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white transition p-1 hover:bg-white/10 rounded">
                 {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
               </button>
               <button onClick={() => { cleanupVoice(); closeAssistant(); }} className="text-gray-400 hover:text-red-500 transition p-1 hover:bg-white/10 rounded">
                 <X size={18} />
               </button>
            </div>
          </div>
          
          {expanded && (
            <>
              {/* Mode Toggle */}
              <div className="p-2 bg-neutral-800/50 flex gap-2 border-b border-white/5 relative z-20 shrink-0">
                 <button 
                   onClick={() => handleModeSwitch('voice')}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${localMode === 'voice' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transform scale-105' : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                 >
                   <Mic size={14} /> Глас
                 </button>
                 <button 
                   onClick={() => handleModeSwitch('chat')}
                   className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${localMode === 'chat' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transform scale-105' : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                 >
                   <MessageSquare size={14} /> Чат
                 </button>
              </div>

              {/* PINNED VISUALIZER - Stays at top */}
              {localMode === 'voice' && (
                <div className="shrink-0 relative bg-neutral-900/50 border-b border-white/5 p-4 flex items-center justify-center min-h-[160px]">
                     {/* Background Glow */}
                     <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/10 rounded-full blur-[40px] transition-opacity duration-1000 ${activeVoice ? 'opacity-100' : 'opacity-0'}`}></div>

                     {/* Status Text */}
                     <div className="absolute top-2 right-2 z-20">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${activeVoice ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                            <div className={`w-1 h-1 rounded-full ${activeVoice ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                            {activeVoice ? (isSpeaking ? 'ГОВОРЯ' : 'СЛУШАМ') : 'ГОТОВНОСТ'}
                        </span>
                     </div>

                     {/* Visualizer / Listening Animation */}
                     {activeVoice && !isSpeaking && !connecting && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                             <div className="flex gap-1">
                                 {[...Array(5)].map((_, i) => (
                                     <div key={i} className="w-1 bg-orange-500 rounded-full animate-[bounce_1s_infinite] h-8" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                 ))}
                             </div>
                        </div>
                     )}

                     {/* Mic Button / Center Interaction */}
                    {!activeVoice && !connecting ? (
                         <button 
                            onClick={() => startSession()}
                            className="group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95"
                         >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-full opacity-20 group-hover:opacity-30 blur-xl transition"></div>
                            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-2xl border-2 border-neutral-900 group-hover:border-orange-500/30 transition-all z-10">
                               <PhoneCall size={24} className="animate-pulse" />
                            </div>
                            <div className="absolute -bottom-6 text-white font-bold text-[10px] uppercase tracking-wider opacity-80 group-hover:opacity-100 transition whitespace-nowrap">Старт</div>
                         </button>
                    ) : (
                        <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500`}>
                             {isSpeaking && (
                                 <>
                                    <div className="absolute inset-0 rounded-full border-2 border-orange-500/50 animate-ping opacity-50"></div>
                                    <div className="absolute -inset-2 rounded-full border border-orange-500/30 animate-ping delay-75 opacity-30"></div>
                                 </>
                             )}
                             
                             <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center text-white shadow-2xl relative z-10 ${connecting ? 'animate-spin border-t-orange-500' : ''}`}>
                                  {connecting ? (
                                      <div className="w-6 h-6 border-2 border-white/30 border-t-orange-500 rounded-full"></div>
                                  ) : (
                                      isSpeaking ? <Volume2 size={28} className="text-orange-500" /> : <Waves size={28} className="text-orange-500 animate-pulse" />
                                  )}
                             </div>
                             
                             {connecting && (
                                 <div className="absolute -bottom-8 text-white font-bold text-[10px] uppercase tracking-wider animate-pulse">Свързване...</div>
                             )}
                        </div>
                    )}
                </div>
              )}

              {/* Chat Area (Scrollable) */}
              <div 
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto p-4 space-y-4 bg-neutral-900 custom-scrollbar relative"
              >
                {/* Messages */}
                <div className={`space-y-4 ${localMode === 'voice' ? 'opacity-80 transition duration-300' : ''}`}>
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm break-words ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-br-sm' 
                            : 'bg-neutral-800 text-slate-200 border border-white/5 rounded-bl-sm'
                        }`}>
                          {renderMessageText(msg.text)}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                         <div className="bg-neutral-800 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce delay-150"></span>
                         </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Chat Input (Only in Chat Mode) */}
              {localMode === 'chat' ? (
                  <form onSubmit={handleTextSubmit} className="p-4 bg-neutral-900 border-t border-white/5 flex gap-2 relative z-20 shrink-0">
                     <input 
                       type="text" 
                       placeholder="Питай Иван..." 
                       className="flex-grow bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm transition"
                       value={inputText}
                       onChange={(e) => setInputText(e.target.value)}
                     />
                     <button type="submit" disabled={!inputText.trim() || isTyping} className="bg-orange-600 text-white p-3 rounded-xl hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg">
                        <Send size={20} />
                     </button>
                  </form>
              ) : (
                  // Voice Control Footer
                  <div className="p-4 bg-neutral-900 border-t border-white/5 text-center relative z-20 shrink-0">
                      {activeVoice && (
                          <button onClick={() => cleanupVoice()} className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center justify-center gap-2 w-full py-2 rounded-lg hover:bg-red-500/10 transition uppercase tracking-wider">
                              <MicOff size={14} /> Прекрати връзката
                          </button>
                      )}
                  </div>
              )}
            </>
          )}
        </div>
    </div>
  );
};
