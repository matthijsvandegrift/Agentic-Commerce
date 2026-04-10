"use client";

import { DemoSwitcher } from "./DemoSwitcher";

interface HeaderProps {
  tenantName: string;
  tagline: string;
}

export function Header({ tenantName, tagline }: HeaderProps) {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold tracking-tight">{tenantName}</div>
          <div className="hidden sm:block text-white/70 text-sm border-l border-white/30 pl-3">
            {tagline}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <DemoSwitcher />
        </div>
      </div>
    </header>
  );
}
