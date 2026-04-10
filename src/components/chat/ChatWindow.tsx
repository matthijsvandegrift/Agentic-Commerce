"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { CartItem, UserProfile } from "@/types";
import { DemoSwitcher } from "@/components/layout/DemoSwitcher";
import { ShoppingPanel } from "./ShoppingPanel";

interface TenantInfo {
  id: string;
  name: string;
  tagline: string;
  welcomeMessage: string;
  suggestedQuestions: string[];
  theme: Record<string, string>;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  toolResults?: {
    type: string;
    data: any;
  }[];
}

export function ChatWindow({ tenant }: { tenant: TenantInfo }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: tenant.welcomeMessage,
    },
  ]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversationHistory, setConversationHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  async function sendMessage(
    text: string,
    imageData?: { base64: string; mediaType: string; previewUrl: string }
  ) {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      imageUrl: imageData?.previewUrl,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const newHistory = [
      ...conversationHistory,
      { role: "user" as const, content: text },
    ];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          cart,
          tenantId: tenant.id,
          userProfile,
          ...(imageData && {
            imageData: {
              base64: imageData.base64,
              mediaType: imageData.mediaType,
            },
          }),
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let assistantContent = "";
      const toolResults: Message["toolResults"] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            continue;
          }
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);

              if (data.content !== undefined) {
                assistantContent += data.content;
                setMessages((prev) => {
                  const existing = prev.find((m) => m.id === "streaming");
                  if (existing) {
                    return prev.map((m) =>
                      m.id === "streaming"
                        ? {
                            ...m,
                            content: assistantContent,
                            toolResults: [...toolResults],
                          }
                        : m
                    );
                  }
                  return [
                    ...prev,
                    {
                      id: "streaming",
                      role: "assistant",
                      content: assistantContent,
                      toolResults: [...toolResults],
                    },
                  ];
                });
              } else if (data.toolName) {
                toolResults.push({
                  type: data.type,
                  data: data.data,
                });
                setMessages((prev) => {
                  const existing = prev.find((m) => m.id === "streaming");
                  if (existing) {
                    return prev.map((m) =>
                      m.id === "streaming"
                        ? {
                            ...m,
                            content: assistantContent,
                            toolResults: [...toolResults],
                          }
                        : m
                    );
                  }
                  return [
                    ...prev,
                    {
                      id: "streaming",
                      role: "assistant",
                      content: assistantContent,
                      toolResults: [...toolResults],
                    },
                  ];
                });
              } else if (data.cart) {
                setCart(data.cart);
                if (data.userProfile) {
                  setUserProfile(data.userProfile);
                }
              } else if (data.userProfile && !data.cart) {
                setUserProfile(data.userProfile);
              } else if (
                data.message &&
                !data.content &&
                !data.toolName &&
                !data.cart
              ) {
                assistantContent += `\n\n${data.message}`;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // Finalize the streaming message with a stable ID
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "streaming"
            ? { ...m, id: `assistant-${Date.now()}` }
            : m
        )
      );

      setConversationHistory([
        ...newHistory,
        { role: "assistant" as const, content: assistantContent },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, er ging iets mis. Probeer het opnieuw.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddToCart(productId: string) {
    sendMessage(`Voeg product ${productId} toe aan mijn winkelwagen`);
  }

  function handleCheckout() {
    sendMessage("Ik wil afrekenen");
  }

  function handleSuggestedQuestion(question: string) {
    sendMessage(question);
  }

  const showSuggestions = messages.length <= 1 && !isLoading;

  const hasCart = cart.length > 0;

  return (
    <div className="flex h-full overflow-hidden">
      {/* LHS: Chat (2/3) */}
      <div className={`flex flex-col bg-white overflow-hidden transition-all duration-300 ${hasCart ? "w-2/3" : "w-full"}`}>
        {/* Chat header */}
        <div
          className="px-5 py-3.5 text-white flex items-center gap-3 shrink-0"
          style={{ backgroundColor: "var(--tenant-primary)" }}
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              AI
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2"
              style={{ borderColor: "var(--tenant-primary)" }}
            />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{tenant.name} Assistent</div>
            <div className="text-xs text-white/70">Online</div>
          </div>
          <DemoSwitcher onScenario={(msg) => sendMessage(msg)} />
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto chat-scroll p-4 space-y-4 bg-linear-to-b from-gray-50/80 to-white min-h-0"
        >
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              imageUrl={msg.imageUrl}
              toolResults={msg.toolResults}
              onAddToCart={handleAddToCart}
              onCheckout={handleCheckout}
            />
          ))}

          {isLoading && !messages.find((m) => m.id === "streaming") && (
            <div className="flex justify-start">
              <div className="bg-chat-assistant rounded-2xl rounded-bl-md">
                <TypingIndicator />
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {showSuggestions && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tenant.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="px-3.5 py-2 text-xs rounded-full border border-gray-200 bg-white text-gray-600
                    hover:border-primary hover:text-primary hover:bg-gray-50 transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>

      {/* RHS: Shopping Panel (1/3) — slides in when cart has items */}
      {hasCart && (
        <div className="w-1/3 shrink-0 animate-slide-in-right">
          <ShoppingPanel
            cart={cart}
            tenantName={tenant.name}
            loyaltyName={tenant.id === "hema" ? "Meer HEMA" : "Etos Bonuskaart"}
            onAddSuggested={(id) => sendMessage(`Voeg product ${id} toe aan mijn winkelwagen`)}
            onCheckout={handleCheckout}
          />
        </div>
      )}
    </div>
  );
}
