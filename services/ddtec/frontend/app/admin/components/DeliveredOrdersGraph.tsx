import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, DollarSign, PackageCheck, Truck, ShoppingBag, Calendar, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface DeliveredTrendPoint {
    date: string;
    label: string;
    day: string;
    count: number;
    revenue: number;
}

interface StatusBreakdownItem {
    count: number;
    revenue: number;
}

interface StatusBreakdownMap {
    delivered?: StatusBreakdownItem;
    shipped?: StatusBreakdownItem;
    processing?: StatusBreakdownItem;
    pending?: StatusBreakdownItem;
    cancelled?: StatusBreakdownItem;
    [key: string]: StatusBreakdownItem | undefined;
}

interface DeliveredStatsProps {
    deliveredStats?: {
        totalDeliveredCount: number;
        totalDeliveredRevenue: number;
        trends: DeliveredTrendPoint[];
        statusBreakdown: StatusBreakdownMap;
    };
    allOrders?: any[];
}

function formatDateString(d: Date): string {
    return d.toISOString().split('T')[0];
}

const DeliveredOrdersGraph: React.FC<DeliveredStatsProps> = ({ deliveredStats, allOrders = [] }) => {
    const [viewMode, setViewMode] = useState<'count' | 'revenue'>('count');
    const [rangeMode, setRangeMode] = useState<'14d' | '7d' | '30d' | 'custom'>('14d');

    // Default dates for custom range selector (default to last 14 days)
    const todayStr = useMemo(() => formatDateString(new Date()), []);
    const fourteenAgoStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 13);
        return formatDateString(d);
    }, []);

    const [customStartDate, setCustomStartDate] = useState<string>(fourteenAgoStr);
    const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

    const [hoveredPoint, setHoveredPoint] = useState<DeliveredTrendPoint | null>(null);

    // Compute metrics from props or fallback to processing allOrders array
    const deliveredOrders = allOrders.filter(o => o.status === 'delivered');
    const totalDeliveredCount = deliveredStats?.totalDeliveredCount ?? deliveredOrders.length;
    const totalDeliveredRevenue = deliveredStats?.totalDeliveredRevenue ?? deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrderValue = totalDeliveredCount > 0 ? Math.round(totalDeliveredRevenue / totalDeliveredCount) : 0;

    // Calculate total orders for fulfillment rate
    const totalOrdersCount = allOrders.length || (deliveredStats?.statusBreakdown ? Object.values(deliveredStats.statusBreakdown).reduce((a, b) => a + (b?.count || 0), 0) : 0);
    const fulfillmentRate = totalOrdersCount > 0 ? Math.round((totalDeliveredCount / totalOrdersCount) * 100) : 0;

    // Map of all dates from trends or allOrders fallback
    const dateDataMap = useMemo(() => {
        const map: Record<string, { count: number; revenue: number }> = {};
        if (deliveredStats?.trends && deliveredStats.trends.length > 0) {
            deliveredStats.trends.forEach(t => {
                map[t.date] = { count: t.count, revenue: t.revenue };
            });
        }
        if (allOrders.length > 0) {
            deliveredOrders.forEach(o => {
                const dateStr = formatDateString(new Date(o.createdAt));
                if (!map[dateStr]) map[dateStr] = { count: 0, revenue: 0 };
                map[dateStr].count += 1;
                map[dateStr].revenue += (o.totalAmount || 0);
            });
        }
        return map;
    }, [deliveredStats, allOrders, deliveredOrders]);

    // Construct trendData based on rangeMode or custom date range
    const trendData: DeliveredTrendPoint[] = useMemo(() => {
        let start: Date;
        let end: Date;

        if (rangeMode === '7d') {
            end = new Date();
            start = new Date();
            start.setDate(end.getDate() - 6);
        } else if (rangeMode === '14d') {
            end = new Date();
            start = new Date();
            start.setDate(end.getDate() - 13);
        } else if (rangeMode === '30d') {
            end = new Date();
            start = new Date();
            start.setDate(end.getDate() - 29);
        } else {
            // Custom Range
            start = customStartDate ? new Date(customStartDate) : new Date();
            end = customEndDate ? new Date(customEndDate) : new Date();
            if (isNaN(start.getTime())) start = new Date();
            if (isNaN(end.getTime())) end = new Date();
            if (start > end) {
                const tmp = start;
                start = end;
                end = tmp;
            }
        }

        const pointsList: DeliveredTrendPoint[] = [];
        const curr = new Date(start);
        while (curr <= end) {
            const dateStr = formatDateString(curr);
            const data = dateDataMap[dateStr] || { count: 0, revenue: 0 };
            pointsList.push({
                date: dateStr,
                label: curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                day: curr.toLocaleDateString('en-US', { weekday: 'short' }),
                count: data.count,
                revenue: Math.round(data.revenue)
            });
            curr.setDate(curr.getDate() + 1);
        }

        return pointsList;
    }, [rangeMode, customStartDate, customEndDate, dateDataMap]);

    // Quick action: Shift date range by 14 days back or forward
    const handleShift14Days = (direction: 'prev' | 'next') => {
        setRangeMode('custom');
        const start = new Date(customStartDate || fourteenAgoStr);
        const end = new Date(customEndDate || todayStr);
        const offset = direction === 'prev' ? -14 : 14;
        start.setDate(start.getDate() + offset);
        end.setDate(end.getDate() + offset);
        setCustomStartDate(formatDateString(start));
        setCustomEndDate(formatDateString(end));
    };

    // Quick action: Set 14-day window starting from customStartDate
    const handleSet14DayWindow = (newStartStr: string) => {
        setCustomStartDate(newStartStr);
        const start = new Date(newStartStr);
        if (!isNaN(start.getTime())) {
            const end = new Date(start);
            end.setDate(end.getDate() + 13);
            setCustomEndDate(formatDateString(end));
        }
    };

    // Graph math
    const maxVal = Math.max(
        ...trendData.map(d => viewMode === 'count' ? d.count : d.revenue),
        viewMode === 'count' ? 5 : 1000
    );

    const svgWidth = 750;
    const svgHeight = 220;
    const paddingX = 45;
    const paddingY = 30;
    const chartWidth = svgWidth - paddingX * 2;
    const chartHeight = svgHeight - paddingY * 2;

    const points = trendData.map((d, idx) => {
        const x = paddingX + (idx / Math.max(1, trendData.length - 1)) * chartWidth;
        const val = viewMode === 'count' ? d.count : d.revenue;
        const y = svgHeight - paddingY - (val / maxVal) * chartHeight;
        return { x, y, data: d };
    });

    // Create SVG smooth curved path
    const linePath = points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point.x},${point.y}`;
        const prev = a[i - 1];
        const cx1 = prev.x + (point.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (point.x - prev.x) / 2;
        const cy2 = point.y;
        return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${point.x},${point.y}`;
    }, '');

    const areaPath = points.length > 0 ? `${linePath} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z` : '';

    // Calculate label skipping step depending on total days in trendData
    const labelStep = trendData.length <= 7 ? 1 : trendData.length <= 14 ? 2 : trendData.length <= 30 ? 4 : 10;

    // Status breakdown values
    const statusMap = deliveredStats?.statusBreakdown || {};
    const delCount = statusMap.delivered?.count ?? totalDeliveredCount;
    const shipCount = statusMap.shipped?.count ?? allOrders.filter(o => o.status === 'shipped').length;
    const procCount = statusMap.processing?.count ?? allOrders.filter(o => o.status === 'processing').length;
    const pendCount = statusMap.pending?.count ?? allOrders.filter(o => o.status === 'pending').length;
    const cancCount = statusMap.cancelled?.count ?? allOrders.filter(o => o.status === 'cancelled').length;

    const totalStatusCount = delCount + shipCount + procCount + pendCount + cancCount || 1;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 transition-all">
            {/* Top Bar Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shrink-0">
                            <Truck className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Delivered Orders Analytics
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    Live
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Select any 14-day period or custom date range to view delivery trends
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* Range Preset Switches */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        <button
                            onClick={() => setRangeMode('14d')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${rangeMode === '14d'
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            Last 14 Days
                        </button>
                        <button
                            onClick={() => setRangeMode('7d')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${rangeMode === '7d'
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            7 Days
                        </button>
                        <button
                            onClick={() => setRangeMode('30d')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${rangeMode === '30d'
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            30 Days
                        </button>
                        <button
                            onClick={() => setRangeMode('custom')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${rangeMode === 'custom'
                                    ? 'bg-teal-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <Calendar className="size-3" /> Custom 14-Day Range
                        </button>
                    </div>

                    {/* View Switcher Controls (Count vs Revenue) */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('count')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${viewMode === 'count'
                                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <PackageCheck className="size-3.5" />
                            Volume
                        </button>
                        <button
                            onClick={() => setViewMode('revenue')}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${viewMode === 'revenue'
                                    ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            Revenue (₹)
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom 14-Day Date Range Picker Bar (Shown when Custom Range is active or needed) */}
            {rangeMode === 'custom' && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-800/60 flex flex-wrap items-center justify-between gap-4"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5 shrink-0">
                            <Filter className="size-3.5" /> Select 14-Day Window:
                        </span>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">From:</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => handleSet14DayWindow(e.target.value)}
                                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">To:</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    {/* Quick 14-day Shift Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleShift14Days('prev')}
                            className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                        >
                            <ChevronLeft className="size-3.5" /> Prev 14 Days
                        </button>
                        <button
                            onClick={() => handleShift14Days('next')}
                            className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                        >
                            Next 14 Days <ChevronRight className="size-3.5" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Quick Summary Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Delivered</span>
                        <CheckCircle2 className="size-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{totalDeliveredCount.toLocaleString()}</p>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Successfully fulfilled</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-sans">Delivered Revenue</span>
                        <DollarSign className="size-4 text-teal-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">₹{totalDeliveredRevenue.toLocaleString('en-IN')}</p>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1 block">Realized sales income</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg. Order Value</span>
                        <TrendingUp className="size-4 text-sky-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">₹{avgOrderValue.toLocaleString('en-IN')}</p>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Per delivered shipment</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Fulfillment Rate</span>
                        <ShoppingBag className="size-4 text-purple-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{fulfillmentRate}%</p>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">Delivered vs total orders</span>
                </div>
            </div>

            {/* Main Interactive Graph Area */}
            <div className="relative bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Calendar className="size-3.5" /> Trend Period: {trendData[0]?.label || ''} — {trendData[trendData.length - 1]?.label || ''} ({trendData.length} Days)
                    </span>
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                        {viewMode === 'count' ? 'Orders per day' : 'Revenue per day (₹)'}
                    </span>
                </div>

                {/* SVG Line / Area Graph */}
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[650px] relative">
                        <svg
                            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                            className="w-full h-auto overflow-visible select-none"
                        >
                            <defs>
                                <linearGradient id="deliveredGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {/* Horizontal Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                const y = paddingY + ratio * chartHeight;
                                const val = Math.round(maxVal * (1 - ratio));
                                return (
                                    <g key={idx}>
                                        <line
                                            x1={paddingX}
                                            y1={y}
                                            x2={svgWidth - paddingX}
                                            y2={y}
                                            stroke="currentColor"
                                            className="text-slate-200 dark:text-slate-700/60"
                                            strokeDasharray="4 4"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={paddingX - 8}
                                            y={y + 3}
                                            textAnchor="end"
                                            className="text-[10px] fill-slate-400 font-mono"
                                        >
                                            {viewMode === 'revenue' && val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Area Gradient Fill */}
                            {areaPath && <path d={areaPath} fill="url(#deliveredGradient)" />}

                            {/* Main Smooth Curve Line */}
                            {linePath && (
                                <path
                                    d={linePath}
                                    fill="none"
                                    stroke="#0d9488"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}

                            {/* Data points & Interactive Hover Triggers */}
                            {points.map((pt, idx) => {
                                const showLabel = idx === 0 || idx === points.length - 1 || idx % labelStep === 0;
                                return (
                                    <g key={idx} className="group cursor-pointer">
                                        {/* Invisible hit area */}
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r="14"
                                            fill="transparent"
                                            onMouseEnter={() => setHoveredPoint(pt.data)}
                                            onMouseLeave={() => setHoveredPoint(null)}
                                        />
                                        {/* Outer glow ring */}
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={trendData.length > 30 ? "4" : "6"}
                                            className="fill-teal-500 opacity-20 transition-transform group-hover:scale-150"
                                        />
                                        {/* Inner solid dot */}
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={trendData.length > 30 ? "2.5" : "4"}
                                            className="fill-white stroke-teal-600 stroke-2 group-hover:fill-teal-600 transition-colors"
                                        />
                                        {/* X-axis date labels */}
                                        {showLabel && (
                                            <text
                                                x={pt.x}
                                                y={svgHeight - 8}
                                                textAnchor="middle"
                                                className="text-[10px] fill-slate-400 font-medium"
                                            >
                                                {pt.data.label}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Floating Tooltip */}
                        {hoveredPoint && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-2 right-4 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-slate-700 backdrop-blur-md pointer-events-none z-10"
                            >
                                <p className="font-bold text-teal-400">{hoveredPoint.label} ({hoveredPoint.day})</p>
                                <div className="mt-1 space-y-0.5 text-[11px]">
                                    <p><span className="text-slate-400">Delivered Orders:</span> <span className="font-bold">{hoveredPoint.count}</span></p>
                                    <p><span className="text-slate-400">Delivered Sales:</span> <span className="font-bold text-emerald-400">₹{hoveredPoint.revenue.toLocaleString('en-IN')}</span></p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Status Distribution Progress Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        All Orders Status Breakdown
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {delCount} / {totalStatusCount} Delivered
                    </span>
                </div>

                {/* Multi-segmented Progress Bar */}
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                    {delCount > 0 && (
                        <div
                            style={{ width: `${(delCount / totalStatusCount) * 100}%` }}
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            title={`Delivered: ${delCount}`}
                        />
                    )}
                    {shipCount > 0 && (
                        <div
                            style={{ width: `${(shipCount / totalStatusCount) * 100}%` }}
                            className="bg-sky-500 h-full rounded-full transition-all duration-500"
                            title={`Shipped: ${shipCount}`}
                        />
                    )}
                    {procCount > 0 && (
                        <div
                            style={{ width: `${(procCount / totalStatusCount) * 100}%` }}
                            className="bg-amber-500 h-full rounded-full transition-all duration-500"
                            title={`Processing: ${procCount}`}
                        />
                    )}
                    {pendCount > 0 && (
                        <div
                            style={{ width: `${(pendCount / totalStatusCount) * 100}%` }}
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            title={`Pending: ${pendCount}`}
                        />
                    )}
                    {cancCount > 0 && (
                        <div
                            style={{ width: `${(cancCount / totalStatusCount) * 100}%` }}
                            className="bg-rose-500 h-full rounded-full transition-all duration-500"
                            title={`Cancelled: ${cancCount}`}
                        />
                    )}
                </div>

                {/* Legend items */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-emerald-500" />
                        Delivered ({delCount})
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-sky-500" />
                        Shipped ({shipCount})
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-amber-500" />
                        Processing ({procCount})
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-blue-500" />
                        Pending ({pendCount})
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full bg-rose-500" />
                        Cancelled ({cancCount})
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveredOrdersGraph;
