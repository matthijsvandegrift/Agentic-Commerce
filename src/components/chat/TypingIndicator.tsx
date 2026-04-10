"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce-dot" />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce-dot" />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce-dot" />
      </div>
    </div>
  );
}
