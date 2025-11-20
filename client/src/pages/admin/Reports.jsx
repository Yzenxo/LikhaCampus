import axios from "axios";
import { BarChart2 } from "lucide-react";
import { useEffect, useState } from "react";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/stats", {
        withCredentials: true,
      });

      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="alert alert-error">
        <span>Failed to load statistics</span>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-3 space-y-10">
        <div className="mb-6">
          <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
            <BarChart2 size={20} /> Reports
          </h2>
          <p className="text-gray-600">
            View platform statistics and activity insights
          </p>
        </div>
        {/* STATS */}
        <div className="stats bg-white shadow w-full">
          <div className="stat">
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">{stats.totalUsers}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Projects</div>
            <div className="stat-value text-secondary">
              {stats.totalProjects}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Forum Posts</div>
            <div className="stat-value">{stats.totalPosts}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
