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
            <h3 className="font-bold text-lg mb-3">Skills</h3>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Learning:</span>
                <span className="font-bold text-primary">
                  {assessment.scores.learningSkills}/5
                </span>
              </p>
              <p className="flex justify-between">
                <span>Literacy:</span>
                <span className="font-bold text-primary">
                  {assessment.scores.literacySkills}/5
                </span>
              </p>
              <p className="flex justify-between">
                <span>Life:</span>
                <span className="font-bold text-primary">
                  {assessment.scores.lifeSkills}/5
                </span>
              </p>
              <p className="flex justify-between">
                <span>Tech:</span>
                <span className="font-bold text-primary">
                  {assessment.scores.technologySkills}/5
                </span>
              </p>
              <div className="divider my-1"></div>
              <p className="flex justify-between font-bold text-lg">
                <span>Overall:</span>
                <span className="text-primary">
                  {assessment.overallScore}/5
                </span>
              </p>
            </div>
          </div>
        ) : null}

        {/* STUEDNT INFORMATION CARD */}
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
