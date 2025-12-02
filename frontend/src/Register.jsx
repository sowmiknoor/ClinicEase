
import { useState } from "react";

export default function Register({ onRegistered }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Patient',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('🎉 User registered successfully! Redirecting to login...');
        setTimeout(() => {
          setMessage('');
          if (onRegistered) onRegistered();
        }, 1500);
        setFormData({ name: '', email: '', password: '', role: 'Patient' });
      } else {
        setMessage(data.msg || data.message || 'Registration failed.');
      }
    } catch (err) {
      setMessage('Error connecting to server.');
    }
  };

  return (
    <div className="bg-white/95 p-10 rounded-3xl shadow-2xl border border-blue-100 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Create Your Account</h2>
      {message && (
        <div className={`mb-4 px-4 py-2 rounded text-center text-base font-medium ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-base font-semibold text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="off"
            className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50 transition"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50 transition"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50 transition"
            required
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-base font-semibold text-gray-700 mb-1">Role</label>
          <select
            name="role"
            id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-blue-50 transition"
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin">Admin</option>
                </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 mt-2 bg-gradient-to-r from-blue-500 to-pink-400 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-pink-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Register
        </button>
      </form>
    </div>
  );
}
