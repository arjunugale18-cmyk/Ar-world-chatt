import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@/hooks/use-users";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [, setLocation] = useLocation();
  const loginMutation = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      await loginMutation.mutateAsync(username);
      localStorage.setItem("username", username);
      setLocation("/chat");
    } catch (error) {
      // handled by hook toast
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-12 relative z-10 border border-white/50 backdrop-blur-sm"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl mb-6 shadow-lg shadow-primary/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">AR World Chat</h1>
          <p className="text-gray-500 text-lg">Connect with friends simply.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-semibold text-gray-700 ml-1">
              Choose a Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ironman"
              className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-lg placeholder:text-gray-300"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!username.trim() || loginMutation.isPending}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center space-x-2"
          >
            <span>{loginMutation.isPending ? "Entering..." : "Enter Chat"}</span>
            {!loginMutation.isPending && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          No password required. Just pick a name.
        </p>
      </motion.div>
    </div>
  );
}
