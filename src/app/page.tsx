"use client";

import { useEffect, useState } from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";

interface TenantInfo {
  id: string;
  name: string;
  tagline: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
  theme: Record<string, string>;
}

export default function Home() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);

  useEffect(() => {
    const t = (window as any).__TENANT__;
    if (t) setTenant(t);
  }, []);

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ChatWindow tenant={tenant} />
    </div>
  );
}
