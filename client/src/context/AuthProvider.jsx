import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [conversations, setConversations] = useState([]); // ✅ store chats here
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
      localStorage.removeItem("user");
      return null;
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get("/chat/conversations");
      setConversations(res.data);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setConversations([]);
      return [];
    }
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token } = res.data;

    localStorage.setItem("token", token);

    // get user details
    const me = await fetchUser();
    if (me) await fetchConversations(); // ✅ fetch chats after login
    return me;
  };

  const signup = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });
    const { token } = res.data;

    localStorage.setItem("token", token);

    // get user details
    const me = await fetchUser();
    if (me) await fetchConversations(); // ✅ fetch chats after signup
    return me;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setConversations([]); // ✅ clear chats
    navigate("/login");
  };

  // restore user + conversations on app load
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    (async () => {
      let me = user;
      if (!me) {
        me = await fetchUser();
      }
      if (me) {
        await fetchConversations();
      }
    })();
  }
}, []);

  

  return (
    <AuthContext.Provider
      value={{
        user,
        conversations, // ✅ expose conversations
        login,
        signup,
        logout,
        fetchConversations, // optional: to refresh sidebar manually
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
