import Anthropic from "@anthropic-ai/sdk";

export const agentTools: Anthropic.Tool[] = [
  {
    name: "search_products",
    description:
      "Search the product catalog. Use this to find products matching a customer's request. Always search before recommending products.",
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
          description: "Maximum number of results to return (default 5)",
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
];
