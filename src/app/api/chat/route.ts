import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTenant } from "@/lib/tenant";
import { buildSystemPrompt, executeTool } from "@/lib/agent";
import { agentTools } from "@/config/tools";
import { CartItem, UserProfile } from "@/types";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    messages,
    cart: initialCart = [],
    tenantId,
    userProfile: initialProfile = {},
    imageData,
  } = body as {
    messages: Anthropic.MessageParam[];
    cart: CartItem[];
    tenantId?: string;
    userProfile?: UserProfile;
    imageData?: { base64: string; mediaType: string };
  };

  const tenant = getTenant(tenantId);
  let cart = [...initialCart];
  let userProfile: UserProfile = { ...initialProfile };
  const systemPrompt = buildSystemPrompt(tenant, cart, userProfile);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        let anthropicMessages: Anthropic.MessageParam[] = [...messages];

        // If there's an image, modify the last user message to include it
        if (imageData && anthropicMessages.length > 0) {
          const lastMsg = anthropicMessages[anthropicMessages.length - 1];
          if (lastMsg.role === "user") {
            const textContent =
              typeof lastMsg.content === "string"
                ? lastMsg.content
                : Array.isArray(lastMsg.content)
                  ? (lastMsg.content as Anthropic.TextBlockParam[])
                      .filter((b) => b.type === "text")
                      .map((b) => b.text)
                      .join(" ")
                  : "";

            anthropicMessages[anthropicMessages.length - 1] = {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: imageData.mediaType as
                      | "image/jpeg"
                      | "image/png"
                      | "image/gif"
                      | "image/webp",
                    data: imageData.base64,
                  },
                },
                {
                  type: "text",
                  text:
                    textContent ||
                    "Wat zie je op deze foto? Zoek vergelijkbare producten.",
                },
              ],
            };
          }
        }

        // Buffer all tool results so products never appear before text.
        const bufferedToolResults: {
          toolName: string;
          type: string;
          data: unknown;
        }[] = [];

        let continueLoop = true;

        while (continueLoop) {
          const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            tools: agentTools,
            messages: anthropicMessages,
          });

          const toolResultMessages: Anthropic.ToolResultBlockParam[] = [];

          for (const block of response.content) {
            if (block.type === "text") {
              send("text", { content: block.text });
            } else if (block.type === "tool_use") {
              const toolResult = executeTool(
                block.name,
                block.input as Record<string, unknown>,
                tenant,
                cart
              );

              cart = toolResult.cart;

              // Merge user profile updates
              if (toolResult.userProfile) {
                userProfile = { ...userProfile, ...toolResult.userProfile };
                if (toolResult.userProfile.mentionedAges) {
                  userProfile.mentionedAges = [
                    ...new Set([
                      ...(userProfile.mentionedAges || []),
                      ...toolResult.userProfile.mentionedAges,
                    ]),
                  ];
                }
                if (toolResult.userProfile.interests) {
                  userProfile.interests = [
                    ...new Set([
                      ...(userProfile.interests || []),
                      ...toolResult.userProfile.interests,
                    ]),
                  ];
                }
                send("profile_update", { userProfile });
              }

              // Buffer — don't send yet
              bufferedToolResults.push({
                toolName: block.name,
                type: toolResult.displayType,
                data: toolResult.result,
              });

              toolResultMessages.push({
                type: "tool_result" as const,
                tool_use_id: block.id,
                content: JSON.stringify(toolResult.result),
              });
            }
          }

          // If tools were used, add to message history for next iteration
          if (toolResultMessages.length > 0) {
            anthropicMessages = [
              ...anthropicMessages,
              {
                role: "assistant" as const,
                content: response.content,
              },
              {
                role: "user" as const,
                content: toolResultMessages,
              },
            ];
          }

          continueLoop = response.stop_reason === "tool_use";
        }

        // Now that all text has been sent, flush product cards
        for (const tr of bufferedToolResults) {
          send("tool_result", tr);
        }

        send("done", { cart, userProfile });
        controller.close();
      } catch (error) {
        console.error("Chat API error:", error);
        send("error", {
          message:
            error instanceof Error ? error.message : "Er ging iets mis",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
