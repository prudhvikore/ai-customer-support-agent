import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function ConversationsList({ onSelect }) {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/chat/history")
      .then((res) => mounted && setConvos(res.data || []))
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Conversations</h3>
        <button
          onClick={() => onSelect(null)}
          className="text-sm bg-indigo-600 px-3 py-1 rounded-md"
        >
          + New
        </button>
      </div>

      {loading && <div className="text-sm text-slate-400">Loading...</div>}

      <div className="space-y-2 max-h-[60vh] overflow-auto">
        {convos.length === 0 && !loading && (
          <div className="text-sm text-slate-400">No conversations yet</div>
        )}
        {convos.map((c) => (
          <div
            key={c._id}
            onClick={() => onSelect(c)}
            className="cursor-pointer p-3 rounded-md bg-slate-800/40 hover:bg-slate-800/60"
          >
            <div className="text-sm font-medium">
              {c.title || new Date(c.createdAt).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1 truncate">
              {(c.messages?.slice(-1)[0]?.text || "—").slice(0, 80)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
