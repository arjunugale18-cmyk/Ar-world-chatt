import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
  onLogout?: () => void;
}

export function Layout({ children, onLogout }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/chat", icon: MessageCircle, label: "Chat" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row max-w-7xl mx-auto shadow-2xl overflow-hidden md:h-screen">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 z-20">
        <div className="mb-10">
          <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AR World
          </h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  location === item.href
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("w-6 h-6", location === item.href ? "text-white" : "text-gray-500 group-hover:text-gray-900")} />
                <span className="font-medium text-lg">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors mt-auto"
          >
            <LogOut className="w-6 h-6" />
            <span className="font-medium">Logout</span>
          </button>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen relative overflow-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center z-50 fixed bottom-0 w-full pb-safe">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
             <div className={cn(
               "flex flex-col items-center space-y-1 p-2 transition-colors cursor-pointer",
               location === item.href ? "text-primary" : "text-gray-400"
             )}>
               <item.icon className="w-6 h-6" />
               <span className="text-xs font-medium">{item.label}</span>
             </div>
          </Link>
        ))}
        {onLogout && (
          <button onClick={onLogout} className="flex flex-col items-center space-y-1 p-2 text-red-400">
            <LogOut className="w-6 h-6" />
            <span className="text-xs font-medium">Exit</span>
          </button>
        )}
      </nav>
    </div>
  );
}
