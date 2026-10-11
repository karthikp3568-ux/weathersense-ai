import React, { useState, useRef, useEffect } from 'react';
import { WeatherData, AIMessage } from '../types/weather';
import { sendChatMessage } from '../services/aiService';
import {
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  Compass,
} from 'lucide-react';

interface AIChatPageProps {
  weather: WeatherData | null;
}

const SUGGESTED_QUESTIONS = [
  'What is the current weather?',
  'Explain today\'s weather conditions',
  'Explain the temperature trend',
  'Will it rain according to the available forecast?',
  'Compare Bengaluru and Mysuru',
  'Explain humidity and thermal comfort',
  'Explain the wind conditions',
  'What precautions should I take based on the forecast?',
];

export const AIChatPage: React.FC<AIChatPageProps> = ({ weather }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am WeatherSense AI Assistant. I have active telemetry for ${weather?.city || 'your station'} (${weather?.temperature ?? 26.4}°C, ${weather?.weather_description ?? 'clouds'}, humidity ${weather?.humidity ?? 62}%, wind ${weather?.wind_speed ?? 14.8} km/h). How can I assist with your meteorological analysis today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading || !weather) return;

    const userMessage: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(textToSend.trim(), weather, weather.city);
      const assistantMessage: AIMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: response.timestamp,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Communication notice: Unable to connect to AI backend (${errMsg}). Please verify that GEMINI_API_KEY is configured in backend environment.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. Ready to answer meteorological inquiries for ${weather?.city || 'current location'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden flex flex-col h-[calc(100dvh-var(--header-h)-6rem)] min-h-[28rem]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-700/50 bg-slate-900/60 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-sky-500 text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">WeatherSense AI Assistant</h2>
              <span className="text-micro font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Gemini 3.8
              </span>
            </div>
            <p className="text-tiny text-slate-400">
              Grounded in current telemetry for <strong className="text-slate-300">{weather?.city}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-xs font-medium border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          title="Clear conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Suggested Chips Bar */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/80 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-micro text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
            Prompt suggestions:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/60 transition-all whitespace-nowrap cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-2xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-slate-900/80 text-slate-200 border border-slate-700/60 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              <p>{msg.text}</p>
              <span className="block text-micro opacity-60 text-right font-mono mt-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 max-w-2xl mr-auto">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-300 border border-purple-500/30 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 rounded-tl-none flex items-center gap-2 text-xs text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2">Synthesizing meteorological answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 border-t border-slate-700/50 bg-slate-900/80 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask about ${weather?.city || 'current weather'}, temperature trends, rain probability, or precautions...`}
          disabled={isLoading}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-40 cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
