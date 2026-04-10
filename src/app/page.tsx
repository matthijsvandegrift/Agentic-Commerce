"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header tenantName={tenant.name} tagline={tenant.tagline} />

      <main className="flex-1 flex flex-col items-center min-h-0 p-4 pb-2">
        <div className="w-full max-w-2xl flex-1 min-h-0">
          <ChatWindow tenant={tenant} />
        </div>

        <div className="py-2 text-xs text-gray-300 flex items-center gap-1.5">
          <span>Powered by</span>
          <span className="font-semibold text-gray-400">Agentic Commerce</span>
          <span>&middot;</span>
          <span>AI Shopping Assistant</span>
        </div>
      </main>
    </div>
  );
}
