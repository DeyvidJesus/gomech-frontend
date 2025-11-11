import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface ChartData {
  name: string;
  value?: number;
  [key: string]: any;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'stacked_bar' | 'scatter' | 'histogram';
  title?: string;
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  series?: string[];
}

export interface AIChartProps {
  data: ChartData[];
  config: ChartConfig;
  height?: number;
}

// Cores para séries múltiplas
const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

const AIChart: React.FC<AIChartProps> = ({ data, config, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum dado disponível para exibir</p>
      </div>
    );
  }

  const { type, title, series = ['value'] } = config;

  // Renderizar gráfico de barras
  if (type === 'bar' || type === 'stacked_bar') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {series.length > 1 && <Legend />}
            {series.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                stackId={type === 'stacked_bar' ? 'stack' : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Renderizar gráfico de linhas
  if (type === 'line' || type === 'scatter') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {series.length > 1 && <Legend />}
            {series.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Renderizar gráfico de pizza
  if (type === 'pie') {
    // Para pizza, usamos a primeira série ou 'value'
    const valueKey = series[0] || 'value';
    
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={valueKey}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Renderizar histograma
  if (type === 'histogram') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill={COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
      <p className="text-gray-500">
        Tipo de gráfico "{type}" não suportado ainda
      </p>
    </div>
  );
};

export default AIChart;

