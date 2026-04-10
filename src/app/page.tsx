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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header tenantName={tenant.name} tagline={tenant.tagline} />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-6 max-w-xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welkom bij{" "}
            <span style={{ color: "var(--tenant-primary)" }}>
              {tenant.name}
            </span>
          </h1>
          <p className="text-gray-500 text-sm">
            Chat met onze AI-assistent en ontdek ons assortiment. Vraag advies,
            vergelijk producten en bestel direct via het gesprek.
          </p>
        </div>

        <div className="w-full max-w-lg h-150">
          <ChatWindow tenant={tenant} />
        </div>

        <div className="mt-4 text-xs text-gray-300 flex items-center gap-1.5">
          <span>Powered by</span>
          <span className="font-semibold text-gray-400">Agentic Commerce</span>
          <span>&middot;</span>
          <span>AI Shopping Assistant</span>
        </div>
      </main>
    </div>
  );
}
