import axios from "axios";
import { BookAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const CommunityGuidelines = () => {
  const { showAlert } = useAlert();
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/guidelines", {
        withCredentials: true,
      });
      setGuidelines(response.data.guidelines || []);
    } catch (error) {
      console.error("Error fetching guidelines:", error);
      showAlert("Failed to fetch guidelines", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      showAlert("Title and content are required", "warning");
      return;
    }

    const isDuplicateOrder = guidelines.some(
      (g) => g.order === parseInt(formData.order)
    );

    if (isDuplicateOrder) {
      showAlert(
        `Order ${formData.order} is already used. Please choose a different order number.`,
        "warning"
      );
      return;
    }

    try {
      const response = await axios.post("/guidelines", formData, {
        withCredentials: true,
      });

      showAlert("Guideline created successfully", "success");
      setGuidelines((prev) => [...prev, response.data.guideline]);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error creating guideline:", error);
      showAlert("Failed to create guideline", "error");
    }
  };

  const handleUpdate = async (id) => {
    const currentGuideline = guidelines.find((g) => g._id === id);
    const orderChanged = currentGuideline.order !== parseInt(formData.order);

    if (orderChanged) {
      const isDuplicateOrder = guidelines.some(
        (g) => g._id !== id && g.order === parseInt(formData.order)
      );

      if (isDuplicateOrder) {
        showAlert(
          `Order ${formData.order} is already used by another guideline. Please choose a different order number.`,
          "warning"
        );
        return;
      }
    }

    try {
      const response = await axios.put(`/guidelines/${id}`, formData, {
        withCredentials: true,
      });

      showAlert("Guideline updated successfully", "success");
      setGuidelines((prev) =>
        prev.map((g) => (g._id === id ? response.data.guideline : g))
      );
      setEditingId(null);
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error updating guideline:", error);
      showAlert("Failed to update guideline", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      setIsDeleting(true);
      await axios.delete(`/guidelines/${deleteModal}`, {
        withCredentials: true,
      });

      showAlert("Guideline deleted successfully", "success");
      setGuidelines((prev) => prev.filter((g) => g._id !== deleteModal));
      setDeleteModal(null);
    } catch (error) {
      console.error("Error deleting guideline:", error);
      showAlert("Failed to delete guideline", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (guideline) => {
    setEditingId(guideline._id);
    setFormData({
      title: guideline.title,
      content: guideline.content,
      order: guideline.order,
      isActive: guideline.isActive,
    });
    setShowModal(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      order: 0,
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg">
          Loading guidelines...
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-3 space-y-10">
        <div className="flex justify-between items-center mb-0">
          <h2 className="text-2xl royal-blue font-bold flex items-center gap-2">
            <BookAlert size={24} /> Community Guidelines
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowModal(true);
              setEditingId(null);
              resetForm();
            }}
          >
            + Add New Guideline
          </button>
        </div>
        <p className="text-gray-600">Manage and update the platform’s rules</p>

        {/* CREATE/EDIT MODAL */}
        {showModal && (
          <dialog open className="modal">
            <div className="modal-box space-y-4">
              <h3 className="font-bold text-lg">
                {editingId ? "Edit Guideline" : "New Guideline"}
              </h3>

              <form
                onSubmit={
                  editingId
                    ? (e) => {
                        e.preventDefault();
                        handleUpdate(editingId);
                      }
                    : handleCreate
                }
              >
                {/* TITLE */}
                <div className="form-control mb-3">
                  <label className="label">
                    <span className="label-text font-semibold">Title *</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="input input-bordered w-full break-words whitespace-pre-wrap"
                    placeholder="e.g., Be Respectful"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* CONTENT */}
                <div className="form-control mb-3">
                  <label className="label">
                    <span className="label-text font-semibold">Content *</span>
                  </label>
                  <textarea
                    name="content"
                    className="textarea textarea-bordered w-full resize-y"
                    rows="4"
                    placeholder="Detailed description of the guideline..."
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* ORDER */}
                <div className="form-control mb-3">
                  <label className="label">
                    <span className="label-text font-semibold">Order</span>
                  </label>
                  <input
                    type="number"
                    name="order"
                    className="input input-bordered w-full"
                    value={formData.order}
                    onChange={handleInputChange}
                  />
                </div>

                {/* ACTIVE STATUS */}
                <div className="form-control mb-4">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      className="checkbox checkbox-primary"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span className="label-text font-semibold">Active</span>
                  </label>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}

        {/* DELETE MODAL */}
        {deleteModal && (
          <div className="modal modal-open">
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-error">Delete Guideline</h3>
              <p className="py-2">
                Are you sure you want to delete this guideline?{" "}
                <span className="font-bold text-error">
                  This action cannot be undone!
                </span>
              </p>
              <div className="modal-action">
                <button className="btn" onClick={() => setDeleteModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
            <div
              className="modal-backdrop"
              onClick={() => setDeleteModal(null)}
            ></div>
          </div>
        )}

        {/* GUIDELINES LIST */}
        <div className="space-y-4">
          {guidelines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No guidelines created yet. Click "Add New Guideline" to get
                started.
              </p>
            </div>
          ) : (
            guidelines.map((guideline) => (
              <div key={guideline._id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="card-title text-xl">
                        {guideline.title}
                        {!guideline.isActive && (
                          <span className="badge badge-ghost">Inactive</span>
                        )}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap">
                        {guideline.content}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <span className="badge badge-outline">
                          Order: {guideline.order}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => startEdit(guideline)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-error btn-ghost"
                        onClick={() => setDeleteModal(guideline._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default CommunityGuidelines;
