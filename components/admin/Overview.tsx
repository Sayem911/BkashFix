'use client';

import { useState, useEffect } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface OverviewData {
  name: string;
  revenue: number;
  orders: number;
}

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OverviewData[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      const response = await fetch('/api/admin/analytics/overview');
      if (!response.ok) throw new Error('Failed to fetch overview data');
      
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      setError('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card className="p-2 border-purple-900/20 bg-gray-900/90 backdrop-blur-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-sm text-gray-300">Revenue:</span>
                      <span className="font-bold">${payload[0].value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm text-gray-300">Orders:</span>
                      <span className="font-bold">{payload[1].value}</span>
                    </div>
                  </div>
                </Card>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="orders"
          stroke="#3b82f6"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}