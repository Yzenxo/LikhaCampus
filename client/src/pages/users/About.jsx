import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-left">
          <button
            className="btn btn-ghost btn-sm text-[#00017a] hover:bg-[#00017a] hover:text-white"
            onClick={() => navigate("/home")}
          >
            ← Back to Home
          </button>
        </div>

        <h1 className="text-4xl font-bold text-primary mb-8 mt-5">
          About LikhaCampus
        </h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            LikhaCampus is a digital platform made for CCAT students to showcase
            their talents, skills, and experiences. It is designed to be
            inclusive, welcoming students from all programs such as hospitality
            management, education, the arts, and other non-technical fields, not
            just those in information technology.
          </p>

          <p>
            The word "Likha," which means "to create" in Filipino, reflects the
            purpose of the platform, to inspire creativity, innovation, and
            learning within the CCAT community. Through LikhaCampus, students
            can create their own digital portfolios where they can present their
            creative works, academic projects, and personal achievements in a
            simple and organized way. These portfolios give them the opportunity
            to share their work with classmates, mentors, and potential
            collaborators, helping them gain recognition both inside and outside
            the school.
          </p>

          <p>
            With the support of the Central Student Government, LikhaCampus also
            helps improve campus activities by making the selection process for
            events, competitions, and projects more efficient and transparent.
            By using digital portfolios instead of traditional tryouts or
            referrals, it ensures fairness and gives every student an equal
            chance to be noticed based on their work and potential.
          </p>

          <p>
            LikhaCampus aims to empower students by giving them a space to
            express who they are and connect with meaningful opportunities that
            match their goals and passions. Its mission is to promote
            inclusivity, transparency, and equal recognition while bridging the
            gap between academic life and real-world experiences. With this
            mission as its guide, LikhaCampus envisions becoming a recognized
            platform of creativity and excellence within the CCAT community. One
            that encourages innovation, supports diverse talents, and builds a
            culture where every student's potential is valued and celebrated.
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
