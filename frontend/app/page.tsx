'use client';

import { useEffect, useState } from 'react';

interface PortalItem {
  id: number;
  title: string;
  description: string;
  category: string;
  created_at: string;
}

export default function Home() {
  const [items, setItems] = useState<PortalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/items`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      setItems(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            IT Portal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Architectural Portal for Agentic Management
          </p>
        </header>

        <main className="max-w-6xl mx-auto">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading portal items...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <p className="text-gray-600 dark:text-gray-300">No portal items found</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    {item.category && (
                      <span className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {item.description || 'No description available'}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">Powered by Next.js, Deno, and PostgreSQL</p>
          <p className="text-sm">Docker-based containerized architecture</p>
        </footer>
      </div>
    </div>
  );
}
