import axios from "axios";
import { FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const CategoryRequestPanel = () => {
  const { showAlert } = useAlert();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get("/category-request");
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error fetching category requests:", error);
      setRequests([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleApproveClick = (request) => {
    setSelectedRequest(request);
    setModal("approve");
  };

  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setModal("reject");
  };

  const confirmApprove = async () => {
    if (!selectedRequest || isProcessing) return;

    setIsProcessing(true);
    setModal(null);

    try {
      await axios.put(`/category-request/${selectedRequest._id}/approve`);
      await fetchRequests();
      showAlert("Category request approved successfully!", "success");
    } catch (error) {
      console.error("Error approving request:", error);
      showAlert(
        `Failed to approve request: ${error.response?.data?.error || error.message}`,
        "error"
      );
    } finally {
      setIsProcessing(false);
      setModal(null);
      setSelectedRequest(null);
    }
  };

  const confirmReject = async () => {
    if (!selectedRequest || isProcessing) return;
    setIsProcessing(true);

    try {
      await axios.put(`/category-request/${selectedRequest._id}/reject`);
      await fetchRequests();
      showAlert("Category request rejected successfully!", "success");
    } catch (error) {
      console.error("Error rejecting request:", error);
      showAlert(
        `Failed to reject request: ${error.response?.data?.error || error.message}`,
        "error"
      );
    } finally {
      setIsProcessing(false);
      setModal(null);
      setSelectedRequest(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "badge badge-warning",
      approved: "badge badge-success",
      rejected: "badge badge-error",
    };
    return badges[status] || "badge";
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading category requests...</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <>
      <div className="container mx-auto p-3 space-y-6 sm:space-y-10">
        {/* HEADER - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-0">
          <h2 className="text-xl sm:text-2xl royal-blue font-bold flex items-center gap-2">
            <FolderPlus size={20} className="sm:w-6 sm:h-6" /> Category Requests
          </h2>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Review and approve category requests from users
        </p>

        {/* PENDING REQUESTS SECTION */}
        <div>
          {/* DESKTOP TABLE */}
          <div className="hidden sm:block card bg-base-100 shadow-md overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Skill</th>
                  <th>Requested By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      No pending requests at the moment
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <div className="font-medium">{req.categoryName}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary badge-sm">
                          {req.skillName}
                        </span>
                      </td>
                      <td>
                        {req.requestedBy?.firstName} {req.requestedBy?.lastName}
                      </td>
                      <td className="whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex gap-2 whitespace-nowrap">
                          <button
                            className="btn btn-xs btn-primary"
                            onClick={() => handleApproveClick(req)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-xs btn-error"
                            onClick={() => handleRejectClick(req)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="sm:hidden space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="card bg-base-100 shadow-md">
                <div className="card-body text-center py-12 text-gray-500">
                  No pending requests at the moment.
                </div>
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req._id} className="card bg-base-100 shadow-md">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="card-title text-base">
                        {req.categoryName}
                      </h3>
                      <span className="badge badge-primary badge-sm">
                        {req.skillName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Requested by: {req.requestedBy?.firstName}{" "}
                      {req.requestedBy?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                    <div className="card-actions justify-end mt-3">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleApproveClick(req)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleRejectClick(req)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PROCESSED REQUESTS SECTION */}
        {processedRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Request History</h3>

            {/* DESKTOP TABLE */}
            <div className="hidden sm:block card bg-base-100 shadow-md overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Skill</th>
                    <th>Requested By</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {processedRequests.map((req) => (
                    <tr key={req._id}>
                      <td>
                        <div className="font-medium">{req.categoryName}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary badge-sm">
                          {req.skillName}
                        </span>
                      </td>
                      <td>
                        {req.requestedBy?.firstName} {req.requestedBy?.lastName}
                      </td>
                      <td>
                        <span className={getStatusBadge(req.status)}>
                          {req.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="sm:hidden space-y-4">
              {processedRequests.map((req) => (
                <div key={req._id} className="card bg-base-100 shadow-md">
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="card-title text-base">
                        {req.categoryName}
                      </h3>
                      <span className={getStatusBadge(req.status)}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="badge badge-primary badge-sm mr-2">
                        {req.skillName}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Requested by: {req.requestedBy?.firstName}{" "}
                      {req.requestedBy?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPROVE CONFIRMATION MODAL */}
        {modal === "approve" && (
          <div className="modal modal-open">
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-primary">
                Approve Category Request
              </h3>
              <p className="py-2 wrap-break-word">
                Are you sure you want to approve the category "
                <span className="font-semibold">
                  {selectedRequest?.categoryName}
                </span>
                " for skill "
                <span className="font-semibold">
                  {selectedRequest?.skillName}
                </span>
                "?
              </p>
              <p className="text-sm text-gray-600">
                This will add it to the dropdown and make it available for all
                users.
              </p>
              <div className="modal-action">
                <button className="btn" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={confirmApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Approving..." : "Approve"}
                </button>
              </div>
            </div>
            <div
              className="modal-backdrop"
              onClick={() => setModal(null)}
            ></div>
          </div>
        )}

        {/* REJECT CONFIRMATION MODAL */}
        {modal === "reject" && (
          <div className="modal modal-open">
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-error">Reject Category Request</h3>
              <p className="py-2 wrap-break-word">
                Are you sure you want to reject the category "
                <span className="font-semibold">
                  {selectedRequest?.categoryName}
                </span>
                " for skill "
                <span className="font-semibold">
                  {selectedRequest?.skillName}
                </span>
                "?
              </p>
              <p className="text-sm text-gray-600">
                The user will not be notified of this rejection.
              </p>
              <div className="modal-action">
                <button className="btn" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={confirmReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
            <div
              className="modal-backdrop"
              onClick={() => setModal(null)}
            ></div>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryRequestPanel;
