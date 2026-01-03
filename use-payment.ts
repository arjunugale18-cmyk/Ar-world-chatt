import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function usePayment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 1. Create Order
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.payment.createOrder.path, {
        method: api.payment.createOrder.method,
      });
      if (!res.ok) throw new Error("Failed to create order");
      return await res.json();
    },
  });

  // 2. Handle Success
  const successMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await fetch(api.payment.success.path, {
        method: api.payment.success.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) throw new Error("Payment verification failed");
      return api.payment.success.responses[200].parse(await res.json());
    },
    onSuccess: (_, username) => {
      queryClient.invalidateQueries({ queryKey: [api.users.getPremium.path, username] });
      toast({
        title: "Premium Unlocked! 👑",
        description: "You now have access to premium stickers.",
      });
    },
  });

  const startPayment = async (username: string) => {
    try {
      // Load Razorpay script if not present
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const order = await createOrderMutation.mutateAsync();

      const options = {
        key: "rzp_test_xxxxxxxx", // Test key as requested
        amount: order.amount,
        currency: order.currency,
        name: "AR World Chat",
        description: "Premium Membership",
        order_id: order.id,
        handler: async function (response: any) {
          await successMutation.mutateAsync(username);
        },
        prefill: {
          name: username,
        },
        theme: {
          color: "#0095f6",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong initiating the payment.",
        variant: "destructive",
      });
    }
  };

  return { startPayment, isProcessing: createOrderMutation.isPending || successMutation.isPending };
}
