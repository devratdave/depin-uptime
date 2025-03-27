"use client"

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, Globe, Plus, Moon, Sun, Loader2 } from 'lucide-react';
import { useWebsites } from '@/hooks/useWebsites';
import axios from 'axios';
import { useAuth } from "@clerk/nextjs";
import { API_BACKEND_URL } from '@/config';

function StatusCircle({ status }: { status: string | null }) {
  const statusColor = status === 'up' 
    ? 'bg-green-500' 
    : status === 'down' 
      ? 'bg-red-500' 
      : 'bg-gray-400';

  return (
    <div className={`w-3 h-3 rounded-full ${statusColor}`} />
  );
}

function UptimeTicks({ ticks }: { ticks: { status: string; createdAt: string }[] }) {
  // Group ticks into 3-minute windows
  const aggregatedTicks = useMemo(() => {
    const now = new Date();
    const windows: (string | null)[] = Array(10).fill(null);
    
    ticks.forEach(tick => {
      const tickTime = new Date(tick.createdAt);
      const minutesAgo = Math.floor((now.getTime() - tickTime.getTime()) / (1000 * 60));
      const windowIndex = Math.floor(minutesAgo / 3);
      
      if (windowIndex >= 0 && windowIndex < 10) {
        // If there's already a status and it's 'up', keep it up
        windows[windowIndex] = windows[windowIndex] === 'up' ? 'up' : tick.status;
      }
    });
    
    return windows.reverse(); // Most recent first
  }, [ticks]);

  return (
    <div className="flex gap-1 mt-2">
      {aggregatedTicks.map((status, index) => {
        const tickColor = status === 'up' 
          ? 'bg-green-500' 
          : status === 'down' 
            ? 'bg-red-500' 
            : 'bg-gray-400';

        return (
          <div
            key={index}
            className={`w-8 h-2 rounded ${tickColor}`}
            title={`${status ?? 'No data'} - ${3 * (index + 1)} minutes ago`}
          />
        );
      })}
    </div>
  );
}

function WebsiteCard({ website }: { website: { id: string; url: string; ticks: { id: string; createdAt: string; status: string; latency: number }[] } }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const status = useMemo(() => {
    if (website.ticks.length === 0) return null;
    
    const recentTicks = [...website.ticks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return recentTicks[0].status;
  }, [website.ticks]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <StatusCircle status={status} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{website.url}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Latest latency: {website.ticks[0]?.latency ?? 'N/A'} ms
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        )}
      </div>
      
      {isOpen && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 transition-colors">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Last 30 minutes status</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Updated every 3 minutes</p>
            </div>
            <UptimeTicks ticks={website.ticks} />
          </div>
        </div>
      )}
    </div>
  );
}

function CreateWebsiteModal({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: (url: string | null) => Promise<void>;
}) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setUrl('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Website</h2>
        </div>
        <div className="p-4 space-y-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Website URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => onClose(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => onClose(url)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Add Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading websites...</p>
    </div>
  );
}

function App() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { websites, refreshWebsites, isLoading } = useWebsites();
  const { getToken } = useAuth();
  // Handle dark mode initialization and changes
  useEffect(() => {
    // Set initial dark mode preference
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    setMounted(true);

    // Listen for system dark mode changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Uptime Monitor</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Website
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            websites.map((website) => (
              <WebsiteCard key={website.id} website={website} />
            ))
          )}
        </div>
      </div>

      <CreateWebsiteModal
        isOpen={isModalOpen}
        onClose={async (url: string | null) => {
          if(url == null){
            setIsModalOpen(false);
            return;
          }
          const token = await getToken();
          setIsModalOpen(false)
          await axios.post(`${API_BACKEND_URL}/api/v1/website`, {
            url,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(() => {
            refreshWebsites();
          })
        }}
      />
    </div>
  );
}

export default App;