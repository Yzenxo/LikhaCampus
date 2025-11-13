import { NavLink } from "react-router-dom";
import "../../styles/custom.css";

const Skills = () => {
  const skillCards = [
    {
      header: "21st century skills",
      title: "Critical Thinking",
      text: "The ability to analyze problems, assess evidence, and make logical decisions. It helps students move beyond memorization and apply reasoning to real-world issues.",
    },
    {
      header: "21st century skills",
      title: "Creativity",
      text: "Using imagination and innovation to generate new ideas, explore alternatives, and find unique solutions to challenges. It drives adaptability in a fast-changing world.",
    },
    {
      header: "21st century skills",
      title: "Collaboration",
      text: "Working effectively with others, valuing diverse perspectives, and contributing to shared goals. This skill is essential since most projects today are team-based.",
    },
    {
      header: "21st century skills",
      title: "Communication",
      text: "Clearly expressing ideas through speaking, writing, and digital tools. Strong communication ensures ideas are understood and can create meaningful impact.",
    },
    {
      header: "21st century skills",
      title: "Information Literacy",
      text: "Knowing how to find, evaluate, and use reliable information. This skill helps students avoid misinformation and make informed decisions.",
    },
    {
      header: "21st century skills",
      title: "Media Literacy",
      text: "Understanding how media messages are created, shared, and can influence people. It teaches students to think critically about what they see and consume.",
    },
    {
      header: "21st century skills",
      title: "Technology Literacy",
      text: "The ability to use digital tools effectively and responsibly. This includes not just knowing how to use technology but also understanding its benefits and risks.",
    },
    {
      header: "21st century skills",
      title: "Flexibility",
      text: "Being open to change and adapting to new environments, roles, or responsibilities. It’s important in a world where situations shift quickly.",
    },
    {
      header: "21st century skills",
      title: "Leadership",
      text: "Guiding and motivating others while making responsible decisions. Leadership also means being accountable and setting a good example for peers.",
    },
    {
      header: "21st century skills",
      title: "Initiative",
      text: "The ability to take action independently without always waiting for instructions. It reflects responsibility, proactiveness, and self-motivation.",
    },
    {
      header: "21st century skills",
      title: "Productivity",
      text: "Managing time, tasks, and resources efficiently to complete quality work. This ensures students meet deadlines and balance multiple responsibilities.",
    },
    {
      header: "21st century skills",
      title: "Social skills",
      text: "Building positive relationships, showing empathy, and working well with different people. Strong social skills foster teamwork, trust, and collaboration.",
    },
  ];

  return (
    <>
      <div className="container mx-auto mt-4 max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* INTRO CARD */}
        <div className="card shadow-md bg-base-100 mb-8 border border-gray-200 rounded-xl">
          <div className="card-body text-center px-6 py-8">
            <h1 className="font-bold text-2xl sm:text-3xl mb-4">
              What are 21st century skills?
            </h1>
            <p className="text-gray-700 leading-relaxed">
              These are the set of knowledge, abilities, and learning attitudes
              that students need to succeed in today’s fast-changing,
              technology-driven, and globally connected world. They go beyond
              traditional academics, focusing on skills that prepare learners
              for work, life, and citizenship in the 21st century.
            </p>

            {/* QUIZ BUTTON */}
            <div className="flex justify-center">
              <NavLink
                to="/skills/assessment"
                className="btn btn-outline-primary btn-md mt-3 px-4"
              >
                Take the quiz
              </NavLink>
            </div>
          </div>
        </div>

        {/* SKILL CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {skillCards.map((card, index) => (
            <div
              key={index}
              className="card h-full bg-white border border-gray-200 shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="card-header font-semibold bg-royal-blue text-white px-4 py-2 rounded-t-md flex items-center justify-between">
                {card.header}
              </div>
              <div className="card-body px-4 py-6 space-y-3">
                <h3 className="card-title text-lg font-bold text-primary">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Skills;
