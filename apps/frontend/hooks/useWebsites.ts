import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_BACKEND_URL } from "@/config";
type Website = {
  id: string;
  url: string;
  ticks: {
    id: string;
    createdAt: string;
    status: string;
    latency: number;
  }[]
}

export const useWebsites = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();

  async function refreshWebsites() {
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWebsites(response.data);
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    refreshWebsites();
    const interval = setInterval(refreshWebsites, 1000 * 60);
    return () => clearInterval(interval);
  }, [mounted, getToken]);
  return { websites, refreshWebsites, isLoading };
};