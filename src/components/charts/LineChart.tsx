import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, useTheme } from '@mui/material';

interface LineChartProps {
  data: any[];
  lines: {
    dataKey: string;
    name: string;
    stroke: string;
  }[];
  xAxisKey: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  xAxisKey,
  height = 300,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#e0e0e0'} />
          <XAxis dataKey={xAxisKey} stroke={isDark ? '#999' : '#666'} />
          <YAxis stroke={isDark ? '#999' : '#666'} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#2d3142' : '#fff',
              border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
              borderRadius: '4px',
              color: isDark ? '#fff' : '#000',
            }}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.stroke}
              strokeWidth={2}
              dot={{ fill: line.stroke, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;

