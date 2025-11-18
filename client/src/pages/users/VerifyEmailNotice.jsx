import axios from "axios";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAlert } from "../../hooks/useAlert.js";

const VerifyEmailNotice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const email = location.state?.email || "";
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      showAlert("Email not found. Please register again.", "error");
      return;
    }

    setIsResending(true);
    try {
      const response = await axios.post("/auth/resend-verification", {
        email,
      });
      showAlert(response.data.message, "success");
    } catch (error) {
      showAlert(
        error.response?.data?.message || "Failed to resend email",
        "error"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="card w-full max-w-md bg-white shadow-xl">
          <div className="card-body items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-10 h-10 text-primary" />
            </div>

            <h2 className="card-title text-2xl mb-2">Check Your Email</h2>

            <p className="text-gray-600 mb-4">
              We've sent a verification link to:
            </p>

            <p className="font-semibold text-primary mb-6">{email}</p>

            <p className="text-sm text-gray-600 mb-6">
              Click the link in the email to verify your account and complete
              your registration.
            </p>

            <div className="divider">Didn't receive the email?</div>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="btn btn-outline btn-primary btn-sm"
            >
              {isResending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Resending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="btn btn-ghost btn-sm mt-4"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailNotice;
