import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Dropdown, Spinner } from 'react-bootstrap';
import { BellFill, Check2All, Calendar3 } from 'react-bootstrap-icons';
import { notificationService } from '../../utils/apiServices';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Thời gian polling (30 giây)
const POLLING_INTERVAL = 30000;

// Icons theo loại thông báo
const getNotificationIcon = (type) => {
  switch (type) {
    case 'booking':
    case 'booking_cancel':
    case 'cancellation':
    case 'completion':
      return <Calendar3 size={16} />;
    default:
      return <BellFill size={16} />;
  }
};

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Hàm fetch thông báo
  const fetchNotifications = useCallback(async () => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      const response = await notificationService.getAllNotifications();
      setNotifications(response.data);
      
      // Đếm số thông báo chưa đọc
      const unread = response.data.filter(notification => !notification.isRead).length;
      setUnreadCount(unread);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Không thể tải thông báo');
    } finally {
      setIsLoading(false);
    }
  }, [notificationService]);

  // Polling thông báo
  useEffect(() => {
    // Fetch ngay lập tức khi component mount
    fetchNotifications();

    // Thiết lập interval cho polling
    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);

    // Cleanup khi component unmount
    return () => clearInterval(intervalId);
  }, [fetchNotifications, POLLING_INTERVAL]);

  // Đánh dấu thông báo đã đọc
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Cập nhật UI
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Không thể đánh dấu thông báo đã đọc');
    }
  };

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      await notificationService.markAllAsRead();
      
      // Cập nhật UI
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      toast.error('Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  // Xử lý khi click vào thông báo
  const handleNotificationClick = (notification) => {
    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Điều hướng dựa vào loại thông báo
    if (notification.type === 'booking' || notification.type === 'booking_cancel') {
      // Nếu có ID đặt lịch, điều hướng đến trang chi tiết
      if (notification.relatedId) {
        navigate(`/my-bookings?id=${notification.relatedId}`);
      } else {
        navigate('/my-bookings');
      }
    } else if (notification.type === 'cancellation' || notification.type === 'completion') {
      navigate('/my-bookings');
    }
    
    // Đóng dropdown sau khi click
    setShowDropdown(false);
  };

  // Format thời gian
  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now - notificationTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return `${notificationTime.getDate()}/${notificationTime.getMonth() + 1}/${notificationTime.getFullYear()}`;
    }
  };

  return (
    <Dropdown 
      align="end" 
      show={showDropdown} 
      onToggle={(isOpen) => setShowDropdown(isOpen)}
    >
      <Dropdown.Toggle 
        variant="light" 
        id="dropdown-notification"
        className="position-relative border-0 bg-transparent"
      >
        <BellFill size={20} className="text-dark" />
        {unreadCount > 0 && (
          <Badge 
            pill 
            bg="danger" 
            className="position-absolute" 
            style={{ top: '-5px', right: '-5px', fontSize: '0.6rem', padding: '0.25em 0.4em' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        align="end" 
        className="dropdown-menu-end notification-dropdown"
      >
        <div className="notification-header">
          <h6>Thông báo</h6>
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-btn"
              onClick={markAllAsRead}
              title="Đánh dấu tất cả là đã đọc"
              aria-label="Đánh dấu tất cả thông báo là đã đọc"
            >
              <Check2All size={14} className="me-1" />
              <span>Đánh dấu đã đọc</span>
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center p-3">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Đang tải thông báo...</span>
          </div>
        ) : error ? (
          <div className="text-center p-3 text-danger">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-3 text-muted">
            Không có thông báo mới
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <Dropdown.Item 
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'fw-bold bg-light' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                {!notification.isRead && (
                  <button 
                    className="notification-mark-read" 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}
                    title="Đánh dấu đã đọc"
                  >
                    <Check2All size={16} />
                  </button>
                )}
                <div className="notification-item-content">
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-text">
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      {notification.relatedId && (
                        <div className="notification-booking-code">
                          Mã đặt lịch: #{typeof notification.relatedId === 'string' ? notification.relatedId.substring(0, 8) : notification.relatedId.toString().substring(0, 8)}
                        </div>
                      )}
                      <div className="notification-time">
                        {formatTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </Dropdown.Item>
            ))}
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationSystem;