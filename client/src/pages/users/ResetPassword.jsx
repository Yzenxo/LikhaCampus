import axios from "axios";
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import person from "../../assets/Audiobook-pana.png";
import logo from "../../assets/logo.png";
import { useAlert } from "../../hooks/useAlert";

const ResetPassword = () => {
  const { showAlert } = useAlert();
  const { token } = useParams();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`/auth/verify-reset-token/${token}`);
        if (response.data.valid) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch (error) {
        setIsValidToken(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`/auth/reset-password/${token}`, {
        password: data.password,
      });

      if (response.status === 200) {
        showAlert("Password reset successful! Please login.", "success");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Failed to reset password",
        "error"
      );
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="card w-full max-w-md bg-white shadow-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid or Expired Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Link to="/forgot-password" className="btn btn-primary w-full">
              Request New Link
            </Link>
            <p className="text-center text-gray-600 text-xs mt-4">
              <Link
                to="/login"
                className="font-semibold text-primary hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                  Where Campus Becomes Canvas
                </p>

                {/* FEATURES */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Strong Security
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your password is encrypted
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Almost Done
                      </h3>
                      <p className="text-sm text-gray-600">
                        Just one more step
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Back to Creating
                      </h3>
                      <p className="text-sm text-gray-600">
                        Resume your journey
                      </p>
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

            {/* RIGHT SECTION - RESET PASSWORD FORM */}
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
                    Reset Password
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Enter your new password below
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* NEW PASSWORD */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className={`w-full px-3 py-1.5 rounded-md border ${
                          errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-primary"
                        } focus:ring-2 focus:outline-none transition pr-10`}
                        placeholder="••••••••"
                        {...register("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters",
                          },
                          pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                            message:
                              "Password must contain uppercase, lowercase, and number",
                          },
                        })}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className={`w-full px-3 py-1.5 rounded-md border ${
                          errors.confirmPassword
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-primary"
                        } focus:ring-2 focus:outline-none transition pr-10`}
                        placeholder="••••••••"
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === password || "Passwords do not match",
                        })}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD REQUIREMENTS */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-gray-700 font-semibold mb-1">
                      Password must contain:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-center gap-1">
                        <span
                          className={
                            password.length >= 8
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {password.length >= 8 ? "✓" : "○"}
                        </span>
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-1">
                        <span
                          className={
                            /[A-Z]/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {/[A-Z]/.test(password) ? "✓" : "○"}
                        </span>
                        One uppercase letter
                      </li>
                      <li className="flex items-center gap-1">
                        <span
                          className={
                            /[a-z]/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {/[a-z]/.test(password) ? "✓" : "○"}
                        </span>
                        One lowercase letter
                      </li>
                      <li className="flex items-center gap-1">
                        <span
                          className={
                            /\d/.test(password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }
                        >
                          {/\d/.test(password) ? "✓" : "○"}
                        </span>
                        One number
                      </li>
                    </ul>
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
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
