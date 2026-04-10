import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getTenant } from "@/lib/tenant";
import { buildSystemPrompt, executeTool } from "@/lib/agent";
import { agentTools } from "@/config/tools";
import { CartItem } from "@/types";

const client = new Anthropic();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    messages,
    cart: initialCart = [],
    tenantId,
  } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
    cart: CartItem[];
    tenantId?: string;
  };

  const tenant = getTenant(tenantId);
  let cart = [...initialCart];
  const systemPrompt = buildSystemPrompt(tenant, cart);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        let anthropicMessages: Anthropic.MessageParam[] = messages.map(
          (m) => ({
            role: m.role,
            content: m.content,
          })
        );

        let continueLoop = true;

        while (continueLoop) {
          const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            tools: agentTools,
            messages: anthropicMessages,
          });

          // Process each content block
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

              // Update cart state
              cart = toolResult.cart;

              // Send tool result to frontend for rich rendering
              send("tool_result", {
                toolName: block.name,
                type: toolResult.displayType,
                data: toolResult.result,
              });

              // Add assistant's tool_use and our tool_result to messages for next iteration
              anthropicMessages = [
                ...anthropicMessages,
                {
                  role: "assistant" as const,
                  content: response.content,
                },
                {
                  role: "user" as const,
                  content: [
                    {
                      type: "tool_result" as const,
                      tool_use_id: block.id,
                      content: JSON.stringify(toolResult.result),
                    },
                  ],
                },
              ];
            }
          }

          // Continue if the model wants to use more tools
          if (response.stop_reason === "tool_use") {
            continueLoop = true;
          } else {
            continueLoop = false;
          }
        }

        send("done", { cart });
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
