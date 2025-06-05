import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Badge, Row, Col, Table } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import axiosInstance from '../../../utils/axiosConfig';
import { serviceService } from '../../../utils/apiServices';
import BookingFilters from './BookingFilters';
import BookingList from './BookingList';
import BookingDetails from './BookingDetails';
import BookingTimeslotDialog from './BookingTimeslotDialog';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('All');
  
  // Chuyển đổi ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  };
  
  // Xử lý hiển thị giờ hẹn
  const formatTimeSlot = (booking) => {
    // Kiểm tra nếu có timeslot object với thuộc tính time
    if (booking.timeslot && booking.timeslot.time) {
      return `${booking.timeslot.time}:00`;
    }
    
    // Kiểm tra nếu có thuộc tính time trực tiếp
    if (booking.time) {
      return `${booking.time}:00`;
    }
    
    // Nếu có startTime (một số API trả về startTime thay vì time)
    if (booking.startTime) {
      return booking.startTime;
    }
    
    // Nếu không có thông tin giờ hẹn
    return 'Chưa có giờ hẹn';
  };
  const [filter, setFilter] = useState('all'); // all, pending, processing, completed, cancel
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewBooking, setViewBooking] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showChangeTimeslotDialog, setShowChangeTimeslotDialog] = useState(false);
  const [availableTimeslots, setAvailableTimeslots] = useState([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [error, setError] = useState(null);
  const toast = useRef(null);
  
  const statusOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ xử lý', value: 'Pending' },
    { label: 'Đang xử lý', value: 'Processing' },
    { label: 'Hoàn thành', value: 'Completed' },
    { label: 'Đã hủy', value: 'Cancel' }
  ];
  
  // Lấy thông tin thú cưng cho từng đặt lịch
  const fetchPetDetails = async (bookings) => {
    // Lấy danh sách các đặt lịch cần thông tin thú cưng (chỉ những booking có petId là string (chưa populate))
    const bookingsNeedPetDetails = bookings.filter(
      booking => booking.petId && typeof booking.petId === 'string'
    );
    
    if (bookingsNeedPetDetails.length === 0) return bookings;
    
    // Tạo copy của danh sách bookings để cập nhật
    const updatedBookings = [...bookings];
    
    // Lấy thông tin chi tiết của mỗi thú cưng
    for (const booking of bookingsNeedPetDetails) {
      try {
        const petId = booking.petId;
        const response = await axiosInstance.get(`/pets/${petId}`);
        
        // Cập nhật thông tin thú cưng vào đặt lịch
        const index = updatedBookings.findIndex(b => b._id === booking._id);
        if (index !== -1 && response.data) {
          updatedBookings[index].petId = response.data;
        }
      } catch (error) {
        console.error(`Không thể lấy thông tin thú cưng ID: ${booking.petId}`, error);
      }
    }
    
    return updatedBookings;
  };
  
  // Lọc danh sách booking theo các điều kiện
  const getFilteredBookings = () => {
    let filtered = [...bookings];

    // Lọc theo trạng thái
    if (filter !== 'all') {
      filtered = filtered.filter(booking => booking.order_status === filter);
    }

    // Lọc theo dịch vụ
    if (selectedService && selectedService !== 'All') {
      filtered = filtered.filter(booking => booking.service_type?._id === selectedService);
    }

    // Lọc theo ngày
    if (selectedDate) {
      const filterDate = new Date(selectedDate).toDateString();
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.appointment_date).toDateString();
        return bookingDate === filterDate;
      });
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(booking =>
        booking.customer_name?.toLowerCase().includes(searchLower) ||
        booking.phone_number?.includes(searchLower) ||
        booking.email?.toLowerCase().includes(searchLower)
      );
    }

    // Sắp xếp theo thời gian tạo và ngày hẹn (mới nhất lên đầu)
    filtered.sort((a, b) => {
      // Nếu cùng ngày hẹn thì sắp xếp theo thời gian tạo
      if (a.appointment_date === b.appointment_date) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      // Nếu khác ngày hẹn thì sắp xếp theo ngày hẹn
      return new Date(b.appointment_date) - new Date(a.appointment_date);
    });

    return filtered;
  };
  
  // Lấy danh sách dịch vụ
  const fetchServices = async () => {
    try {
      const response = await serviceService.getAllServices();
      const servicesList = response.data;
      // Thêm option "Tất cả" vào đầu danh sách
      setServices([
        { _id: 'All', name: 'Tất cả' },
        ...servicesList
      ]);
    } catch (error) {
      console.error('Error fetching services:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể lấy danh sách dịch vụ',
          life: 3000
        });
      }
    }
  };

  // Lấy danh sách booking
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/booking');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể lấy danh sách đặt lịch',
          life: 3000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Tính toán danh sách booking đã được lọc
  const filteredBookings = getFilteredBookings();

  useEffect(() => {
    // Kiểm tra token trước khi gọi API
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách đặt lịch.');
      return;
    }
    
    fetchBookings();
    fetchServices();
    
    // Thiết lập interval để tự động làm mới dữ liệu mỗi 30 giây
    const refreshInterval = setInterval(() => {
      fetchBookings();
    }, 30000);
    
    // Dọn dẹp interval khi component bị hủy
    return () => clearInterval(refreshInterval);
  }, []);
  
  // Cập nhật trạng thái đặt lịch
  const handleUpdateStatus = async (id, status) => {
    try {
      // Hiển thị loading
      setLoading(true);
      
      // Chuẩn bị dữ liệu cập nhật
      let updateData = { order_status: status };
      
      // Xử lý đặc biệt cho trạng thái hủy
      if (status === 'Cancel') {
        // Đảm bảo có lý do hủy
        updateData.cancel_reason = "Hủy bởi quản trị viên";
      }
      
      // Gọi API cập nhật trạng thái - sử dụng API dành cho admin
      await axiosInstance.put(`/booking/update-status/${id}`, updateData);
      
      // Cập nhật trực tiếp vào state để tránh gọi lại API
      setBookings(prevBookings => {
        return prevBookings.map(booking => {
          if (booking._id === id) {
            const updatedBooking = {
              ...booking,
              order_status: status
            };
            if (status === 'Cancel') {
              updatedBooking.cancel_reason = updateData.cancel_reason;
            }
            return updatedBooking;
          }
          return booking;
        });
      });
      
      // Hiển thị thông báo thành công
      if (toast.current) {
        toast.current.show({ 
          severity: 'success', 
          summary: 'Thành công', 
          detail: `Đã cập nhật trạng thái thành ${getStatusText(status)}`, 
          life: 3000 
        });
      }
      
      // Gọi lại fetchBookings để đảm bảo dữ liệu được cập nhật từ server
      setTimeout(() => {
        fetchBookings();
      }, 500);
      
      // Nếu đang xem chi tiết, cập nhật thông tin
      if (viewBooking && viewBooking._id === id) {
        const updatedBooking = {...viewBooking, order_status: status};
        if (status === 'Cancel') {
          updatedBooking.cancel_reason = updateData.cancel_reason;
        }
        setViewBooking(updatedBooking);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      if (toast.current) {
        toast.current.show({ severity: 'error', summary: 'Lỗi', detail: error.response?.data?.error || 'Không thể cập nhật trạng thái', life: 3000 });
      }
    } finally {
      // Tắt loading
      setLoading(false);
    }
  };
  
  // Xem chi tiết đặt lịch
  const handleViewBooking = async (id) => {
    try {
      const response = await axiosInstance.get(`/booking/detail/${id}`);
      setViewBooking(response.data);
      setShowViewDialog(true);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      if (toast.current) {
        toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lấy chi tiết đặt lịch', life: 3000 });
      }
    }
  };
  
  // Lấy danh sách timeslot theo ngày
  const fetchTimeslotsByDate = async (date) => {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const response = await axiosInstance.get(`/timeslots?date=${formattedDate}`);
      // Chỉ lấy các timeslot còn chỗ trống
      const availableSlots = response.data.filter(slot => slot.availableSlots > 0);
      setAvailableTimeslots(availableSlots);
    } catch (error) {
      console.error('Error fetching timeslots:', error);
      if (toast.current) {
        toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lấy danh sách khung giờ', life: 3000 });
      }
    }
  };

  // Chuyển đổi timeslot
  const handleChangeTimeslot = async () => {
    if (!selectedTimeslot || !selectedBookingId) {
      if (toast.current) {
        toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chọn khung giờ mới', life: 3000 });
      }
      return;
    }

    try {
      await axiosInstance.put(
        `/booking/change-timeslot/${selectedBookingId}`,
        { newTimeslotId: selectedTimeslot }
      );

      if (toast.current) {
        toast.current.show({ 
          severity: 'success', 
          summary: 'Thành công', 
          detail: 'Chuyển đổi khung giờ thành công', 
          life: 3000 
        });
      }

      // Đóng dialog và làm mới dữ liệu
      setShowChangeTimeslotDialog(false);
      setSelectedTimeslot(null);
      setSelectedBookingId(null);
      fetchBookings();

      // Nếu đang xem chi tiết, cập nhật thông tin
      if (viewBooking && viewBooking._id === selectedBookingId) {
        handleViewBooking(selectedBookingId);
      }
    } catch (error) {
      console.error('Error changing timeslot:', error);
      if (toast.current) {
        toast.current.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: error.response?.data?.error || 'Không thể chuyển đổi khung giờ', 
          life: 3000 
        });
      }
    }
  };

  // Mở dialog chuyển đổi timeslot
  const openChangeTimeslotDialog = (bookingId, date) => {
    setSelectedBookingId(bookingId);
    setSelectedDate(new Date(date));
    fetchTimeslotsByDate(date);
    setShowChangeTimeslotDialog(true);
  };
  
  // Hiển thị badge theo trạng thái
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending':
        return <Badge bg="warning">Chờ xử lý</Badge>;
      case 'Processing':
        return <Badge bg="info">Đang xử lý</Badge>;
      case 'Completed':
        return <Badge bg="success">Hoàn thành</Badge>;
      case 'Cancel':
        return <Badge bg="danger">Đã hủy</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Lấy text trạng thái
  const getStatusText = (status) => {
    switch(status) {
      case 'Pending': return 'Chờ xử lý';
      case 'Processing': return 'Đang xử lý';
      case 'Completed': return 'Hoàn thành';
      case 'Cancel': return 'Đã hủy';
      default: return status;
    }
  };
  
  // Nội dung dialog xem chi tiết
  const renderViewDialog = () => {
    if (!viewBooking) return null;
    
    return (
      <Dialog 
        header="Chi tiết đặt lịch" 
        visible={showViewDialog} 
        style={{ width: '70vw' }} 
        onHide={() => setShowViewDialog(false)}
        footer={
          <div>
            <Button 
              variant="secondary" 
              onClick={() => setShowViewDialog(false)}
            >
              Đóng
            </Button>
            {viewBooking.order_status === 'Pending' && (
              <>
                <Button 
                  variant="info" 
                  className="ms-2"
                  onClick={() => handleUpdateStatus(viewBooking._id, 'Processing')}
                >
                  Xác nhận
                </Button>
                <Button 
                  variant="danger" 
                  className="ms-2"
                  onClick={() => handleUpdateStatus(viewBooking._id, 'Cancel')}
                >
                  Từ chối
                </Button>
              </>
            )}
            {viewBooking.order_status === 'Processing' && (
              <Button 
                variant="success" 
                className="ms-2"
                onClick={() => handleUpdateStatus(viewBooking._id, 'Completed')}
              >
                Hoàn thành
              </Button>
            )}
          </div>
        }
      >
        <div className="p-3">
          <Row>
            <Col md={6}>
              <h5>Thông tin khách hàng</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="fw-bold">Họ tên:</td>
                    <td>{viewBooking.customer_name}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Số điện thoại:</td>
                    <td>{viewBooking.phone_number}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Email:</td>
                    <td>{viewBooking.email}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Địa chỉ:</td>
                    <td>{viewBooking.address}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <h5>Thông tin thú cưng</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="fw-bold">Tên thú cưng:</td>
                    <td>{viewBooking.petId?.name || 'Không có thông tin'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Loài:</td>
                    <td>{viewBooking.petId?.species || 'Không có thông tin'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Giống:</td>
                    <td>{viewBooking.petId?.breed || 'Không có thông tin'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Tuổi:</td>
                    <td>{viewBooking.petId?.age ? `${viewBooking.petId.age} tuổi` : 'Không có thông tin'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Cân nặng:</td>
                    <td>{viewBooking.petId?.weight ? `${viewBooking.petId.weight} kg` : 'Không có thông tin'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Ghi chú:</td>
                    <td>{viewBooking.petId?.notes || 'Không có'}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          
          <Row className="mt-3">
            <Col md={6}>
              <h5>Thông tin đặt lịch</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="fw-bold">Mã đặt lịch:</td>
                    <td>{viewBooking._id}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Dịch vụ:</td>
                    <td>{viewBooking.service_type?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Giá:</td>
                    <td>{viewBooking.price_at_booking?.toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Ngày hẹn:</td>
                    <td>{formatDate(viewBooking.appointment_date)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Giờ hẹn:</td>
                    <td>{formatTimeSlot(viewBooking)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Trạng thái:</td>
                    <td>{getStatusBadge(viewBooking.order_status)}</td>
                  </tr>
                  {viewBooking.order_status === 'Cancel' && (
                    <tr>
                      <td className="fw-bold">Lý do hủy:</td>
                      <td>{viewBooking.cancel_reason || 'Không có'}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <h5>Mô tả yêu cầu</h5>
              <div className="border p-3 rounded" style={{ minHeight: '150px' }}>
                {viewBooking.description || 'Không có mô tả'}
              </div>
            </Col>
          </Row>
        </div>
      </Dialog>
    );
  };
  
  // Reset all filters to default values
  const resetFilters = async () => {
    setFilter('all');
    setSelectedService('All');
    setSelectedDate(null);
    setSearchTerm('');
    await fetchBookings(); // Fetch bookings after resetting filters
  };
  
  return (
    <div className="booking-management-wrapper">
      <div className="booking-management-container">
        <Toast ref={toast} />
        <h2 className="mb-4">Quản lý đặt lịch</h2>
        
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        
        <BookingFilters
          filter={filter}
          setFilter={setFilter}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          services={services}
          statusOptions={statusOptions}
        />

        <BookingList
          loading={loading}
          filteredBookings={filteredBookings}
          handleViewBooking={handleViewBooking}
          handleUpdateStatus={handleUpdateStatus}
          openChangeTimeslotDialog={openChangeTimeslotDialog}
          formatDate={formatDate}
          formatTimeSlot={formatTimeSlot}
          getStatusBadge={getStatusBadge}
          totalBookings={filteredBookings.length}
          resetFilters={resetFilters}
        />

        <BookingDetails
          viewBooking={viewBooking}
          showViewDialog={showViewDialog}
          setShowViewDialog={setShowViewDialog}
          handleUpdateStatus={handleUpdateStatus}
          formatDate={formatDate}
          formatTimeSlot={formatTimeSlot}
          getStatusBadge={getStatusBadge}
        />

        <BookingTimeslotDialog
          showChangeTimeslotDialog={showChangeTimeslotDialog}
          setShowChangeTimeslotDialog={setShowChangeTimeslotDialog}
          availableTimeslots={availableTimeslots}
          selectedTimeslot={selectedTimeslot}
          setSelectedTimeslot={setSelectedTimeslot}
          handleChangeTimeslot={handleChangeTimeslot}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          fetchTimeslotsByDate={fetchTimeslotsByDate}
        />

        <style>{`
          .booking-management-wrapper {
            width: 100%;
            min-height: 100vh;
            padding: 0;
            margin: 0;
            position: relative;
          }

          .booking-management-container {
            width: calc(100vw - 250px);
            padding: 1rem 2rem;
            margin-left: 0;
            position: relative;
          }

          @media (max-width: 768px) {
            .booking-management-container {
              width: 100%;
              padding: 1rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BookingManagement;

