import React from "react";
import { useNotification } from "../../context/NotificationContext";
import "./NotificationDisplay.css";

const NotificationDisplay = () => {
  const { notifications, removeNotification } = useNotification();

  const getAlertClass = (type) => {
    switch (type) {
      case "error":
        return "alert-danger";
      case "success":
        return "alert-success";
      case "warning":
        return "alert-warning";
      case "info":
      default:
        return "alert-info";
    }
  };

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`alert ${getAlertClass(notification.type)} alert-dismissible fade show`}
          role="alert"
        >
          {notification.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => removeNotification(notification.id)}
            aria-label="Close"
          ></button>
        </div>
      ))}
    </div>
  );
};

export default NotificationDisplay;
