import React, { useContext } from "react";
import { AuthContext } from "./AuthContext.js";

const Sidebar = ({ onSelectChat }) => {
  const { conversations } = useContext(AuthContext);

  return (
    <aside className="sidebar">
      {conversations.map((conv) => (
        <div
          key={conv.chatId}
          className="conversation-item"
          onClick={() => onSelectChat(conv.chatId, conv.chatName)}
        >
          <p className="chat-name">{conv.chatName}</p>
          <small>{new Date(conv.lastUpdated).toLocaleString()}</small>
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
