import axios from "axios";
import { BarChart3, FileText, Palette, Users } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import person from "../../assets/Learning-pana.png";
import logo from "../../assets/logo.png";
import GuidelinesModal from "../../components/User/GuidelinesModal.jsx";
import TermsNConditionsModal from "../../components/User/TermsNConditionsModal";
import { useAlert } from "../../hooks/useAlert";

const Register = () => {
  const modalRef = useRef();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [agreed, setAgreed] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [registrationForm, setRegistrationForm] = useState(null);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      studentNumber: "",
      yearLevel: "",
      program: "",
      password: "",
    },
  });

  const handleAcceptTerms = () => {
    setAgreed(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setFormError("Only PDF files are allowed");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setFormError("File size must be less than 10MB");
        return;
      }

      setRegistrationForm(selectedFile);
      setFileName(selectedFile.name);
      setFormError("");
    }
  };

  const removeFile = () => {
    setRegistrationForm(null);
    setFileName(null);
    document.getElementById("registrationForm").value = "";
  };

  const openFileDialog = () => {
    document.getElementById("registrationForm").click();
  };

  const onSubmit = async (data) => {
    if (!agreed) {
      showAlert(
        "Please read and accept the Terms and Conditions first.",
        "warning"
      );
      return;
    }

    if (!registrationForm) {
      setFormError("Registration form (PDF) is required");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("studentNumber", String(data.studentNumber));
    formData.append("yearLevel", data.yearLevel);
    formData.append("program", data.program);
    formData.append("password", data.password);
    formData.append("registrationForm", registrationForm);

    try {
      const response = await axios.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      if (response.status === 201) {
        showAlert(response.data.message, "success");

        navigate("/verify-email-notice", { state: { email: data.email } });
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data);
      showAlert(
        error.response?.data?.message || "Registration failed",
        "error"
      );
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="card w-full max-w-2xl bg-white shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row min-h-[600px]">
            {/* LEFT SECTION */}
            <div className="md:w-1/2 p-12 flex flex-col justify-between items-center">
              <div className="max-w-md text-center">
                <h1 className="text-3xl font-bold mb-3 royal-blue">
                  LikhaCampus
                </h1>
                <p className="text-md mb-8 text-gray-700">
                  Connect. Create. Aspire. Transform.
                </p>

                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Palette className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Showcase Your Work
                      </h3>
                      <p className="text-sm text-gray-600">
                        Share creative projects
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Build Your Portfolio
                      </h3>
                      <p className="text-sm text-gray-600">
                        Stand out to employers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Connect & Collaborate
                      </h3>
                      <p className="text-sm text-gray-600">
                        Join the community
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-center">
                <img
                  src={person}
                  alt="Person working"
                  className="w-full max-w-sm h-auto object-contain"
                />
              </div>
            </div>

            {/* RIGHT SECTION - FORM */}
            <div className="md:w-1/2 p-10 flex flex-col justify-start overflow-y-auto max-h-[600px]">
              <div className="max-w-md mx-auto w-full">
                <img
                  src={logo}
                  alt="LikhaCampus Logo"
                  className="h-24 w-auto mx-auto mb-6 object-contain"
                />

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Join LikhaCampus
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                  Create your account to start sharing
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  {/* FIRST NAME & LAST NAME */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label
                        htmlFor="firstName"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:ring-2 focus:ring-primary focus:outline-none`}
                        placeholder="Juan"
                        {...register("firstName", { required: "Required" })}
                        disabled={isSubmitting}
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="flex-1">
                      <label
                        htmlFor="lastName"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        } focus:ring-2 focus:ring-primary focus:outline-none`}
                        placeholder="Dela Cruz"
                        {...register("lastName", { required: "Required" })}
                        disabled={isSubmitting}
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* USERNAME */}
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                        errors.username ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-primary focus:outline-none`}
                      placeholder="juandelacruz"
                      {...register("username", {
                        required: "Required",
                        minLength: { value: 3, message: "Min 3 chars" },
                      })}
                      disabled={isSubmitting}
                    />
                    {errors.username && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-primary focus:outline-none`}
                      placeholder="juan@example.com"
                      {...register("email", {
                        required: "Required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email",
                        },
                      })}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* STUDENT NUMBER & YEAR LEVEL */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label
                        htmlFor="studentNumber"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Student #
                      </label>
                      <input
                        type="text"
                        id="studentNumber"
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                          errors.studentNumber
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:ring-2 focus:ring-primary focus:outline-none`}
                        placeholder="123456789"
                        {...register("studentNumber", {
                          required: "Required",
                          pattern: {
                            value: /^\d{9}$/,
                            message: "9 digits",
                          },
                        })}
                        disabled={isSubmitting}
                      />
                      {errors.studentNumber && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.studentNumber.message}
                        </p>
                      )}
                    </div>

                    {/* YEAR LEVEL */}
                    <div className="flex-1">
                      <label
                        htmlFor="yearLevel"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Year
                      </label>
                      <select
                        id="yearLevel"
                        className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                          errors.yearLevel
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:ring-2 focus:ring-primary focus:outline-none`}
                        {...register("yearLevel", { required: "Required" })}
                        disabled={isSubmitting}
                      >
                        <option value="">Select</option>
                        <option value="1st Year">1st</option>
                        <option value="2nd Year">2nd</option>
                        <option value="3rd Year">3rd</option>
                        <option value="4th Year">4th</option>
                      </select>
                      {errors.yearLevel && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.yearLevel.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* PROGRAM/ COURSE */}
                  <div className="flex-1">
                    <label
                      htmlFor="program"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Program
                    </label>
                    <select
                      id="program"
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                        errors.yearLevel ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-primary focus:outline-none`}
                      {...register("program", { required: "Required" })}
                      disabled={isSubmitting}
                    >
                      <option value="">Select</option>
                      <option value="Bachelor of Secondary Education">
                        Bachelor of Secondary Education
                      </option>
                      <option value="Bachelor of Technical Vocational Teacher Education">
                        Bachelor of Technical Vocational Teacher Education
                      </option>
                      <option value="BS Business Management">
                        BS Business Management
                      </option>
                      <option value="BS Computer Engineering">
                        BS Computer Engineering
                      </option>
                      <option value="BS Computer Science">
                        BS Computer Science
                      </option>
                      <option value="BS Electrical Engineering">
                        BS Electrical Engineering
                      </option>
                      <option value="BS Hospitality Management">
                        BS Hospitality Management
                      </option>
                      <option value="BS Industrial Technology">
                        BS Industrial Technology
                      </option>
                      <option value="BS Information Technology">
                        BS Information Technology
                      </option>
                    </select>
                    {errors.program && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.program.message}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } focus:ring-2 focus:ring-primary focus:outline-none`}
                      placeholder="••••••••"
                      {...register("password", {
                        required: "Required",
                        minLength: { value: 8, message: "Min 8 chars" },
                      })}
                      disabled={isSubmitting}
                    />
                    {errors.password && (
                      <p className="text-red-600 text-xs mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* REGISTRATION FORM PDF UPLOADER */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Registration Form (PDF) *
                    </label>
                    <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg">
                      <div className="w-10 h-10 border border-gray-300 rounded-md overflow-hidden flex items-center justify-center">
                        <FileText className="opacity-60" size={18} />
                      </div>
                      <button
                        onClick={openFileDialog}
                        className="btn btn-xs btn-outline"
                        type="button"
                        disabled={isSubmitting}
                      >
                        {fileName ? "Change" : "Upload PDF"}
                      </button>
                      <input
                        id="registrationForm"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                      {fileName && (
                        <div className="flex-1 flex items-center gap-1">
                          <p className="text-xs text-gray-600 truncate">
                            {fileName}
                          </p>
                          <button
                            onClick={removeFile}
                            className="text-xs text-red-600 hover:underline"
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    {formError && (
                      <p className="text-red-600 text-xs mt-1">{formError}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Upload your current semester registration form from the
                      student portal
                    </p>
                  </div>

                  {/* TERMS */}
                  <div className="text-xs text-gray-600 py-2">
                    Please read the{" "}
                    <span
                      className="text-primary font-semibold cursor-pointer hover:underline"
                      onClick={() => modalRef.current.open()}
                    >
                      Terms & Conditions
                    </span>{" "}
                    before continuing
                  </div>

                  <TermsNConditionsModal
                    ref={modalRef}
                    onAccept={handleAcceptTerms}
                  />

                  {/* REGISTER BUTTON */}
                  <button
                    type="submit"
                    disabled={!agreed || isSubmitting}
                    className="btn btn-primary w-full text-xs transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Registering...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <p className="text-center text-gray-600 text-xs pt-2">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-primary hover:underline"
                    >
                      Login here
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GuidelinesModal
        isOpen={showGuidelines}
        onClose={() => {}}
        onAccept={() => {
          setShowGuidelines(false);
          navigate("/login");
        }}
      />
    </>
  );
};

export default Register;
