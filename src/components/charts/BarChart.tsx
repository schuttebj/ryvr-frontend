import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box } from '@mui/material';

interface BarChartProps {
  data: any[];
  bars: {
    dataKey: string;
    name: string;
    fill: string;
  }[];
  xAxisKey: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  xAxisKey,
  height = 300,
  layout = 'horizontal',
}) => {
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart data={data} layout={layout} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          {layout === 'horizontal' ? (
            <>
              <XAxis dataKey={xAxisKey} stroke="#666" />
              <YAxis stroke="#666" />
            </>
          ) : (
            <>
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey={xAxisKey} type="category" stroke="#666" />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
            }}
          />
          <Legend />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.fill}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChart;

