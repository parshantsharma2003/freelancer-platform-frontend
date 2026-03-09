import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

/**
 * Chart Component - Comprehensive data visualization
 */

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

/**
 * Custom Tooltip Component
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">
            {entry.name}: <span className="font-semibold text-gray-900">{entry.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Area Chart Component
 */
export const AreaChartComponent = ({ 
  data, 
  dataKey, 
  xAxisKey = 'name', 
  title,
  color = '#10b981',
  height = 300,
  gradient = true,
}) => {
  return (
    <Card>
      {title && (
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </Card.Header>
      )}
      <Card.Body>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            {gradient && (
              <defs>
                <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisKey} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={gradient ? `url(#color${dataKey})` : color}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

/**
 * Bar Chart Component
 */
export const BarChartComponent = ({ 
  data, 
  dataKeys = [], 
  xAxisKey = 'name', 
  title,
  height = 300,
  stacked = false,
}) => {
  return (
    <Card>
      {title && (
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </Card.Header>
      )}
      <Card.Body>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisKey} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                stackId={stacked ? 'stack' : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

/**
 * Line Chart Component
 */
export const LineChartComponent = ({ 
  data, 
  dataKeys = [], 
  xAxisKey = 'name', 
  title,
  height = 300,
}) => {
  return (
    <Card>
      {title && (
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </Card.Header>
      )}
      <Card.Body>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisKey} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

/**
 * Pie Chart Component
 */
export const PieChartComponent = ({ 
  data, 
  dataKey = 'value',
  nameKey = 'name',
  title,
  height = 300,
}) => {
  return (
    <Card>
      {title && (
        <Card.Header>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </Card.Header>
      )}
      <Card.Body>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => entry[nameKey]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};

/**
 * Stat Card with Trend
 */
export const StatCard = ({ 
  title, 
  value, 
  description, 
  trend, 
  trendValue,
  icon,
  color = 'primary',
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-blue-50 text-blue-600',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <Card.Body>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <TrendingUp className={`h-4 w-4 ${trendColors.up}`} />
                ) : (
                  <TrendingDown className={`h-4 w-4 ${trendColors.down}`} />
                )}
                <span className={`text-sm font-semibold ${trendColors[trend]}`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default {
  AreaChart: AreaChartComponent,
  BarChart: BarChartComponent,
  LineChart: LineChartComponent,
  PieChart: PieChartComponent,
  StatCard,
};
