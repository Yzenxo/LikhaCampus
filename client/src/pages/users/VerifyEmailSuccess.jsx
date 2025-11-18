import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GuidelinesModal from "../../components/User/GuidelinesModal.jsx";
import { useAlert } from "../../hooks/useAlert.js";

const VerifyEmailSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error");
        setIsVerifying(false);
        showAlert("Invalid verification link", "error");
        return;
      }

      try {
        const response = await axios.get(`/auth/verify-email?token=${token}`);
        setVerificationStatus("success");
        showAlert(response.data.message, "success");

        // Show guidelines modal after 1.5 seconds
        setTimeout(() => {
          setShowGuidelines(true);
        }, 1500);
      } catch (error) {
        setVerificationStatus("error");
        showAlert(
          error.response?.data?.message || "Verification failed",
          "error"
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, showAlert]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="card w-full max-w-md bg-white shadow-xl">
          <div className="card-body items-center text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4">Verifying your email...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="card w-full max-w-md bg-white shadow-xl">
          <div className="card-body items-center text-center">
            {verificationStatus === "success" ? (
              <>
                <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="card-title text-2xl mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-6">
                  Your email has been successfully verified. Please review our
                  community guidelines before proceeding.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">❌</span>
                </div>
                <h2 className="card-title text-2xl mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  This verification link is invalid or has expired. Please
                  request a new one.
                </p>
                <button
                  onClick={() => navigate("/register")}
                  className="btn btn-primary"
                >
                  Back to Registration
                </button>
              </>
            )}
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

export default VerifyEmailSuccess;
