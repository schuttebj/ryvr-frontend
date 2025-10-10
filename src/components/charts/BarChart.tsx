import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, useTheme } from '@mui/material';

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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart data={data} layout={layout} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#e0e0e0'} />
          {layout === 'horizontal' ? (
            <>
              <XAxis dataKey={xAxisKey} stroke={isDark ? '#999' : '#666'} />
              <YAxis stroke={isDark ? '#999' : '#666'} />
            </>
          ) : (
            <>
              <XAxis type="number" stroke={isDark ? '#999' : '#666'} />
              <YAxis dataKey={xAxisKey} type="category" stroke={isDark ? '#999' : '#666'} />
            </>
          )}
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#2d3142' : '#fff',
              border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
              borderRadius: '4px',
              color: isDark ? '#fff' : '#000',
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

