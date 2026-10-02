import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Activity, 
  Filter,
  BarChart2,
  Info
} from 'lucide-react';

type TimeRange = '7d' | '30d' | '6m' | '1y';

interface DataPoint {
  label: string;
  active: number;
  expired: number;
  dateStr: string;
}

export const SubscriptionAnalyticsWidget: React.FC = () => {
  const { orders } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showActiveLine, setShowActiveLine] = useState(true);
  const [showExpiredLine, setShowExpiredLine] = useState(true);

  // Generate realistic growth trend data based on selected time range
  const getDataForRange = (range: TimeRange): DataPoint[] => {
    const totalOrdersCount = orders.length || 18;
    
    if (range === '7d') {
      return [
        { label: 'Mon', active: 12, expired: 2, dateStr: '2026-09-25' },
        { label: 'Tue', active: 15, expired: 3, dateStr: '2026-09-26' },
        { label: 'Wed', active: 19, expired: 2, dateStr: '2026-09-27' },
        { label: 'Thu', active: 24, expired: 4, dateStr: '2026-09-28' },
        { label: 'Fri', active: 28, expired: 3, dateStr: '2026-09-29' },
        { label: 'Sat', active: 32, expired: 5, dateStr: '2026-09-30' },
        { label: 'Sun', active: 38 + Math.min(10, totalOrdersCount), expired: 4, dateStr: '2026-10-01' }
      ];
    }
    
    if (range === '30d') {
      return [
        { label: 'Week 1', active: 42, expired: 8, dateStr: 'Sep 01 - Sep 07' },
        { label: 'Week 2', active: 68, expired: 12, dateStr: 'Sep 08 - Sep 14' },
        { label: 'Week 3', active: 94, expired: 15, dateStr: 'Sep 15 - Sep 21' },
        { label: 'Week 4', active: 128 + totalOrdersCount, expired: 18, dateStr: 'Sep 22 - Sep 30' }
      ];
    }

    if (range === '6m') {
      return [
        { label: 'May', active: 30, expired: 10, dateStr: 'May 2026' },
        { label: 'Jun', active: 55, expired: 14, dateStr: 'Jun 2026' },
        { label: 'Jul', active: 82, expired: 16, dateStr: 'Jul 2026' },
        { label: 'Aug', active: 110, expired: 22, dateStr: 'Aug 2026' },
        { label: 'Sep', active: 145, expired: 25, dateStr: 'Sep 2026' },
        { label: 'Oct', active: 180 + totalOrdersCount, expired: 28, dateStr: 'Oct 2026' }
      ];
    }

    // 1y
    return [
      { label: 'Q1', active: 45, expired: 15, dateStr: 'Q1 2026' },
      { label: 'Q2', active: 95, expired: 22, dateStr: 'Q2 2026' },
      { label: 'Q3', active: 150, expired: 30, dateStr: 'Q3 2026' },
      { label: 'Q4', active: 220 + totalOrdersCount, expired: 35, dateStr: 'Q4 2026' }
    ];
  };

  const chartData = getDataForRange(timeRange);

  // Compute scale boundaries for SVG
  const maxVal = Math.max(...chartData.map(d => Math.max(d.active, d.expired))) * 1.15 || 100;
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const getX = (index: number) => {
    if (chartData.length <= 1) return paddingX;
    return paddingX + (index * (svgWidth - paddingX * 2)) / (chartData.length - 1);
  };

  const getY = (val: number) => {
    return svgHeight - paddingY - (val * (svgHeight - paddingY * 2)) / maxVal;
  };

  // Generate smooth SVG curve path string
  const createSmoothPath = (key: 'active' | 'expired') => {
    if (chartData.length === 0) return '';
    
    let path = `M ${getX(0)} ${getY(chartData[0][key])}`;
    for (let i = 0; i < chartData.length - 1; i++) {
      const x1 = getX(i);
      const y1 = getY(chartData[i][key]);
      const x2 = getX(i + 1);
      const y2 = getY(chartData[i + 1][key]);
      const cx1 = x1 + (x2 - x1) / 2;
      const cx2 = x1 + (x2 - x1) / 2;
      path += ` C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
    }
    return path;
  };

  // Create SVG closed area for gradient fill
  const createAreaPath = (key: 'active' | 'expired') => {
    if (chartData.length === 0) return '';
    const linePath = createSmoothPath(key);
    const lastX = getX(chartData.length - 1);
    const firstX = getX(0);
    const bottomY = svgHeight - paddingY;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  // Growth metric calculations
  const latestData = chartData[chartData.length - 1];
  const previousData = chartData[Math.max(0, chartData.length - 2)];
  const activeGrowthPercent = Math.round(((latestData.active - previousData.active) / (previousData.active || 1)) * 100);
  const totalActiveCount = latestData.active;
  const totalExpiredCount = latestData.expired;
  const totalSubsTotal = totalActiveCount + totalExpiredCount;
  const retentionRate = totalSubsTotal > 0 ? Math.round((totalActiveCount / totalSubsTotal) * 100) : 100;

  return (
    <div className="bg-white rounded-3xl border border-pink-100 p-5 sm:p-6 shadow-sm space-y-6 text-left relative overflow-hidden transition-all">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-100/40 via-rose-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-pink-100/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 font-display">
                Subscription Growth & Retention Analytics
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-50 text-pink-700 border border-pink-200">
                REAL-TIME TRENDS
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active vs. Expired subscriptions line breakdown with retention rates over time
            </p>
          </div>
        </div>

        {/* Time-Range Selector Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#faf8f9] rounded-2xl border border-pink-100 self-start sm:self-auto shrink-0">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '6m', label: '6 Months' },
            { id: '1y', label: '1 Year' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setTimeRange(btn.id as TimeRange)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                timeRange === btn.id
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        
        <div className="p-4 rounded-2xl bg-[#faf8f9] border border-pink-100 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Active Subscriptions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">{totalActiveCount}</span>
            <span className="text-xs font-bold text-emerald-600 font-mono flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +{activeGrowthPercent}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Verified active vault items</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#faf8f9] border border-pink-100 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Expired / Lapsed</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">{totalExpiredCount}</span>
            <span className="text-xs font-semibold text-rose-500 font-mono">
              ~{Math.round((totalExpiredCount / (totalActiveCount || 1)) * 100)}% churn
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Term expired items</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#faf8f9] border border-pink-100 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Retention Rate</span>
            <Activity className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-pink-600">
            {retentionRate}%
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block">Strong customer retention</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#faf8f9] border border-pink-100 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Auto-Renewal Pool</span>
            <RefreshCw className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            86%
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">Auto-deduct tokens enabled</span>
        </div>

      </div>

      {/* Interactive Line Chart Legend & Visibility Toggles */}
      <div className="flex items-center justify-between gap-4 pt-1 relative z-10 flex-wrap">
        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          
          <button
            onClick={() => setShowActiveLine(!showActiveLine)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              showActiveLine 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs' 
                : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
            }`}
            title="Toggle Active Subscriptions curve visibility"
          >
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-2xs" />
            <span>Active Subscriptions Curve</span>
          </button>

          <button
            onClick={() => setShowExpiredLine(!showExpiredLine)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              showExpiredLine 
                ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs' 
                : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
            }`}
            title="Toggle Expired Subscriptions curve visibility"
          >
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-2xs" />
            <span>Expired Subscriptions Curve</span>
          </button>

        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-pink-500" />
          <span>Hover over data points to inspect date metrics</span>
        </div>
      </div>

      {/* SVG Line Chart Container */}
      <div className="relative w-full bg-[#faf8f9] rounded-2xl border border-pink-100/90 p-4 relative z-10 overflow-hidden">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Active Line Gradient */}
            <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Expired Line Gradient */}
            <linearGradient id="expiredGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + pct * (svgHeight - paddingY * 2);
            const valLabel = Math.round(maxVal * (1 - pct));
            return (
              <g key={idx}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={svgWidth - paddingX} 
                  y2={y} 
                  stroke="#f1f5f9" 
                  strokeDasharray="4 4" 
                  strokeWidth="1" 
                />
                <text 
                  x={paddingX - 8} 
                  y={y + 3} 
                  fill="#94a3b8" 
                  fontSize="9" 
                  fontFamily="monospace" 
                  textAnchor="end"
                >
                  {valLabel}
                </text>
              </g>
            );
          })}

          {/* X-Axis Labels */}
          {chartData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={svgHeight - 6}
              fill="#64748b"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {d.label}
            </text>
          ))}

          {/* Active Subscriptions Filled Area & Curve */}
          {showActiveLine && (
            <>
              <path 
                d={createAreaPath('active')} 
                fill="url(#activeGradient)" 
              />
              <path 
                d={createSmoothPath('active')} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3" 
                strokeLinecap="round" 
              />
            </>
          )}

          {/* Expired Subscriptions Filled Area & Curve */}
          {showExpiredLine && (
            <>
              <path 
                d={createAreaPath('expired')} 
                fill="url(#expiredGradient)" 
              />
              <path 
                d={createSmoothPath('expired')} 
                fill="none" 
                stroke="#f43f5e" 
                strokeWidth="2.5" 
                strokeDasharray="5 5" 
                strokeLinecap="round" 
              />
            </>
          )}

          {/* Interactive Data Point Dots */}
          {chartData.map((d, i) => {
            const cx = getX(i);
            const cyActive = getY(d.active);
            const cyExpired = getY(d.expired);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Vertical hover guide line */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={svgHeight - paddingY}
                    stroke="#ec4899"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Active Dot */}
                {showActiveLine && (
                  <circle
                    cx={cx}
                    cy={cyActive}
                    r={isHovered ? 6 : 4}
                    fill="#ffffff"
                    stroke="#10b981"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredPoint(d);
                      setHoveredIndex(i);
                    }}
                    onMouseLeave={() => {
                      setHoveredPoint(null);
                      setHoveredIndex(null);
                    }}
                  />
                )}

                {/* Expired Dot */}
                {showExpiredLine && (
                  <circle
                    cx={cx}
                    cy={cyExpired}
                    r={isHovered ? 6 : 4}
                    fill="#ffffff"
                    stroke="#f43f5e"
                    strokeWidth={isHovered ? 3 : 2}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredPoint(d);
                      setHoveredIndex(i);
                    }}
                    onMouseLeave={() => {
                      setHoveredPoint(null);
                      setHoveredIndex(null);
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hovered Point Tooltip */}
        {hoveredPoint && hoveredIndex !== null && (
          <div 
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 font-mono text-xs z-30 pointer-events-none animate-in fade-in duration-150 flex items-center gap-4"
          >
            <div>
              <span className="text-[10px] text-pink-400 uppercase font-bold block">{hoveredPoint.dateStr}</span>
              <span className="text-slate-200 font-bold">{hoveredPoint.label} Metrics</span>
            </div>

            <div className="h-7 w-px bg-slate-700" />

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active: {hoveredPoint.active} units</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <XCircle className="w-3.5 h-3.5" />
                <span>Expired: {hoveredPoint.expired} units</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
