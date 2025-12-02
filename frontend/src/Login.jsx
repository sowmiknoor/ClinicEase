import { useState } from "react";

export default function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.ok) {
        setMsg(`✅ Login successful! Welcome ${data.user.name}`);
        setTimeout(() => {
          setMsg("");
          if (onLoginSuccess) onLoginSuccess();
        }, 1200);
      } else {
        setMsg(`❌ Login failed: ${data.msg}`);
      }
    } catch (err) {
      setMsg("❌ Login failed: Server error");
    }
  };

  return (
    <div className="bg-white/95 p-10 rounded-3xl shadow-2xl border border-pink-200 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-pink-700">Login</h2>
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          autoComplete="username"
          className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-pink-50 transition"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 bg-pink-50 transition"
        />
        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-pink-500 to-blue-400 text-white font-bold rounded-lg shadow-lg hover:from-pink-600 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
        >
          Login
        </button>
      </form>
      {msg && <p className="mt-4 text-center text-base font-medium text-pink-700">{msg}</p>}
    </div>
  );
}
