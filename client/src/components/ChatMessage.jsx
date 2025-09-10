import React from "react";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ m }) {
  const isUser = m.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-3xl p-4 rounded-lg text-sm leading-relaxed prose prose-invert ${
          isUser
            ? "bg-indigo-500 text-white rounded-br-none"
            : "bg-slate-700 text-slate-100 rounded-bl-none"
        }`}
      >
        <ReactMarkdown>{m.content}</ReactMarkdown>
      </div>
    </div>
  );
}
