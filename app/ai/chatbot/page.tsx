"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Bot, User, Loader2, AlertTriangle,
  Calendar, Stethoscope, Sparkles, RotateCcw, ChevronLeft, ArrowRight,
  Shield, Brain
} from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { ChatMessage } from "@/services/ai/chatbot";
import Link from "next/link";

const SUGGESTED_QUESTIONS = [
  "What does a high blood pressure reading mean?",
  "How do I prepare for a blood test?",
  "What are common symptoms of diabetes?",
  "How can I book an appointment with a specialist?",
];

export default function ChatbotPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data } = await axios.post("/api/ai/chat", {
        message: messageText,
        history: messages,
        patientContext: { name: user?.name },
      });

      const { reply, isEmergency: emergency } = data.data;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (emergency) setIsEmergency(true);
    } catch {
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto animate-fade-in-up mt-10">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-indigo-200">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Medix Intelligence</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Clinical Neural Core Active
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([])} className="text-sm font-bold text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-2">
          <RotateCcw className="w-4 h-4" /> Reset Session
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 glass-card rounded-[2.5rem] overflow-hidden flex flex-col border-white/40 shadow-2xl">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-8 animate-float">
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">How can I assist your health today?</h2>
              <p className="text-gray-500 font-medium mb-10 leading-relaxed">I am your dedicated medical AI, trained to analyze symptoms, explain reports, and guide your care.</p>
              <div className="grid grid-cols-1 gap-3 w-full">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="group text-left text-sm font-bold text-gray-600 bg-white/50 hover:bg-indigo-600 hover:text-white px-6 py-4 rounded-2xl border border-gray-100 hover:border-indigo-600 transition-all duration-300 flex items-center justify-between">
                    {q}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-indigo-100">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}>
                  <div className={`px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed font-medium shadow-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-50 rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                  <p className={`text-[10px] font-bold text-gray-400 mt-2 px-2 uppercase tracking-widest ${msg.role === "user" ? "text-right" : ""}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-50 px-6 py-4 rounded-[2rem] rounded-tl-none">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-indigo-200 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Premium Input Bar */}
        <div className="p-8 bg-white/50 border-t border-gray-100/50">
          <div className="relative flex items-center">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Type your medical inquiry..."
              rows={1}
              className="w-full bg-white border border-gray-200 rounded-[2rem] pl-8 pr-16 py-5 text-[15px] font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none shadow-sm"
              style={{ height: "auto" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-lg shadow-indigo-200">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
              <Shield className="w-3 h-3" /> Encrypted Connection
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
              <Brain className="w-3 h-3" /> Clinical Logic v4.2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
