import { useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/ui/Layout";
import { usePremiumStatus } from "@/hooks/use-users";
import { usePayment } from "@/hooks/use-payment";
import { Crown, User, ShieldCheck, Sparkles, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [, setLocation] = useLocation();
  const username = localStorage.getItem("username");
  
  // Redirect if not logged in
  useEffect(() => {
    if (!username) setLocation("/");
  }, [username, setLocation]);

  const { data: premiumStatus, isLoading } = usePremiumStatus(username);
  const { startPayment, isProcessing } = usePayment();

  if (!username) return null;

  const isPremium = premiumStatus?.premium;

  return (
    <Layout onLogout={() => { localStorage.removeItem("username"); setLocation("/"); }}>
      <div className="flex-1 bg-gray-50 flex flex-col items-center p-6 overflow-y-auto">
        
        <div className="w-full max-w-2xl mt-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
          >
            {/* Header Banner */}
            <div className="h-40 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 relative">
              <div className="absolute -bottom-16 left-8 p-1 bg-white rounded-full">
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-5xl font-bold text-gray-400 border-4 border-white shadow-md">
                  {username[0].toUpperCase()}
                </div>
              </div>
            </div>

            <div className="pt-20 px-8 pb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    {username}
                    {isPremium && <Crown className="w-6 h-6 text-yellow-500 fill-yellow-400" />}
                  </h1>
                  <p className="text-gray-500 font-medium mt-1">
                    {isPremium ? "Premium Member" : "Free Member"}
                  </p>
                </div>
                
                {isPremium ? (
                  <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Verified
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-bold">
                    Basic Plan
                  </span>
                )}
              </div>

              <div className="border-t border-gray-100 pt-8 mt-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Membership Status</h2>
                
                {isLoading ? (
                  <div className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
                ) : isPremium ? (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-800 text-lg">You are a Premium User!</h3>
                      <p className="text-yellow-700/80">Enjoy your exclusive crown sticker and badge.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold">
                        <Sparkles className="w-5 h-5" />
                        <span>Go Premium</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Unlock the Crown Sticker</h3>
                      <p className="text-gray-400 mb-6 max-w-md">
                        Stand out in the chat with a golden crown badge and exclusive stickers. One-time payment.
                      </p>
                      
                      <button
                        onClick={() => startPayment(username)}
                        disabled={isProcessing}
                        className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 active:scale-95 transition-all shadow-lg shadow-white/10"
                      >
                        {isProcessing ? "Processing..." : "Buy Premium for ₹29"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 md:hidden">
                 <button
                    onClick={() => { localStorage.removeItem("username"); setLocation("/"); }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-50 text-red-500 font-bold"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
