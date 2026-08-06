import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Layers, 
    TrendingUp, 
    DollarSign, 
    PackageCheck, 
    Calendar, 
    Clock, 
    ChevronLeft, 
    ChevronRight, 
    Filter,
    AlertTriangle,
    Boxes,
    Tag
} from 'lucide-react';

interface PurchaseTrendPoint {
    date: string;
    label: string;
    day: string;
    count: number; // units purchased/restocked
    cost: number;  // total cost valuation (₹)
}

interface ProductItem {
    _id?: string;
    name: string;
    stock: number;
    price: number;
    costPrice?: number;
    category?: any;
    createdAt?: string;
    updatedAt?: string;
}

interface PurchasesGraphProps {
    products?: ProductItem[];
}

function formatDateString(d: Date): string {
    return d.toISOString().split('T')[0];
}

const PurchasesGraph: React.FC<PurchasesGraphProps> = ({ products = [] }) => {
    const [viewMode, setViewMode] = useState<'cost' | 'count'>('cost');
    const [rangeMode, setRangeMode] = useState<'14d' | '7d' | '30d' | 'custom'>('14d');

    const todayStr = useMemo(() => formatDateString(new Date()), []);
    const fourteenAgoStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 13);
        return formatDateString(d);
    }, []);

    const [customStartDate, setCustomStartDate] = useState<string>(fourteenAgoStr);
    const [customEndDate, setCustomEndDate] = useState<string>(todayStr);
    const [hoveredPoint, setHoveredPoint] = useState<PurchaseTrendPoint | null>(null);

    // Compute Overall Metrics
    const totalInventoryUnits = useMemo(() => {
        return products.reduce((sum, p) => sum + (p.stock || 0), 0);
    }, [products]);

    const totalPurchaseValuation = useMemo(() => {
        return products.reduce((sum, p) => {
            const unitCost = p.costPrice && p.costPrice > 0 ? p.costPrice : Math.round((p.price || 0) * 0.7);
            return sum + (p.stock || 0) * unitCost;
        }, 0);
    }, [products]);

    const avgUnitCost = useMemo(() => {
        return totalInventoryUnits > 0 ? Math.round(totalPurchaseValuation / totalInventoryUnits) : 0;
    }, [totalInventoryUnits, totalPurchaseValuation]);

    const lowStockCount = useMemo(() => {
        return products.filter(p => (p.stock || 0) < 10).length;
    }, [products]);

    // Build trend dataset over time based on product stock creation/update timestamps
    const dateDataMap = useMemo(() => {
        const map: Record<string, { count: number; cost: number }> = {};
        
        products.forEach(p => {
            const itemDate = p.updatedAt || p.createdAt ? new Date(p.updatedAt || p.createdAt!) : new Date();
            const dateStr = formatDateString(itemDate);
            const unitCost = p.costPrice && p.costPrice > 0 ? p.costPrice : Math.round((p.price || 0) * 0.7);
            const itemUnits = p.stock || 0;
            const itemCost = itemUnits * unitCost;

            if (!map[dateStr]) map[dateStr] = { count: 0, cost: 0 };
            map[dateStr].count += itemUnits;
            map[dateStr].cost += itemCost;
        });

        return map;
    }, [products]);

    const trendData: PurchaseTrendPoint[] = useMemo(() => {
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

        const pointsList: PurchaseTrendPoint[] = [];
        const curr = new Date(start);
        while (curr <= end) {
            const dateStr = formatDateString(curr);
            const data = dateDataMap[dateStr] || { count: 0, cost: 0 };
            pointsList.push({
                date: dateStr,
                label: curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                day: curr.toLocaleDateString('en-US', { weekday: 'short' }),
                count: data.count,
                cost: Math.round(data.cost)
            });
            curr.setDate(curr.getDate() + 1);
        }

        return pointsList;
    }, [rangeMode, customStartDate, customEndDate, dateDataMap]);

    // Graph math
    const maxVal = Math.max(
        ...trendData.map(d => viewMode === 'cost' ? d.cost : d.count),
        viewMode === 'cost' ? 1000 : 5
    );

    const svgWidth = 750;
    const svgHeight = 220;
    const paddingX = 45;
    const paddingY = 30;
    const chartWidth = svgWidth - paddingX * 2;
    const chartHeight = svgHeight - paddingY * 2;

    const points = trendData.map((d, idx) => {
        const x = paddingX + (idx / Math.max(1, trendData.length - 1)) * chartWidth;
        const val = viewMode === 'cost' ? d.cost : d.count;
        const y = svgHeight - paddingY - (val / maxVal) * chartHeight;
        return { x, y, data: d };
    });

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

    const labelStep = trendData.length <= 7 ? 1 : trendData.length <= 14 ? 2 : trendData.length <= 30 ? 4 : 10;

    // Category Breakdown Calculation
    const categoryBreakdown = useMemo(() => {
        const map: Record<string, { name: string; count: number; cost: number }> = {};
        products.forEach(p => {
            const catName = typeof p.category === 'object' && p.category?.name ? p.category.name : (typeof p.category === 'string' ? p.category : 'General Inventory');
            const unitCost = p.costPrice && p.costPrice > 0 ? p.costPrice : Math.round((p.price || 0) * 0.7);
            const cost = (p.stock || 0) * unitCost;

            if (!map[catName]) map[catName] = { name: catName, count: 0, cost: 0 };
            map[catName].count += (p.stock || 0);
            map[catName].cost += cost;
        });

        return Object.values(map).sort((a, b) => b.cost - a.cost).slice(0, 4);
    }, [products]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 transition-all">
            {/* Top Bar Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                            <Boxes className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                Inventory & Purchase Analytics
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                    Stock In
                                </span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Track inventory stock replenishment, unit procurement cost & restocking trends
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {/* Range Preset Switches */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        <button
                            onClick={() => setRangeMode('14d')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                rangeMode === '14d'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Last 14 Days
                        </button>
                        <button
                            onClick={() => setRangeMode('7d')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                rangeMode === '7d'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            7 Days
                        </button>
                        <button
                            onClick={() => setRangeMode('30d')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                rangeMode === '30d'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            30 Days
                        </button>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('cost')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                viewMode === 'cost'
                                    ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <DollarSign className="size-3.5" /> Purchase Cost (₹)
                        </button>
                        <button
                            onClick={() => setViewMode('count')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                viewMode === 'count'
                                    ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <PackageCheck className="size-3.5" /> Units Stocked
                        </button>
                    </div>
                </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Purchase Valuation</span>
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                            <DollarSign className="size-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        ₹{totalPurchaseValuation.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 block">
                        Estimated Cost of Stock
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Stocked Inventory</span>
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                            <Boxes className="size-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {totalInventoryUnits.toLocaleString()} <span className="text-xs font-normal text-slate-500">units</span>
                    </div>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
                        Across active product catalog
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Avg Unit Purchase Cost</span>
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                            <TrendingUp className="size-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        ₹{avgUnitCost.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 block">
                        Per stocked inventory unit
                    </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Low Stock / Restock Alert</span>
                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                            <AlertTriangle className="size-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {lowStockCount} <span className="text-xs font-normal text-slate-500">items</span>
                    </div>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 block">
                        Stock below 10 units threshold
                    </span>
                </div>
            </div>

            {/* Main Interactive SVG Chart */}
            <div className="relative w-full bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 mb-6 overflow-hidden">
                <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Calendar className="size-4 text-purple-600" />
                        {viewMode === 'cost' ? 'Stock Purchase Expense Trend (₹)' : 'Inventory Restock Volume Trend (Units)'}
                    </h3>
                    {hoveredPoint && (
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                            {hoveredPoint.label}: {viewMode === 'cost' ? `₹${hoveredPoint.cost.toLocaleString('en-IN')}` : `${hoveredPoint.count} Units`}
                        </div>
                    )}
                </div>

                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                    <defs>
                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Y-Axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                        const y = paddingY + pct * chartHeight;
                        const val = Math.round(maxVal * (1 - pct));
                        return (
                            <g key={idx}>
                                <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
                                <text x={paddingX - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                                    {viewMode === 'cost' ? `₹${val}` : val}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area Fill */}
                    {areaPath && <path d={areaPath} fill="url(#purpleGradient)" />}

                    {/* Curved Trend Line */}
                    {linePath && (
                        <path d={linePath} fill="none" stroke="#9333ea" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    )}

                    {/* Interactive Data Circles & X-Labels */}
                    {points.map((p, idx) => {
                        const showLabel = idx % labelStep === 0 || idx === points.length - 1;
                        const isHovered = hoveredPoint?.date === p.data.date;
                        return (
                            <g key={p.data.date}>
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={isHovered ? 6 : 4}
                                    fill={isHovered ? '#7e22ce' : '#9333ea'}
                                    stroke="#ffffff"
                                    strokeWidth={isHovered ? 3 : 2}
                                    className="cursor-pointer transition-all duration-150"
                                    onMouseEnter={() => setHoveredPoint(p.data)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                                {showLabel && (
                                    <text x={p.x} y={svgHeight - 8} textAnchor="middle" className="text-[10px] fill-slate-400 font-semibold">
                                        {p.data.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Category Stock Purchase Breakdown */}
            {categoryBreakdown.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                        <Tag className="size-3.5 text-purple-600" />
                        Top Category Purchase Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {categoryBreakdown.map(cat => {
                            const pct = totalPurchaseValuation > 0 ? Math.round((cat.cost / totalPurchaseValuation) * 100) : 0;
                            return (
                                <div key={cat.name} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-center mb-1 text-xs">
                                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize truncate">{cat.name}</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                                        <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[11px] text-slate-500">
                                        <span>{cat.count} Units</span>
                                        <span className="font-bold">₹{cat.cost.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchasesGraph;
