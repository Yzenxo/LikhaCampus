import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/default_avatar.jpg";

const ViewAllNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/notifications?limit=100", {
        withCredentials: true,
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications(
        notifications.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        "/notifications/read-all",
        {},
        { withCredentials: true }
      );
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await axios.delete("/notifications/${notificationId}", {
        withCredentials: true,
      });
      const deletedNotif = notifications.find((n) => n._id === notificationId);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      if (!deletedNotif.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getRedirectPath = (notification) => {
    switch (notification.type) {
      case "announcement":
        return `/home#announcement-${notification.targetId}`;

      case "upvote":
        if (
          notification.targetType === "Post" ||
          notification.targetType === "ForumPost"
        ) {
          return `/forum#post-${notification.targetId}`;
        }
        return "/forum";

      case "comment":
        if (
          notification.targetType === "Post" ||
          notification.targetType === "ForumPost"
        ) {
          return `/forum#post-${notification.targetId}`;
        }
        return "/forum";
      case "reply":
        if (
          notification.targetType === "Post" ||
          notification.targetType === "ForumPost"
        ) {
          return `/forum/post/${notification.targetId}#comment-${notification.targetId}`;
        }
        return "/forum";

      case "project_tag":
        if (notification.targetType === "Project") {
          return `/projects#project-${notification.targetId}`;
        }
        return "/projects";

      case "post_hidden":
      case "post_reported":
      case "post_restored":
      case "post_deleted":
        if (notification.targetId) {
          return `/forum#post-${notification.targetId}`;
        }
        return "/forum";

      case "comment_hidden":
      case "comment_reported":
      case "comment_restored":
      case "comment_deleted":
        if (notification.targetId) {
          return `/forum#comment-${notification.targetId}`;
        }
        return "/forum";

      case "project_reported":
      case "project_restored":
      case "project_deleted":
        return "/projects";

      default:
        return "/home";
    }
  };
  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    const redirectPath = getRedirectPath(notification);

    navigate(redirectPath);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
      }
    }
    return "Just now";
  };

  const getNotificationStyle = (type) => {
    const styles = {
      announcement: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
            />
          </svg>
        ),
        bg: "bg-blue-100",
        text: "text-blue-600",
        badge: "badge-info",
      },
      upvote: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 15l7-7 7 7"
            />
          </svg>
        ),
        bg: "bg-green-100",
        text: "text-green-600",
        badge: "badge-success",
      },
      comment: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        ),
        bg: "bg-purple-100",
        text: "text-purple-600",
        badge: "badge-secondary",
      },
      reply: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        ),
        bg: "bg-indigo-100",
        text: "text-indigo-600",
        badge: "badge-accent",
      },
      project_tag: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        ),
        bg: "bg-yellow-100",
        text: "text-yellow-600",
        badge: "badge-warning",
      },
      post_hidden: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        bg: "bg-red-100",
        text: "text-red-600",
        badge: "badge-error",
      },
      post_reported: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
            />
          </svg>
        ),
        bg: "bg-orange-100",
        text: "text-orange-600",
        badge: "badge-warning",
      },
      post_restored: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        bg: "bg-green-100",
        text: "text-green-600",
        badge: "badge-success",
      },
      post_deleted: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ),
        bg: "bg-gray-100",
        text: "text-gray-600",
        badge: "badge-ghost",
      },
      comment_hidden: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
        ),
        bg: "bg-red-100",
        text: "text-red-600",
        badge: "badge-error",
      },
      comment_restored: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        bg: "bg-green-100",
        text: "text-green-600",
        badge: "badge-success",
      },
      comment_reported: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
            />
          </svg>
        ),
        bg: "bg-orange-100",
        text: "text-orange-600",
        badge: "badge-warning",
      },
      comment_deleted: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ),
        bg: "bg-gray-100",
        text: "text-gray-600",
        badge: "badge-ghost",
      },
      project_reported: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ),
        bg: "bg-yellow-100",
        text: "text-yellow-600",
        badge: "badge-warning",
      },
      project_restored: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
        bg: "bg-green-100",
        text: "text-green-600",
        badge: "badge-success",
      },
      project_deleted: {
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ),
        bg: "bg-red-100",
        text: "text-red-600",
        badge: "badge-error",
      },
    };
    return styles[type] || styles.comment;
  };

  // Filter notifications
  const getFilteredNotifications = () => {
    if (filter === "all") return notifications;

    const filterMap = {
      moderation: [
        "post_hidden",
        "post_reported",
        "post_restored",
        "post_deleted",
        "comment_hidden",
        "comment_reported",
        "comment_restored",
        "comment_deleted",
        "project_reported",
        "project_restored",
        "project_deleted",
      ],
      comments: ["comment"],
      replies: ["reply"],
      upvotes: ["upvote"],
      tags: ["project_tag"],
      announcements: ["announcement"],
    };

    return notifications.filter((n) => filterMap[filter]?.includes(n.type));
  };

  const groupNotificationsByDate = (notifications) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const groups = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Older: [],
    };

    notifications.forEach((notif) => {
      const notifDate = new Date(notif.createdAt);
      notifDate.setHours(0, 0, 0, 0);

      if (notifDate.getTime() === today.getTime()) {
        groups.Today.push(notif);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notif);
      } else if (notifDate >= thisWeek) {
        groups["This Week"].push(notif);
      } else {
        groups.Older.push(notif);
      }
    });

    return groups;
  };

  const filteredNotifications = getFilteredNotifications();
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      {/* HEADER */}
      <h1 className="text-3xl font-bold">NOTIFICATIONS</h1>
      <div className="container mx-auto mt-4 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-sm btn-outline">
              Mark all as read
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="tabs tabs-boxed mb-6 bg-base-100 flex-wrap">
          <button
            className={`tab ${filter === "all" ? "tab-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`tab ${filter === "moderation" ? "tab-active" : ""}`}
            onClick={() => setFilter("moderation")}
          >
            Moderation
          </button>
          <button
            className={`tab ${filter === "comments" ? "tab-active" : ""}`}
            onClick={() => setFilter("comments")}
          >
            Comments
          </button>
          <button
            className={`tab ${filter === "replies" ? "tab-active" : ""}`}
            onClick={() => setFilter("replies")}
          >
            Replies
          </button>
          <button
            className={`tab ${filter === "upvotes" ? "tab-active" : ""}`}
            onClick={() => setFilter("upvotes")}
          >
            Upvotes
          </button>
          <button
            className={`tab ${filter === "tags" ? "tab-active" : ""}`}
            onClick={() => setFilter("tags")}
          >
            Tags
          </button>
          <button
            className={`tab ${filter === "announcements" ? "tab-active" : ""}`}
            onClick={() => setFilter("announcements")}
          >
            Announcements
          </button>
        </div>

        {/* NOTIFICATIONS LIST */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="text-gray-500">No notifications in this category</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(
              ([group, notifs]) =>
                notifs.length > 0 && (
                  <div key={group}>
                    <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                      {group}
                    </h2>
                    <div className="space-y-2">
                      {notifs.map((notification) => {
                        const style = getNotificationStyle(notification.type);
                        return (
                          <div
                            key={notification._id}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                            className={`card bg-base-100 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${
                              !notification.read
                                ? "border-l-primary bg-primary/5"
                                : "border-l-transparent"
                            }`}
                          >
                            <div className="card-body p-4">
                              <div className="flex gap-4">
                                {/* ICON OR AVATAR */}
                                {notification.type === "announcement" ||
                                (notification.type.includes("_") &&
                                  notification.type !== "project_tag") ? (
                                  <div
                                    className={`w-12 h-12 rounded-full ${style.bg} ${style.text} flex items-center justify-center shrink-0`}
                                  >
                                    {style.icon}
                                  </div>
                                ) : notification.sender ? (
                                  <img
                                    src={
                                      notification.sender?.avatar?.url ||
                                      defaultAvatar
                                    }
                                    alt={`${notification.sender?.firstName} ${notification.sender?.lastName}`}
                                    className="w-12 h-12 rounded-full object-cover shrink-0"
                                  />
                                ) : null}

                                {/* CONTENT */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-medium">
                                      {notification.type === "announcement" ||
                                      (notification.type.includes("_") &&
                                        notification.type !== "project_tag") ? (
                                        <span>{notification.message}</span>
                                      ) : (
                                        <>
                                          <span className="font-semibold">
                                            {notification.sender?.firstName}{" "}
                                            {notification.sender?.lastName}
                                          </span>{" "}
                                          {notification.message}
                                        </>
                                      )}
                                    </p>
                                    <button
                                      onClick={(e) =>
                                        deleteNotification(notification._id, e)
                                      }
                                      className="btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-error"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2 mt-2">
                                    <span
                                      className={`badge ${style.badge} badge-sm`}
                                    >
                                      {notification.type.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {timeAgo(notification.createdAt)}
                                    </span>
                                    {!notification.read && (
                                      <span className="badge badge-primary badge-xs">
                                        New
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewAllNotifications;
