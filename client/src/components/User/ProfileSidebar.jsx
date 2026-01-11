import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ProfileSidebar = ({
  assessment,
  projects = [],
  forumPostCount = 0,
  user,
}) => {
  return (
    <>
      <div className="space-y-4">
        {/* SKILLS ASSESSMENT CARD */}
        {assessment ? (
          <div className="card shadow-md bg-base-100 p-4">
            <h3 className="font-bold text-lg mb-3">Skills Assessment</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: "Learning", score: assessment.scores.learningSkills },
                  { name: "Literacy", score: assessment.scores.literacySkills },
                  { name: "Life", score: assessment.scores.lifeSkills },
                  { name: "Tech", score: assessment.scores.technologySkills },
                ]}
                margin={{ top: 10, right: 10, bottom: 10, left: -20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="score" fill="#570df8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <p className="font-bold text-lg">
                Overall:{" "}
                <span className="text-primary">
                  {assessment.overallScore}/5
                </span>
              </p>
            </div>
          </div>
        ) : null}

        {/* STUDENT INFORMATION CARD */}
        <div className="card shadow-md bg-base-100 p-4">
          <h3 className="font-bold text-lg mb-3">Information</h3>
          <div className="space-y-2 text-sm">
            {user?.program && (
              <p className="flex justify-between">
                <span className="font-semibold">Student Program:</span>
                <span
                  className="badge badge-outline truncate max-w-[200px]"
                  title={user.program}
                >
                  {user.program}
                </span>
              </p>
            )}
            {user?.yearLevel && (
              <p className="flex justify-between">
                <span className="font-semibold">Year Level:</span>
                <span className="badge badge-outline">{user.yearLevel}</span>
              </p>
            )}
          </div>
          {user?.skills && user.skills.length > 0 && (
            <>
              <div className="divider my-2"></div>
              <h4 className="font-semibold text-sm mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span key={index} className="badge badge-outline">
                    {skill}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* STATS CARD */}
        <div className="card shadow-md bg-base-100 p-4">
          <h3 className="font-bold text-lg mb-3">Stats</h3>
          <div className="space-y-2 text-sm">
            <p className="flex justify-between">
              <span className="font-semibold">Projects:</span>
              <span className="badge bg-royal-blue text-white">
                {projects?.length || 0}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="font-semibold">Forum Posts:</span>
              <span className="badge bg-yellow">{forumPostCount || 0}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileSidebar;
