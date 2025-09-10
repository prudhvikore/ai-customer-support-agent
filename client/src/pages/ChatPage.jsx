/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/useAuth.js";
import ChatMessage from "../components/ChatMessage";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage() {
  const { user, logout, conversations, fetchConversations } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [selectedConvo, setSelectedConvo] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!selectedConvo) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      try {
        const res = await api.post("/chat/messages", {
          chatId: selectedConvo.chatId,
        });

        const resMessages =
          res.data.messages?.map((x) => ({
            role: x.role,
            content: x.content,
          })) || [];

        setMessages((prev) => {
          if (prev.length > resMessages.length) return prev;
          return resMessages;
        });
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    fetchMessages();
  }, [selectedConvo?.chatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const startNewChat = () => {
    const newChat = {
      chatId: uuidv4(),
      chatName: "New Chat",
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
    setSelectedConvo(newChat);
    setMessages([]);
  };

  const send = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    let chatId = selectedConvo?.chatId;
    let chatName = selectedConvo?.chatName;

    if (!chatId) {
      chatId = uuidv4();
      chatName = input.length > 20 ? input.slice(0, 20) + "..." : input;

      setSelectedConvo({
        chatId,
        chatName,
        messages: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    const userMsg = { role: "user", content: input };
    setMessages((s) => [...s, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await api.post("/chat/send", {
        chatId,
        chatName,
        message: userMsg.content,
      });

      const reply = {
        role: "assistant",
        content: res.data.reply || "(no reply)",
      };
      setMessages((s) => [...s, reply]);
      setTyping(false);

      await fetchConversations();
    } catch (error) {
      setMessages((s) => [
        ...s,
        { role: "assistant", content: "Error: could not reach server" },
      ]);
    };
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 h-full">
        {/* Sidebar */}
        <aside className="lg:col-span-2 bg-slate-900/60 border-r border-slate-700/50 flex flex-col h-full">
          {/* New chat + user info */}
          <div className="p-4 border-b border-slate-700/50 space-y-3">
            <button
              onClick={startNewChat}
              className="w-full px-3 py-2 rounded-md bg-slate-800/60 hover:bg-slate-800/80 text-sm"
            >
              + New Chat
            </button>
            <div>
              <div className="text-sm text-slate-300">Signed in as</div>
              <div className="font-medium">{user?.username || user?.email}</div>
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.chatId}
                onClick={() => setSelectedConvo(conv)}
                className={`p-2 rounded-md cursor-pointer ${
                  selectedConvo?.chatId === conv.chatId
                    ? "bg-slate-700/70"
                    : "hover:bg-slate-800/70"
                }`}
              >
                <div className="font-medium">{conv.chatName}</div>
                <div className="text-xs text-slate-400">
                  {new Date(conv.lastUpdated).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={logout}
              className="w-full text-sm px-3 py-2 bg-rose-600 rounded-md hover:bg-rose-700"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Chat area */}
        <main className="lg:col-span-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <h1 className="text-lg font-semibold">
              {selectedConvo?.chatName || "AI Support"}
            </h1>
            <div className="text-sm text-slate-300">
              {selectedConvo
                ? new Date(selectedConvo.lastUpdated).toLocaleString()
                : "New conversation"}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 max-h-[calc(100vh-150px)]">
            {messages.length === 0 && (
              <div className="text-slate-400 text-center mt-20">
                Say hi to the assistant — ask anything about your product,
                account or docs.
              </div>
            )}

            <div className="space-y-6">
              {messages.map((m, i) => (
                <div key={i} className="flex justify-center">
                  <div className="w-full max-w-4xl">
                    <ChatMessage m={m} />
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {typing && (
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <div className="flex justify-start">
                    <div className="flex items-center space-x-2 bg-slate-800/40 px-4 py-2 rounded-xl max-w-xs">
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.2s]"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.4s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={send} className="border-t border-slate-700/50 p-4">
            <div className="flex justify-center">
              <div className="w-full max-w-3xl flex gap-3 items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 rounded-xl bg-slate-800/40 outline-none border border-slate-600 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600"
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
