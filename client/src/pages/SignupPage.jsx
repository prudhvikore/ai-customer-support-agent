import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/useAuth.js";

export default function SignupPage() {
  const { signup } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!isPasswordValid) {
      setErr("Password does not meet all requirements.");
      return;
    }

    setLoading(true);
    try {
      await signup(username, email, password);
      navigate("/");
    } catch (error) {
      setErr(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-6">
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm">Name</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="mt-1 w-full rounded-md bg-slate-800/40 p-2 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm">Email</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-md bg-slate-800/40 p-2 outline-none"
            />
          </div>

          <div className="relative">
            <label className="block text-sm">Password</label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              className={`mt-1 w-full rounded-md bg-slate-800/40 p-2 pr-10 outline-none ${
                password && !isPasswordValid ? "border border-red-500" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-8 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {password && (
            <ul className="text-xs mt-1 space-y-1">
              <li className={rules.length ? "text-green-400" : "text-red-400"}>
                • At least 8 characters
              </li>
              <li className={rules.uppercase ? "text-green-400" : "text-red-400"}>
                • At least 1 uppercase letter
              </li>
              <li className={rules.lowercase ? "text-green-400" : "text-red-400"}>
                • At least 1 lowercase letter
              </li>
              <li className={rules.number ? "text-green-400" : "text-red-400"}>
                • At least 1 number
              </li>
              <li className={rules.special ? "text-green-400" : "text-red-400"}>
                • At least 1 special character
              </li>
            </ul>
          )}

          {err && <div className="text-red-400 text-sm">{err}</div>}

          <button
            disabled={loading || !isPasswordValid}
            className="w-full py-2 rounded-md bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
