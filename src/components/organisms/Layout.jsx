import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TimerWidget from "@/components/molecules/TimerWidget";
import { TimerProvider } from "@/contexts/TimerContext";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

return (
    <TimerProvider>
<div className="h-screen flex" style={{backgroundColor: '#121212'}}>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
<div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </div>
        
        <TimerWidget />
      </div>
    </TimerProvider>
  );
};

export default Layout;