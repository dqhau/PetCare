import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Dropdown, Spinner } from 'react-bootstrap';
import { BellFill, Check2All, Calendar3 } from 'react-bootstrap-icons';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Thời gian polling (30 giây)
const POLLING_INTERVAL = 30000;

// Icons theo loại thông báo
const getNotificationIcon = (type) => {
  switch(type) {
    case 'booking':
      return <Calendar3 className="text-primary" />;
    case 'booking_cancel':
    case 'cancellation':
      return <Calendar3 className="text-danger" />;
    case 'completion':
      return <Calendar3 className="text-success" />;
    default:
      return <Calendar3 className="text-secondary" />;
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
      const response = await axiosInstance.get('/notifications');
      
      if (response.data && Array.isArray(response.data)) {
        setNotifications(response.data);
        // Đếm số thông báo chưa đọc
        setUnreadCount(response.data.filter(notification => !notification.isRead).length);
      } else {
        // Fallback nếu API không trả về đúng định dạng
        setNotifications([]);
        setUnreadCount(0);
      }
      setError(null);
    } catch (err) {
      setError('Không thể tải thông báo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Thiết lập polling
  useEffect(() => {
    // Gọi ngay lần đầu
    fetchNotifications();
    
    // Thiết lập interval
    const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);
    
    // Cleanup khi component unmount
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  // Đánh dấu thông báo đã đọc
  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`, {});
      
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
      await axiosInstance.put('/notifications/read-all', {});
      
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

  // Định dạng thời gian
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Dropdown show={showDropdown} onToggle={setShowDropdown}>
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
            style={{ top: '-5px', right: '-5px', fontSize: '0.6rem' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        align="end" 
        className="dropdown-menu-end notification-dropdown" 
        style={{ minWidth: '320px', maxHeight: '400px', overflowY: 'auto' }}
      >
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">Thông báo</h6>
          {unreadCount > 0 && (
            <button 
              className="btn btn-sm btn-link text-decoration-none p-0"
              onClick={markAllAsRead}
              title="Đánh dấu tất cả là đã đọc"
            >
              <Check2All size={16} className="text-primary" />
              <span className="ms-1 small">Đánh dấu đã đọc</span>
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
                className={`p-3 border-bottom notification-item ${!notification.isRead ? 'fw-bold bg-light' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="d-flex">
                  <div className="me-3 notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>{notification.message}</div>
                      <small className="text-muted ms-2">
                        {formatTime(notification.createdAt)}
                      </small>
                    </div>
                    {notification.relatedId && (
                      <div className="small text-primary mt-1">
                        Mã đặt lịch: #{typeof notification.relatedId === 'string' ? notification.relatedId.substring(0, 8) : notification.relatedId.toString().substring(0, 8)}
                      </div>
                    )}
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
