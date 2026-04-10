import Anthropic from "@anthropic-ai/sdk";

export const agentTools: Anthropic.Tool[] = [
  {
    name: "search_products",
    description:
      "Search the product catalog. Always search before recommending. Be selective: use maxResults 1-2 for specific needs, 3 for browsing. Never dump a long list — quality over quantity.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "Search query — product name, category, use case, or keywords",
        },
        category: {
          type: "string",
          description: "Optional: filter by product category",
        },
        maxResults: {
          type: "number",
          description: "Maximum number of results to return (default 3, max 5). Use 1-2 for specific requests, 3 for browsing.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_product_details",
    description:
      "Get full details for a specific product by its ID. Use when a customer asks for more info about a specific product.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The product ID",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "add_to_cart",
    description:
      "Add a product to the customer's shopping cart.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The product ID to add",
        },
        quantity: {
          type: "number",
          description: "Quantity to add (default 1)",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "remove_from_cart",
    description: "Remove a product from the customer's shopping cart.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The product ID to remove",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "update_cart_quantity",
    description:
      "Update the quantity of a product already in the cart.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The product ID",
        },
        quantity: {
          type: "number",
          description: "New quantity",
        },
      },
      required: ["productId", "quantity"],
    },
  },
  {
    name: "get_cart",
    description:
      "Get the current contents of the customer's shopping cart with totals.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "checkout",
    description:
      "Process the checkout. Call this when the customer confirms they want to complete their purchase.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "update_user_profile",
    description:
      "Update the customer's profile with preferences you've learned during the conversation. Call this proactively when the customer mentions ages, interests, budget, occasion, or who they're shopping for. This helps you give better recommendations throughout the session.",
    input_schema: {
      type: "object" as const,
      properties: {
        mentionedAges: {
          type: "array",
          items: { type: "string" },
          description: 'Ages mentioned (e.g. ["7 jaar", "volwassene"])',
        },
        interests: {
          type: "array",
          items: { type: "string" },
          description: 'Interests detected (e.g. ["dinosaurussen", "voetbal"])',
        },
        budget: {
          type: "object",
          properties: {
            min: { type: "number" },
            max: { type: "number" },
          },
          description: "Budget range in EUR",
        },
        occasion: {
          type: "string",
          description:
            'Shopping occasion (e.g. "verjaardag", "back to school", "sinterklaas")',
        },
        shoppingFor: {
          type: "string",
          description:
            'Who they are shopping for (e.g. "dochter", "zelf", "collega")',
        },
        preferences: {
          type: "object",
          additionalProperties: { type: "string" },
          description:
            'Other preferences as key-value pairs (e.g. {"kleur": "blauw", "stijl": "minimalistisch"})',
        },
      },
      required: [],
    },
  },
  {
    name: "check_store_stock",
    description:
      "Check if a product is available at a specific store or in stores in a city. Use when customer asks about in-store availability.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The product ID to check",
        },
        city: {
          type: "string",
          description: "City name to search stores in (e.g. 'Amsterdam')",
        },
        storeId: {
          type: "string",
          description: "Specific store ID (optional, use city instead for broader search)",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "find_nearest_store",
    description:
      "Find the nearest stores based on city or postal code. Use when customer asks about store locations.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "City name or postal code",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_store_info",
    description:
      "Get detailed information about a specific store (opening hours, services, address).",
    input_schema: {
      type: "object" as const,
      properties: {
        storeId: {
          type: "string",
          description: "The store ID",
        },
      },
      required: ["storeId"],
    },
  },
  {
    name: "check_loyalty_balance",
    description:
      "Check the customer's loyalty program balance, tier status, and recent purchase history. Use when customer asks about points, rewards, or their account.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "redeem_points",
    description:
      "Redeem loyalty points for a discount on the current order.",
    input_schema: {
      type: "object" as const,
      properties: {
        points: {
          type: "number",
          description: "Number of points to redeem",
        },
      },
      required: ["points"],
    },
  },
  {
    name: "get_purchase_history",
    description:
      "Get the customer's recent purchase history from their loyalty account.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "apply_discount_code",
    description:
      "Validate and apply a discount/coupon code to the current order.",
    input_schema: {
      type: "object" as const,
      properties: {
        code: {
          type: "string",
          description: "The discount code to apply",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "track_order",
    description:
      "Track the status of an existing order by order ID.",
    input_schema: {
      type: "object" as const,
      properties: {
        orderId: {
          type: "string",
          description: "The order ID to track",
        },
      },
      required: ["orderId"],
    },
  },
  {
    name: "request_human_handoff",
    description:
      "Transfer the customer to a human agent when the issue requires human intervention: complaints, complex returns, frustration, or questions outside your capabilities. Always include a summary so the human agent has full context.",
    input_schema: {
      type: "object" as const,
      properties: {
        reason: {
          type: "string",
          description: "Why the handoff is needed",
        },
        conversationSummary: {
          type: "string",
          description: "Brief summary of the conversation so far for the human agent",
        },
        customerMood: {
          type: "string",
          enum: ["neutral", "frustrated", "angry", "confused"],
          description: "The customer's current mood",
        },
        department: {
          type: "string",
          enum: ["klantenservice", "retouren", "klachten", "technisch"],
          description: "Which department to transfer to",
        },
      },
      required: ["reason", "conversationSummary"],
    },
  },
];
