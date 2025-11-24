import axios from "axios";
import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useAlert } from "../../hooks/useAlert";

const AnnouncementPanel = () => {
  const { showAlert } = useAlert();
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState(null);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    imageFile: null,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get("/announcements");
      setAnnouncements(response.data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const addAnnouncement = async () => {
    if (
      !newAnnouncement.title ||
      !newAnnouncement.content ||
      !newAnnouncement.imageFile
    ) {
      showAlert("Please fill all fields", "warning");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", newAnnouncement.title);
    formData.append("content", newAnnouncement.content);
    formData.append("image", newAnnouncement.imageFile);

    try {
      await axios.post(`/announcements`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchAnnouncements();

      setNewAnnouncement({ title: "", content: "", imageFile: null });
      setShowAnnouncementModal(false);
      showAlert("Announcement created successfully!", "success");
    } catch (error) {
      console.error("Error adding announcement:", error);
      showAlert(
        `Failed to add announcement: ${error.response?.data?.error || error.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      showAlert("Please fill all required fields!", "warning");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", newAnnouncement.title);
    formData.append("content", newAnnouncement.content);
    if (newAnnouncement.imageFile) {
      formData.append("image", newAnnouncement.imageFile);
    }

    try {
      await axios.put(`/announcements/${currentAnnouncementId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchAnnouncements();

      setNewAnnouncement({ title: "", content: "", imageFile: null });
      setShowAnnouncementModal(false);
      setEditMode(false);
      setCurrentAnnouncementId(null);
      showAlert("Announcement updated successfully!", "success");
    } catch (error) {
      console.error("Error updating announcement:", error);
      showAlert(
        `Failed to update announcement: ${error.response?.data?.error || error.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (announcement) => {
    setEditMode(true);
    setCurrentAnnouncementId(announcement._id);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      imageFile: null,
    });
    setShowAnnouncementModal(true);
  };

  const handleViewClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  };

  const handleDeleteClick = (announcement) => {
    setAnnouncementToDelete(announcement);
    setModal("delete");
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;
    setIsDeleting(true);

    try {
      await axios.delete(`/announcements/${announcementToDelete._id}`);
      await fetchAnnouncements();
      showAlert("Announcement deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      showAlert(
        `Failed to delete announcement: ${error.response?.data?.error || error.message}`,
        "error"
      );
    } finally {
      setIsDeleting(false);
      setModal(null);
      setAnnouncementToDelete(null);
    }
  };

  const handleModalClose = () => {
    setShowAnnouncementModal(false);
    setEditMode(false);
    setCurrentAnnouncementId(null);
    setNewAnnouncement({ title: "", content: "", imageFile: null });
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-3 space-y-6 sm:space-y-10">
        {/* HEADER - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-0">
          <h2 className="text-xl sm:text-2xl royal-blue font-bold flex items-center gap-2">
            <Megaphone size={20} className="sm:w-6 sm:h-6" /> Announcements
          </h2>
          <button
            className="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto"
            onClick={() => setShowAnnouncementModal(true)}
          >
            + Add Announcement
          </button>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Create and manage announcements for the community
        </p>

        {/* TABLE - Mobile Card View, Desktop Table */}
        <div className="hidden sm:block card bg-base-100 shadow-md overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Date</th>
                <th>Content</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No announcements yet. Create your first one!
                  </td>
                </tr>
              ) : (
                announcements.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        className="w-24 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition"
                        onClick={() => handleViewClick(a)}
                      />
                    </td>
                    <td>
                      <div
                        className="max-w-xs truncate cursor-pointer hover:text-primary transition font-medium"
                        onClick={() => handleViewClick(a)}
                        title={a.title}
                      >
                        {a.title}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      {new Date(a.date || a.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="max-w-md truncate" title={a.content}>
                        {a.content}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2 whitespace-nowrap">
                        <button
                          className="btn btn-xs btn-warning"
                          onClick={() => handleEditClick(a)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-xs btn-error"
                          onClick={() => handleDeleteClick(a)}
                        >
                          Delete
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
          {announcements.length === 0 ? (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body text-center py-12 text-gray-500">
                No announcements yet. Create your first one!
              </div>
            </div>
          ) : (
            announcements.map((a) => (
              <div key={a._id} className="card bg-base-100 shadow-md">
                <figure className="px-4 pt-4">
                  <img
                    src={a.imageUrl}
                    alt={a.title}
                    className="rounded-lg w-full h-48 object-cover cursor-pointer"
                    onClick={() => handleViewClick(a)}
                  />
                </figure>
                <div className="card-body p-4">
                  <h3
                    className="card-title text-base cursor-pointer hover:text-primary"
                    onClick={() => handleViewClick(a)}
                  >
                    {a.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(a.date || a.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm line-clamp-2">{a.content}</p>
                  <div className="card-actions justify-end mt-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEditClick(a)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDeleteClick(a)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* REST OF YOUR MODALS STAY THE SAME */}
        {/* CREATE/EDIT ANNOUNCEMENT MODAL */}
        {showAnnouncementModal && (
          <dialog open className="modal">
            <div className="modal-box max-w-lg">
              <h3 className="font-bold text-lg">
                {editMode ? "Edit Announcement" : "New Announcement"}
              </h3>
              <div className="space-y-3 mt-4">
                <input
                  type="text"
                  placeholder="Title"
                  className="input input-bordered w-full"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                />
                <textarea
                  placeholder="Content"
                  className="textarea textarea-bordered w-full"
                  rows="4"
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                ></textarea>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      imageFile: e.target.files[0],
                    })
                  }
                />
                {editMode && (
                  <p className="text-sm text-gray-500">
                    Leave image empty to keep the current image
                  </p>
                )}
              </div>
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  onClick={editMode ? updateAnnouncement : addAnnouncement}
                  disabled={loading}
                >
                  {loading ? "Saving..." : editMode ? "Update" : "Save"}
                </button>
                <button
                  className="btn"
                  onClick={handleModalClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </dialog>
        )}

        {/* VIEW ANNOUNCEMENT MODAL */}
        {showViewModal && selectedAnnouncement && (
          <dialog
            open
            className="modal"
            onClick={() => setShowViewModal(false)}
          >
            <div
              className="modal-box max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-xl sm:text-2xl mb-4 break-words">
                {selectedAnnouncement.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {new Date(
                  selectedAnnouncement.date || selectedAnnouncement.createdAt
                ).toLocaleDateString()}
              </p>
              <figure className="mb-4">
                <img
                  src={selectedAnnouncement.imageUrl}
                  alt={selectedAnnouncement.title}
                  className="w-full h-auto object-contain rounded-lg"
                />
              </figure>
              <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                {selectedAnnouncement.content}
              </p>
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAnnouncement(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </dialog>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {modal === "delete" && (
          <div className="modal modal-open">
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-error">Delete Announcement</h3>
              <p className="py-2 break-words">
                Are you sure you want to delete "{announcementToDelete?.title}"?{" "}
                <span className="font-bold text-error">
                  This action cannot be undone!
                </span>
              </p>
              <div className="modal-action">
                <button className="btn" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
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

export default AnnouncementPanel;
