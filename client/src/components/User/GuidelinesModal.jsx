import axios from "axios";
import { useEffect, useState } from "react";

const GuidelinesModal = ({ isOpen, onClose, onAccept }) => {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGuidelines();
    }
  }, [isOpen]);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/guidelines/active`);
      setGuidelines(response.data.guidelines || []);
    } catch (error) {
      console.error("Error fetching guidelines:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (accepted) {
      onAccept();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box max-w-3xl max-h-[80vh] overflow-y-auto">
          <h2 className="font-bold text-2xl mb-4 text-center">
            Community Guidelines
          </h2>
          <h3 className="mb-4 text-center">
            To keep LikhaCampus a safe and respectful environment for everyone,
            please follow these basic rules when using our website:
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : guidelines.length === 0 ? (
            <div className="alert alert-info">
              <span>No guidelines available at this time.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {guidelines.map((guideline, index) => (
                <div key={guideline._id} className="card bg-base-200 shadow-sm">
                  <div className="card-body p-4">
                    <h4 className="card-title text-lg">
                      {index + 1}. {guideline.title}
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                      {guideline.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="divider"></div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span className="label-text">
                I have read and agree to follow the Community Guidelines
              </span>
            </label>
          </div>

          <div className="modal-action">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              className={`btn btn-primary ${!accepted ? "btn-disabled" : ""}`}
              onClick={handleAccept}
              disabled={!accepted}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuidelinesModal;
