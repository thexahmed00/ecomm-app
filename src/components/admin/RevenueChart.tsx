'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: { name: string; revenue: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis dataKey="name" stroke="#888" />
        <YAxis stroke="#888" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
          itemStyle={{ color: '#E8A020' }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#E8A020" 
          strokeWidth={2}
          dot={{ fill: '#0F0F0F', stroke: '#E8A020', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#E8A020' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
