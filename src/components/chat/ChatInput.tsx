"use client";

import { useState, useRef, useEffect } from "react";

interface ImageData {
  base64: string;
  mediaType: string;
  previewUrl: string;
}

interface ChatInputProps {
  onSend: (message: string, imageData?: ImageData) => void;
  disabled?: boolean;
  placeholder?: string;
}

function resizeImage(file: File, maxSize: number = 1024): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        const base64 = dataUrl.split(",")[1];

        resolve({
          base64,
          mediaType: "image/jpeg",
          previewUrl: dataUrl,
        });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Typ een bericht...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<ImageData | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && !pendingImage) || disabled) return;

    const message = trimmed || "Ik zoek iets dat hierop lijkt";
    onSend(message, pendingImage || undefined);
    setInput("");
    setPendingImage(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageData = await resizeImage(file);
      setPendingImage(imageData);
    } catch (err) {
      console.error("Error processing image:", err);
    }

    // Reset input so same file can be selected again
    e.target.value = "";
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col border-t border-gray-100 bg-white"
    >
      {/* Image preview */}
      {pendingImage && (
        <div className="px-3 pt-3 flex items-start gap-2">
          <div className="relative">
            <img
              src={pendingImage.previewUrl}
              alt="Preview"
              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 text-white
                flex items-center justify-center text-xs hover:bg-gray-900"
            >
              x
            </button>
          </div>
          <span className="text-xs text-gray-400 mt-1">
            Foto bijgevoegd
          </span>
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 text-gray-400
            flex items-center justify-center
            hover:bg-gray-50 hover:text-gray-600 transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
          title="Foto uploaden"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={disabled || (!input.trim() && !pendingImage)}
          className="shrink-0 w-10 h-10 rounded-xl bg-primary text-white
            flex items-center justify-center
            hover:opacity-90 active:scale-95 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19V5m0 0l-7 7m7-7l7 7"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
