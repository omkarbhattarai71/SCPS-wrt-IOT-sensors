import React, { useEffect, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import "./NotificationDisplay.css";

const NotificationItem = ({ notification, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const duration = notification.duration || 5000;

  useEffect(() => {
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const newProgress = (remaining / duration) * 100;
      setProgress(newProgress);
      
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [duration]);

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
    <div
      className={`alert ${getAlertClass(notification.type)} alert-dismissible fade show notification-item`}
      role="alert"
    >
      {notification.message}
      <button
        type="button"
        className="btn-close"
        onClick={() => onRemove(notification.id)}
        aria-label="Close"
      ></button>
      <div className="notification-progress-bar">
        <div 
          className="notification-progress" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

const NotificationDisplay = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationDisplay;
