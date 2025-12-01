import axios from "axios";
import { Lock, Mail, Zap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import person from "../../assets/Audiobook-pana.png";
import logo from "../../assets/logo.png";
import { useAlert } from "../../hooks/useAlert";

const ForgotPassword = () => {
  const { showAlert } = useAlert();
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/auth/forgot-password", data);

      if (response.status === 200) {
        setSubmittedEmail(data.email);
        setEmailSent(true);
        showAlert("If that email exists, a reset link has been sent!", "info");
      }
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Failed to send reset email",
        "error"
      );
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        {/* ONE BIG CARD WITH TWO SECTIONS */}
        <div className="card w-full max-w-2xl bg-white shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row min-h-[400px]">
            {/* LEFT SECTION - BRAND */}
            <div className="md:w-1/2 p-12 flex flex-col justify-between items-center">
              <div className="max-w-md text-center">
                <h1 className="text-3xl font-bold mb-3 royal-blue">
                  LikhaCampus
                </h1>
                <p className="text-md mb-8 text-gray-700">
                  Connect. Create. Aspire. Transform.
                </p>

                {/* FEATURES */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Secure Reset
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your account is protected
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Quick Process
                      </h3>
                      <p className="text-sm text-gray-600">Reset in minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Email Verification
                      </h3>
                      <p className="text-sm text-gray-600">Check your inbox</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PERSON AT BOTTOM */}
              <div className="w-full flex justify-center">
                <img
                  src={person}
                  alt="Person working"
                  className="w-full max-w-sm h-auto object-contain"
                />
              </div>
            </div>

            {/* RIGHT SECTION - FORGOT PASSWORD FORM */}
            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                {/* LOGO */}
                <img
                  src={logo}
                  alt="LikhaCampus Logo"
                  className="h-24 w-auto mx-auto mb-4 object-contain"
                />

                {!emailSent ? (
                  <>
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Forgot Password?
                      </h2>
                      <p className="text-gray-600 mb-8">
                        No worries! Enter your email and we'll send you reset
                        instructions.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-5"
                    >
                      {/* EMAIL */}
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email address
                        </label>
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          className={`w-full px-3 py-1.5 rounded-md border ${
                            errors.email
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 focus:ring-primary"
                          } focus:ring-2 focus:outline-none transition`}
                          placeholder="you@example.com"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value:
                                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                              message: "Please enter a valid email address",
                            },
                          })}
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      {/* BUTTON */}
                      <button
                        type="submit"
                        className="btn btn-primary inline-flex gap-2 text-xs w-full justify-center transition duration-200 items-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </button>
                    </form>

                    <p className="text-center text-gray-600 text-xs pt-2">
                      Remember your password?{" "}
                      <Link
                        to="/login"
                        className="font-semibold text-primary hover:underline"
                      >
                        Back to Login
                      </Link>
                    </p>
                  </>
                ) : (
                  // SUCCESS STATE
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Check Your Email
                    </h2>
                    <p className="text-gray-600 mb-4">
                      If an account exists for{" "}
                      <span className="text-primary font-semibold mb-6">
                        {submittedEmail}
                      </span>
                      , we've sent password reset instructions.
                    </p>
                    <p className="text-primary font-semibold mb-6"></p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-700">
                        <strong>Next steps:</strong>
                      </p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1 text-left">
                        <li>• Check your inbox (and spam folder)</li>
                        <li>• Click the reset link in the email</li>
                        <li>• The link expires in 1 hour</li>
                      </ul>
                    </div>

                    <button
                      onClick={() => setEmailSent(false)}
                      className="btn btn-outline btn-primary btn-sm mb-3 w-full"
                    >
                      Send Again
                    </button>

                    <p className="text-center text-gray-600 text-xs">
                      <Link
                        to="/login"
                        className="font-semibold text-primary hover:underline"
                      >
                        Back to Login
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
