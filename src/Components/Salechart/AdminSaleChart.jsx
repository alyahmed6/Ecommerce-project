import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const weeklySales = [
  { name: "Mon", sales: 240 },
  { name: "Tue", sales: 300 },
  { name: "Wed", sales: 200 },
  { name: "Thu", sales: 278 },
  { name: "Fri", sales: 189 },
  { name: "Sat", sales: 239 },
  { name: "Sun", sales: 349 },
];

const monthlyRevenue = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 3500 },
  { name: "May", revenue: 4200 },
  { name: "Jun", revenue: 4800 },
];

const categoryDistribution = [
  { name: "Mens", value: 40 },
  { name: "Womens", value: 30 },
  { name: "New Arrivals", value: 20 },
  { name: "On Sale", value: 10 },
];

const COLORS = ["#2563EB", "#34D399", "#FBBF24", "#F87171"];

const AdminDashboardCharts = () => {
  return (
    <div className="flex flex-col h-full gap-6 p-4 md:p-8 ">
      <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-h-[300px]">
        <h2 className="text-xl font-semibold mb-4">Weekly Sales</h2>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={weeklySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#2563EB" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-h-[300px]">
        <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#34D399" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-6 flex-1 min-h-[300px]">
        <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={categoryDistribution}
              dataKey="value"
              nameKey="name"
              outerRadius="80%"
              label
            >
              {categoryDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminDashboardCharts;
