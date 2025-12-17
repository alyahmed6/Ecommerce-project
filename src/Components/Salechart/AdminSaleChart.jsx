import React from "react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const weeklySales = [
  { name: "Mon", sales: 240, orders: 34 },
  { name: "Tue", sales: 300, orders: 45 },
  { name: "Wed", sales: 200, orders: 28 },
  { name: "Thu", sales: 278, orders: 36 },
  { name: "Fri", sales: 189, orders: 22 },
  { name: "Sat", sales: 239, orders: 30 },
  { name: "Sun", sales: 349, orders: 50 },
];

const monthlyRevenue = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 3500 },
  { name: "May", revenue: 4200 },
  { name: "Jun", revenue: 4800 },
  { name: "Jul", revenue: 5200 },
  { name: "Aug", revenue: 4600 },
];

const categoryDistribution = [
  { name: "Mens", value: 40 },
  { name: "Womens", value: 30 },
  { name: "New Arrivals", value: 20 },
  { name: "On Sale", value: 10 },
];

const COLORS = ["#2563EB", "#34D399", "#FBBF24", "#F87171"];

const Sparkline = ({ data, dataKey, color }) => (
  <ResponsiveContainer width="100%" height={36}>
    <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="gradSpark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area type="monotone" dataKey={dataKey} stroke={color} fill="url(#gradSpark)" strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
);

const AdminSaleChart = () => {
  const totalWeekly = weeklySales.reduce((s, d) => s + d.sales, 0);
  const avgDaily = Math.round(totalWeekly / weeklySales.length);
  const totalMonthly = monthlyRevenue.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gradient">
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div className="bg-gradient from-white to-sky-50 rounded-xl shadow p-4">
            <div className="text-sm text-zinc-500">Weekly Sales</div>
            <div className="text-2xl font-bold">{totalWeekly}</div>
            <div className="text-xs text-zinc-400 mb-2">Avg / day: {avgDaily}</div>
            <Sparkline data={weeklySales} dataKey="sales" color="#2563EB" />
          </div>

          <div className="bg-gradient from-white to-emerald-50 rounded-xl shadow p-4">
            <div className="text-sm text-zinc-500">Monthly Revenue</div>
            <div className="text-2xl font-bold">${totalMonthly.toLocaleString()}</div>
            <div className="text-xs text-zinc-400 mb-2">6-month trend</div>
            <Sparkline data={monthlyRevenue} dataKey="revenue" color="#10B981" />
          </div>

          <div className="bg-gradient from-white to-amber-50 rounded-xl shadow p-4">
            <div className="text-sm text-zinc-500">Top Category</div>
            <div className="text-2xl font-bold">Mens</div>
            <div className="text-xs text-zinc-400 mb-2">40% of sales</div>
            <Sparkline data={categoryDistribution} dataKey="value" color="#F59E0B" />
          </div>
        </div>

        {/* Large area chart */}
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:w-2/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <div className="text-sm text-zinc-500">Last 8 months</div>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Weekly Overview</h4>
            <div className="text-sm text-zinc-500">Sales vs Orders</div>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklySales} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" barSize={18} fill="#2563EB" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white h-80 rounded-2xl shadow-lg p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Category Distribution</h4>
            <div className="text-sm text-zinc-500">Share by category</div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="w-full lg:w-1/2 h-48">
              <ResponsiveContainer width="100%" height="120%">
                <PieChart>
                  <Pie data={categoryDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={6} label>
                    {categoryDistribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1">
              <ul className="space-y-3">
                {categoryDistribution.map((c, i) => (
                  <li key={c.name} className="flex items-center gap-3">
                    <span style={{ background: COLORS[i] }} className="w-4 h-4 rounded-full inline-block" />
                    <div className="flex-1">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-zinc-500">{c.value}%</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSaleChart;
