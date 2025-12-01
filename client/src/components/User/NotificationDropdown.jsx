import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/default_avatar.jpg";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  // SSE Connection
  const connectToSSE = () => {
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource("/api/notifications/stream", {
        withCredentials: true,
      });

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "connected":
              console.log("SSE connection confirmed");
              break;

            case "notification":
              setNotifications((prev) => [data.data, ...prev]);
              setUnreadCount((prev) => prev + 1);

              if (Notification.permission === "granted") {
                new Notification("New Notification", {
                  body: data.data.message || "You have a new notification",
                  icon: "/logo.png",
                });
              }
              break;

            case "unread_count":
              setUnreadCount(data.count);
              break;

            default:
              console.log("Unknown message type:", data.type);
          }
        } catch (err) {
          console.error("Error parsing SSE message:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE connection error:", err);
        setIsConnected(false);
        eventSource.close();

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          const delay = RECONNECT_DELAY * reconnectAttemptsRef.current;

          console.log(
            `Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connectToSSE();
          }, delay);
        } else {
          console.error("Max reconnection attempts reached");
        }
      };
    } catch (err) {
      console.error("Error creating EventSource:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/notifications", {
        withCredentials: true,
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    // Connect to SSE
    connectToSSE();

    // Fetch initial notifications
    fetchNotifications();

    // Request browser notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      if (eventSourceRef.current) {
        console.log("📡 Closing notification stream");
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `/notifications/${notificationId}/read`,
        {},
        {
          withCredentials: true,
        }
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
      setLoading(true);
      await axios.patch(
        "/notifications/read-all",
        {},
        {
          withCredentials: true,
        }
      );
      setNotifications(
        notifications.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRedirectPath = (notification) => {
    switch (notification.type) {
      case "announcement":
        return `/home#announcement-${notification.targetId}`;

      case "featured_artist":
        return "/home#featured-artist";

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
          notification.targetType === "Comment" ||
          notification.targetType === "Post"
        ) {
          return `/forum/post/${notification.targetId}#comment-${notification.targetId}`;
        }
        return "/forum";

      case "project_tag":
        if (notification.targetType === "Project") {
          return `/projects#project-${notification.targetId}`;
        }
        return "/projects";

      case "project_reported":
      case "project_restored":
      case "project_deleted":
        return "/projects";

      default:
        return notification.link || "/home";
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    const redirectPath = getRedirectPath(notification);
    setIsOpen(false);
    navigate(redirectPath);
  };

  const deleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await axios.delete(`/notifications/${notificationId}`, {
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "announcement":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
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
          </div>
        );
      case "featured_artist":
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      case "project_reported":
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-600"
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
          </div>
        );
      case "project_restored":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
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
          </div>
        );
      case "project_deleted":
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-600"
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
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* BELL ICON */}
        <button
          className="btn btn-ghost btn-circle relative"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="indicator">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
            {unreadCount > 0 && (
              <span className="badge badge-xs bg-royal-blue text-white indicator-item">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            {/* Connection status indicator */}
            {!isConnected && (
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-warning animate-pulse" />
            )}
          </div>
        </button>

        {/* DROPDOWN */}
        {isOpen && (
          <div className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto mt-2 w-auto sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* NOTIF LIST */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mx-auto mb-2 text-gray-300"
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
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* AVATAR OR ICON */}
                      {notification.type === "announcement" ? (
                        getNotificationIcon("announcement")
                      ) : notification.sender ? (
                        <img
                          src={
                            notification?.sender?.avatar?.url || defaultAvatar
                          }
                          alt={`${notification.sender.firstName} ${notification.sender.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : null}

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">
                          {notification.type === "announcement" ? (
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
                        <p className="text-xs text-gray-500 mt-1">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* UNREAD // DELETE */}
                      <div className="flex items-start gap-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        )}
                        <button
                          onClick={(e) =>
                            deleteNotification(notification._id, e)
                          }
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    navigate("/all-notifications");
                    setIsOpen(false);
                  }}
                  className="text-sm royal-blue duration-100 font-medium cursor-pointer"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;
