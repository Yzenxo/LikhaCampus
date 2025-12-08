import axios from "axios";
import {
  BarChart2,
  Code,
  FolderKanban,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/report-stats", {
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
        <span className="loading loading-spinner loading-lg">
          Loading statistics...
        </span>
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
      <div className="container mx-auto p-3 space-y-5">
        <div className="mb-6">
          <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
            <BarChart2 size={20} /> Reports
          </h2>
          <p className="text-gray-600">
            View platform statistics and activity insights
          </p>
        </div>

        {/* MAIN STATS */}
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

        {/* FORUM ENGAGEMENT STATS */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" />
            Forum Engagement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Forum Posts This Month</div>
              <div className="stat-value text-blue-600">
                {stats.postsThisMonth || 0}
              </div>
              <div className="stat-desc">
                {stats.postsLastMonth !== undefined &&
                  stats.postsLastMonth !== null && (
                    <span
                      className={
                        stats.postsThisMonth > stats.postsLastMonth
                          ? "text-success"
                          : "text-error"
                      }
                    >
                      {stats.postsThisMonth > stats.postsLastMonth
                        ? "↗︎"
                        : "↘︎"}{" "}
                      {stats.postsLastMonth} last month
                    </span>
                  )}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Avg Posts Per Active User</div>
              <div className="stat-value text-purple-600">
                {stats.avgPostsPerActiveUser
                  ? stats.avgPostsPerActiveUser.toFixed(1)
                  : "0"}
              </div>
              <div className="stat-desc">
                Based on users with at least 1 post
              </div>
            </div>
          </div>
        </div>

        {/* PROJECT ENGAGEMENT STATS */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FolderKanban size={20} className="text-purple-600" />
            Project Engagement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Projects This Month</div>
              <div className="stat-value text-purple-600">
                {stats.projectsThisMonth || 0}
              </div>
              <div className="stat-desc">
                {stats.projectsLastMonth !== undefined &&
                  stats.projectsLastMonth !== null && (
                    <span
                      className={
                        stats.projectsThisMonth > stats.projectsLastMonth
                          ? "text-success"
                          : "text-error"
                      }
                    >
                      {stats.projectsThisMonth > stats.projectsLastMonth
                        ? "↗︎"
                        : "↘︎"}{" "}
                      {stats.projectsLastMonth} last month
                    </span>
                  )}
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Total Collaborations</div>
              <div className="stat-value text-indigo-600">
                {stats.totalCollaborations || 0}
              </div>
              <div className="stat-desc">
                Active team members across projects
              </div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Avg Team Size</div>
              <div className="stat-value text-pink-600">
                {stats.averageTeamSize ? stats.averageTeamSize.toFixed(1) : "0"}
              </div>
              <div className="stat-desc">Members per project</div>
            </div>
          </div>
        </div>

        {/* MONTHLY FORUM ACTIVITY TREND - LINE CHART */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-600" />
            Forum Posts Per Month
          </h3>
          {stats.monthlyPosts && stats.monthlyPosts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyPosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="Posts"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No monthly data available</p>
          )}
        </div>

        {/* PROJECTS CREATED PER MONTH - LINE CHART */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            Projects Created Per Month
          </h3>
          {stats.monthlyProjects && stats.monthlyProjects.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyProjects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#9333ea"
                  strokeWidth={2}
                  name="Projects"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No monthly data available</p>
          )}
        </div>

        {/* MOST POPULAR PROJECT SKILLS - BAR CHART */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Code size={20} className="text-green-600" />
            Most Popular Project Skills
          </h3>
          {stats.popularSkills && stats.popularSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={stats.popularSkills}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#16a34a" name="Projects" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No skill data available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Reports;
