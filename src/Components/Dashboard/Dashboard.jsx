import AdminDashboardCharts from "../Salechart/AdminSaleChart";


const Dashboard = ({ statsData, categories }) => {
  return (
    <div className="flex-1 flex flex-col h-full gap-6 mt-16 md:mt-0 p-4 md:p-8">
      <AdminDashboardCharts data={statsData} />
    </div>
  );
};

export default Dashboard;
