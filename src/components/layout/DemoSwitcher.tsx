"use client";

import { useState } from "react";
import { demoScenarios } from "@/config/demo-scenarios";

const TENANTS = [
  { id: "hema", name: "HEMA" },
  { id: "kruidvat", name: "Kruidvat" },
];

interface DemoSwitcherProps {
  onScenario?: (message: string) => void;
}

export function DemoSwitcher({ onScenario }: DemoSwitcherProps) {
  const [open, setOpen] = useState(false);

  function switchTenant(tenantId: string) {
    document.cookie = `tenant=${tenantId};path=/;max-age=86400`;
    window.location.reload();
  }

  function startScenario(message: string) {
    setOpen(false);
    onScenario?.(message);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-sm transition-colors"
        title="Switch demo tenant"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Demo
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
            <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Switch Brand
            </div>
            {TENANTS.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTenant(t.id)}
                className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.name}
              </button>
            ))}

            {onScenario && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-t border-gray-100">
                  Demo Scenarios
                </div>
                {demoScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => startScenario(scenario.initialMessage)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm text-gray-700 font-medium">
                      {scenario.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {scenario.description}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
