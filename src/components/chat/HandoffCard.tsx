"use client";

import { useState, useEffect } from "react";

interface HandoffCardProps {
  data: {
    reason: string;
    conversationSummary: string;
    customerMood?: string;
    department?: string;
  };
}

export function HandoffCard({ data }: HandoffCardProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const departmentLabels: Record<string, string> = {
    klantenservice: "Klantenservice",
    retouren: "Retouren & Ruilen",
    klachten: "Klachtenafhandeling",
    technisch: "Technische Support",
  };

  const dept = data.department
    ? departmentLabels[data.department] || data.department
    : "Klantenservice";

  return (
    <div className="mt-2 p-4 bg-white rounded-xl border border-blue-100 shadow-sm animate-fade-in">
      {/* Connecting animation */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-900">
            Doorverbinden met {dept}{dots}
          </h4>
          <p className="text-xs text-gray-500">
            Geschatte wachttijd: ~2 minuten
          </p>
        </div>
      </div>

      {/* Context summary */}
      <div className="bg-blue-50 rounded-lg p-2.5 text-xs text-blue-800">
        <p className="font-medium mb-1">Samenvatting voor de medewerker:</p>
        <p className="text-blue-700">{data.conversationSummary}</p>
      </div>

      <p className="text-[10px] text-gray-400 mt-2">
        Je hoeft niets opnieuw uit te leggen — de medewerker heeft de volledige
        context van dit gesprek.
      </p>
    </div>
  );
}
