import {
  ArrowLeft,
  CircleUser,
  ClipboardList,
  Flag,
  Folder,
  InfoIcon,
  MessagesSquare,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqCategories = [
    {
      category: "General",
      icon: <InfoIcon />,
      faqs: [
        {
          question: "Who can use this platform?",
          answer:
            "Access to LikhaCampus is exclusive to CCAT students. Only verified CCAT users are allowed to create accounts and participate on the platform.",
        },
        {
          question: "Is there a mobile app for the platform?",
          answer:
            "Currently, LikhaCampus is accessible only through a web browser. You can sign up or log in using any device, such as a desktop, laptop, tablet, or smartphone.",
        },
        {
          question: "Is the website free?",
          answer:
            "LikhaCampus is completely free for all students of Cavite State University CCAT Campus, and there are no plans to introduce any paid content in the future.",
        },
        {
          question: "What kind of information is shared in announcements?",
          answer:
            "The Home Page features official announcements, including important dates for campus events such as UGAMES, CAF, and other campus-wide activities. These announcements aim to keep students informed and encourage active participation. The page also highlights the Featured Artist of the Week to recognize outstanding student creators",
        },
        {
          question: "What is Featured Artist of the Week?",
          answer:
            "The Featured Artist of the Week is a recognition given to a student who demonstrates exceptional creativity, skill, or improvement in their portfolio. The selected student's work is displayed on the Home Page to celebrate their talent and inspire the community.",
        },
      ],
    },
    {
      category: "LikHow Forum",
      icon: <MessagesSquare />,
      faqs: [
        {
          question: "What is LikhowForum?",
          answer:
            "LikhowForum is a text-based discussion forum where students can ask questions, seek technical support, or share tutorials. Users can post, comment, and engage in academic or skill-based discussions.",
        },
        {
          question: "Can I post pictures in LikHowForum?",
          answer:
            "No. LikHowForum only supports text-based posts. Images and other media cannot be uploaded or shared within the forum.",
        },
        {
          question: "Can I mention someone in the comments of LikHowForum?",
          answer:
            "No, tagging or mentioning specific users in comments is not currently supported on LikhowForum. However, you can directly reply to another user's comment to continue the conversation or provide a response.",
        },
        {
          question: "Can I create my own discussion topics?",
          answer:
            "Yes, all registered users can create new forum threads and participate in existing ones.",
        },
        {
          question: "How do I engage in discussions?",
          answer:
            "You can comment, reply and upvote, Be sure to follow the community guidelines for respectful and academic conversation.",
        },
        {
          question: "What are upvotes for?",
          answer:
            "Upvotes highlight quality contributions. Posts and comments with higher upvotes are more visible to the community.",
        },
        {
          question: "Can I edit or delete my post?",
          answer:
            "Yes, you can edit or delete your own posts anytime in the menu button on the right of your post.",
        },
        {
          question: "What should I do if someone posts inappropriate content?",
          answer:
            "Click the three dots and choose the Report option beside the post or comment. The moderation team will review it and take appropriate action.",
        },
      ],
    },
    {
      category: "Projects Page",
      icon: <Folder />,
      faqs: [
        {
          question: "How do I upload a project?",
          answer:
            "Once logged in, go to your profile page and click the 'Upload Project' button. Fill in the project details including title, description, category, and upload your project files or images. Your project will be visible on your profile and in the Projects section.",
        },
        {
          question: "What is the 'Archives' section?",
          answer:
            "The Archive serves as storage for inactive or unused projects. Users can choose to unarchive or permanently delete any project from this section.",
        },
        {
          question:
            "Can a project be assigned to more than one main skill category?",
          answer:
            "No. Each project can only be tagged under one main skill. Once you select your main skill, the system will automatically display its related subcategories.",
        },
        {
          question: "Can I edit or remove a project after posting it?",
          answer:
            "Yes. You can edit or delete your projects anytime through your Archive page.",
        },
        {
          question: "What file formats do you support (images, videos, etc.)?",
          answer:
            "LikhaCampus supports image uploads in JPEG, PNG and MP4 formats.",
        },
        {
          question: "Is there a limit on file size or number of uploads?",
          answer:
            "Yes, upload limits are in place to ensure smooth performance and data storage efficiency. The exact size limit is displayed during the upload process.",
        },
      ],
    },
    {
      category: "Skills Page",
      icon: <ClipboardList />,
      faqs: [
        {
          question: "What are 21st Century skills?",
          answer:
            "21st Century Skills refer to essential abilities such as communication, collaboration, creativity, and critical thinking. These are the skills that prepare students for modern academic and professional challenges.",
        },
        {
          question: "What are the main categories of skills available?",
          answer: `**Learning Skills (How we think)**
- Critical Thinking → Problem Solving, Research, Analysis
- Creativity → Arts, Design, Innovation, Storytelling
- Collaboration → Group Projects, Teamwork, Peer Learning
- Communication → Writing, Public Speaking, Digital Communication

**Literacy Skills (How we use information)**
- Information Literacy → Research Papers, Reports, Data Handling
- Media Literacy → Journalism, Multimedia, Social Media Awareness
- Technology Literacy → Coding, App Development, Digital Tools

**Life Skills (How we live and work)**
- Flexibility → Adaptability, Multitasking, Problem Solving
- Leadership → Student Government, Project Management, Mentorship
- Initiative → Volunteering, Entrepreneurship, Independent Projects
- Productivity → Time Management, Goal Setting, Efficiency Tools
- Social Skills → Networking, Empathy, Conflict Resolution
- Passion → Personal Growth, Hobbies, Competitions, Achievements, Learning Journey`,
        },
        {
          question: "Is taking the skill assessment optional?",
          answer:
            "Yes, but it helps you to identify your strongest or most dominant skill and guides you in choosing the right category for your projects.",
        },
        {
          question: "What type of questions are included in the assessment?",
          answer:
            "The assessment uses **Likert scale questions**, where you will rate how much you agree or disagree with certain statements. This type of question helps measure your level of confidence, ability, or interest in different 21st-century skills in a simple and clear way.",
        },
        {
          question: "How long does a skill assessment take to complete?",
          answer:
            "It consists of 40 questions and usually takes only a few minutes to complete. ",
        },
        {
          question:
            "Can I retake the skill assessment if I'm not satisfied with the results?",
          answer:
            "Yes, you can retake the skill assessment as many times as you wish. Each time you complete the assessment, the most recent results will automatically replace your previous results on your profile page.",
        },
      ],
    },
    {
      category: "Account & Profile",
      icon: <CircleUser />,
      faqs: [
        {
          question: "Can I delete my account?",
          answer: "Yes. You may permanently delete your account.",
        },
        {
          question: "What should I do if I forgot my password?",
          answer:
            "Click Forgot Password on the login page and follow the steps to reset it. To change your password manually, go to your Profile Settings.",
        },
        {
          question: "Can I create more than one account?",
          answer:
            "No. Each student is allowed to maintain only one account. This policy helps ensure platform security and prevents misuse of user identities.",
        },
        {
          question: "How do you protect my data?",
          answer:
            "We value your privacy. Your personal information is kept safe and will not be shared with anyone outside the platform without your permission.",
        },
        {
          question: "Can I share my profile to my family and friends?",
          answer:
            "No. Profile sharing is limited to CCAT students only. External sharing is restricted to maintain campus privacy and data security.",
        },
      ],
    },
    {
      category: "Report",
      icon: <Flag />,
      faqs: [
        {
          question: "What can I report?",
          answer:
            "You can report posts, comments, or projects that contain offensive, inappropriate, or plagiarized content.",
        },
        {
          question:
            "What should I do if I see inappropriate or offensive content?",
          answer:
            "If you come across any content that seems inappropriate or offensive, click the three dots located on the post or project and select the Report option. When filing your report, choose the category that best describes how the content violates the community guidelines. Please note that only one category can be selected per report. Once your report is submitted, our moderation team will carefully review the content and determine the appropriate action based on our community guidelines and policies.",
        },
        {
          question: "What happens after I submit a report?",
          answer:
            "The LikhaCampus moderation team reviews all reports. Depending on the violation, the content may be removed.",
        },
        {
          question: "Can I attach screenshots or files?",
          answer:
            "No. It does not allow you to post attachments such as screenshots or other files.",
        },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto mt-4 max-w-5xl">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600">
            Find answers to common questions about LikhaCampus
          </p>
        </div>

        {/* FAQ CATEGORIES */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {/* CATEGORY HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{category.icon}</span>
                <h2 className="text-2xl font-bold text-primary">
                  {category.category}
                </h2>
              </div>

              {/* FAQ ACCORDION FOR THIS CATEGORY */}
              <div className="space-y-3">
                {category.faqs.map((faq, faqIndex) => {
                  const globalIndex = `${categoryIndex}-${faqIndex}`;
                  return (
                    <div
                      key={globalIndex}
                      className="collapse collapse-plus bg-base-100 shadow-md border border-base-300"
                    >
                      <input
                        type="radio"
                        name="faq-accordion"
                        checked={openIndex === globalIndex}
                        onChange={() => toggleFAQ(globalIndex)}
                      />
                      <div className="collapse-title text-lg font-medium">
                        {faq.question}
                      </div>
                      <div className="collapse-content">
                        <div className="text-gray-600">
                          <ReactMarkdown>{faq.answer}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* BACK TO HOME */}
        <div className="text-center mt-8">
          <button
            className="btn btn-ghost btn-sm text-[#00017a] hover:bg-[#00017a] hover:text-white"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default FAQ;
