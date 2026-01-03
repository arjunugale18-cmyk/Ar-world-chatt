import { z } from "zod";
import { insertUserSchema, insertMessageSchema, users, messages } from "./schema";

export const api = {
  users: {
    login: {
      method: "POST" as const,
      path: "/api/login",
      input: z.object({ username: z.string().min(1) }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(), // Return user object (created or existing)
        400: z.object({ message: z.string() }),
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/users",
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    getPremium: {
      method: "GET" as const,
      path: "/api/users/:username/premium",
      responses: {
        200: z.object({ premium: z.boolean() }),
        404: z.object({ message: z.string() }),
      },
    },
  },
  payment: {
    createOrder: {
      method: "POST" as const,
      path: "/api/create-order",
      responses: {
        200: z.any(), // Razorpay order object
      },
    },
    success: {
      method: "POST" as const,
      path: "/api/payment-success",
      input: z.object({ username: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
      },
    },
  },
};

export const ws = {
  events: {
    JOIN: "join",
    SEND_MESSAGE: "sendMessage",
    NEW_MESSAGE: "newMessage",
  },
};
