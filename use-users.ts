import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useUsers() {
  return useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path);
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.users.list.responses[200].parse(await res.json());
    },
    // Refresh often to see new users online
    refetchInterval: 5000, 
  });
}

export function useLogin() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (username: string) => {
      const res = await fetch(api.users.login.path, {
        method: api.users.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }
      
      return api.users.login.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Login Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function usePremiumStatus(username: string | null) {
  return useQuery({
    queryKey: [api.users.getPremium.path, username],
    enabled: !!username,
    queryFn: async () => {
      if (!username) return { premium: false };
      const url = api.users.getPremium.path.replace(":username", username);
      const res = await fetch(url);
      if (!res.ok) return { premium: false };
      return api.users.getPremium.responses[200].parse(await res.json());
    },
  });
}
