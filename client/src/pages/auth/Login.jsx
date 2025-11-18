import axios from "axios";
import { BarChart3, Palette, Users } from "lucide-react";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import person from "../../assets/Audiobook-pana.png";
import logo from "../../assets/logo.png";
import { UserContext } from "../../context/UserContext";
import { useAlert } from "../../hooks/useAlert";

const Login = () => {
  const { showAlert } = useAlert();
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [backendError, setBackendError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setBackendError("");

    try {
      const response = await axios.post("/auth/login", data, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUser(response.data.user);

        setTimeout(() => {
          if (response.data.user.role === "admin") {
            navigate("/admin/reports");
          } else {
            navigate("/home");
          }
        }, 50);
      }
    } catch (error) {
      const errorData = error.response?.data;

      if (errorData?.emailNotVerified) {
        showAlert(errorData.message, "warning");

        navigate("/verify-email-notice", { state: { email: errorData.email } });
      } else {
        showAlert(errorData?.message || "Login failed", "error");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        {/* ONE BIG CARD WITH TWO SECTIONS */}
        <div className="card w-full max-w-2xl bg-white shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row min-h-[400px]">
            {/* LEFT SECTION - BRAND (Inside the card) - NO GRADIENT */}
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

              {/* PERSON AT BOTTOM - LARGER, NO BACKGROUND */}
              <div className="w-full flex justify-center">
                <img
                  src={person}
                  alt="Person working"
                  className="w-full max-w-sm h-auto object-contain"
                />
              </div>
            </div>

            {/* RIGHT SECTION - LOGIN FORM (Inside the card) */}
            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full">
                {/* LOGO */}
                <img
                  src={logo}
                  alt="LikhaCampus Logo"
                  className="h-24 w-auto mx-auto mb-4 object-contain"
                />
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Sign in to continue to your account
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                  {/* PASSWORD */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      className={`w-full px-3 py-1.5 rounded-md border ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-primary"
                      } focus:ring-2 focus:outline-none transition`}
                      placeholder="••••••••"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                      disabled={isSubmitting}
                    />
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* BACKEND ERROR */}
                  {backendError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {backendError}
                    </div>
                  )}

                  {/* BUTTON */}
                  <button
                    type="submit"
                    className="btn btn-primary inline-flex gap-2 text-xs w-full justify-center transition duration-200 items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>

                <p className="text-center text-gray-600 text-xs pt-2">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-primary hover:underline"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
