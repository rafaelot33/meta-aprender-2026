"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function AutoLogout() {
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(timeout);
      // 3600000 ms = 1 Hora
      timeout = setTimeout(() => {
        signOut({ callbackUrl: "/admin/login?timeout=1" });
      }, 3600000); 
    };

    // Fica de olho nessas ações
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    
    resetTimer(); // Inicia na primeira vez

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timeout);
    };
  }, []);

  return null; // É invisível
}