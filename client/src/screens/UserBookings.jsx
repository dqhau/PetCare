import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import axiosInstance from '../utils/axiosConfig';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, processing, completed, cancel
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewBooking, setViewBooking] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const [vaccinationHistory, setVaccinationHistory] = useState([]);
  const [loadingVaccination, setLoadingVaccination] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  
  const statusOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ xử lý', value: 'Pending' },
    { label: 'Đang xử lý', value: 'Processing' },
    { label: 'Hoàn thành', value: 'Completed' },
    { label: 'Đã hủy', value: 'Cancel' }
  ];
  
  const userId = localStorage.getItem('userId');
  
  // Lấy danh sách đặt lịch của người dùng
  const fetchUserBookings = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/booking/user/${userId}`);
      setBookings(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setError('Không thể lấy danh sách đặt lịch. Vui lòng thử lại sau.');
      if (toast.current) {
        toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lấy danh sách đặt lịch', life: 3000 });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Lấy lịch sử tiêm phòng
  const fetchVaccinationHistory = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    setLoadingVaccination(true);
    try {
      const response = await axiosInstance.get(`/users/vacxin/${userId}`);
      setVaccinationHistory(response.data);
    } catch (error) {
      console.error('Error fetching vaccination history:', error);
      if (toast.current) {
        toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lấy lịch sử tiêm phòng', life: 3000 });
      }
    } finally {
      setLoadingVaccination(false);
    }
  };
  
  useEffect(() => {
    fetchUserBookings();
    fetchVaccinationHistory();
  }, [userId, navigate]); // eslint-disable-line react-hooks/exhaustive-deps
  // Chúng ta chỉ thêm navigate vào dependencies, không cần thêm fetchUserBookings và fetchVaccinationHistory
  // vì chúng được định nghĩa trong component và sẽ gây ra vòng lặp vô hạn
  
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
  
  // Hủy đặt lịch
  const handleCancelBooking = async () => {
    if (!viewBooking) return;
    
    // Kiểm tra lý do hủy
    if (!cancelReason.trim()) {
      if (toast.current) {
        toast.current.show({ 
          severity: 'error', 
          summary: 'Thiếu thông tin', 
          detail: 'Vui lòng nhập lý do hủy lịch', 
          life: 3000 
        });
      }
      return;
    }
    
    try {
      await axiosInstance.put(`/booking/update-status/${viewBooking._id}`, { 
        cancel_reason: cancelReason
      });
      
      if (toast.current) {
        toast.current.show({ 
          severity: 'success', 
          summary: 'Thành công', 
          detail: 'Đã hủy đặt lịch thành công', 
          life: 3000 
        });
      }
      
      setShowCancelDialog(false);
      setShowViewDialog(false);
      setCancelReason('');
      fetchUserBookings();
      
    } catch (error) {
      console.error('Error canceling booking:', error);
      if (toast.current) {
        toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể hủy đặt lịch', life: 3000 });
      }
    }
  };
  
  // Lọc đặt lịch
  const filteredBookings = bookings.filter(booking => {
    // Lọc theo trạng thái
    if (filter !== 'all' && booking.order_status !== filter) {
      return false;
    }
    
    // Lọc theo ngày
    if (selectedDate) {
      const bookingDate = new Date(booking.appointment_date);
      const filterDate = new Date(selectedDate);
      
      if (
        bookingDate.getDate() !== filterDate.getDate() ||
        bookingDate.getMonth() !== filterDate.getMonth() ||
        bookingDate.getFullYear() !== filterDate.getFullYear()
      ) {
        return false;
      }
    }
    
    return true;
  });
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
        style={{ width: '50vw' }}
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
              <Button
                variant="danger"
                className="ml-2"
                onClick={() => {
                  setShowViewDialog(false);
                  setShowCancelDialog(true);
                }}
              >
                Hủy đặt lịch
              </Button>
            )}
          </div>
        }
      >
        <div className="p-fluid">
          <Row className="mb-3">
            <Col md={6}>
              <h5>Thông tin đặt lịch</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="fw-bold">Mã đặt lịch</td>
                    <td>{viewBooking._id}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Ngày đặt</td>
                    <td>{new Date(viewBooking.createdAt).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Ngày hẹn</td>
                    <td>{new Date(viewBooking.appointment_date).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Giờ hẹn</td>
                    <td>{viewBooking.timeslot ? `${viewBooking.timeslot.time}:00` : 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Trạng thái</td>
                    <td>{getStatusBadge(viewBooking.order_status)}</td>
                  </tr>
                  {viewBooking.order_status === 'Cancel' && (
                    <tr>
                      <td className="fw-bold">Lý do hủy</td>
                      <td>{viewBooking.cancel_reason || 'Không có lý do'}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <h5>Thông tin dịch vụ</h5>
              <Table bordered>
                <tbody>
                  <tr>
                    <td className="fw-bold">Dịch vụ</td>
                    <td>{viewBooking.service_type?.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Giá</td>
                    <td>
                      {viewBooking.service_type?.price
                        ? `${viewBooking.service_type.price.toLocaleString()} VNĐ`
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Thú cưng</td>
                    <td>{viewBooking.pet_info?.pet_name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Loài</td>
                    <td>{viewBooking.pet_info?.species || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Giống</td>
                    <td>{viewBooking.pet_info?.breed || 'N/A'}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <h5>Ghi chú</h5>
              <p className="border p-2 rounded">
                {viewBooking.note || 'Không có ghi chú'}
              </p>
            </Col>
          </Row>
        </div>
      </Dialog>
    );
  };
  
  // Dialog xác nhận hủy đặt lịch
  const renderCancelDialog = () => {
    if (!viewBooking) return null;
    
    return (
      <Dialog
        header="Xác nhận hủy đặt lịch"
        visible={showCancelDialog}
        style={{ width: '30vw' }}
        onHide={() => setShowCancelDialog(false)}
        footer={
          <div>
            <Button
              variant="secondary"
              onClick={() => setShowCancelDialog(false)}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              className="ml-2"
              onClick={handleCancelBooking}
            >
              Xác nhận hủy
            </Button>
          </div>
        }
      >
        <div className="p-fluid">
          <p>Bạn có chắc chắn muốn hủy đặt lịch này không?</p>
          <Form.Group>
            <Form.Label>Lý do hủy <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Vui lòng nhập lý do hủy đặt lịch"
            />
          </Form.Group>
        </div>
      </Dialog>
    );
  };
  
  return (
    <Container fluid className="py-4">
      <Toast ref={toast} />
      <h2 className="mb-4">Lịch sử đặt lịch</h2>
      
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        fill
      >
        <Tab eventKey="bookings" title="Đặt lịch của tôi">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Quản lý đặt lịch</Card.Title>
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lọc theo trạng thái</Form.Label>
                    <Dropdown
                      value={filter}
                      options={statusOptions}
                      onChange={(e) => setFilter(e.value)}
                      placeholder="Chọn trạng thái"
                      className="w-100"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lọc theo ngày</Form.Label>
                    <Calendar
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.value)}
                      dateFormat="dd/mm/yy"
                      showIcon
                      className="w-100"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end mb-3">
                  <Button 
                    variant="outline-secondary" 
                    className="w-100"
                    onClick={() => {
                      setFilter('all');
                      setSelectedDate(null);
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Danh sách đặt lịch</h5>
                <div>
                  <span className="me-2">
                    Tổng số: <Badge bg="primary">{filteredBookings.length}</Badge>
                  </span>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={fetchUserBookings}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="pi pi-refresh me-2"></i>
                    )}
                    Làm mới
                  </Button>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-4">
                  <div className="d-flex justify-content-center">
                    <Loading />
                  </div>
                  <p className="mt-2">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  {filteredBookings.length === 0 ? (
                    <Alert variant="info">
                      Không tìm thấy đặt lịch nào phù hợp với bộ lọc hiện tại.
                    </Alert>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Mã đặt lịch</th>
                          <th>Dịch vụ</th>
                          <th>Thú cưng</th>
                          <th>Ngày hẹn</th>
                          <th>Giờ</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking) => (
                          <tr key={booking._id}>
                            <td>{booking._id.substring(0, 8)}...</td>
                            <td>{booking.service_type?.name || 'N/A'}</td>
                            <td>
                              <div>{booking.pet_info?.pet_name || 'N/A'}</div>
                              <small className="text-muted">{booking.pet_info?.species}, {booking.pet_info?.breed}</small>
                            </td>
                            <td>{new Date(booking.appointment_date).toLocaleDateString()}</td>
                            <td>{booking.timeslot ? `${booking.timeslot.time}:00` : 'N/A'}</td>
                            <td>{getStatusBadge(booking.order_status)}</td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleViewBooking(booking._id)}
                                >
                                  Chi tiết
                                </Button>
                                
                                {booking.order_status === 'Pending' && (
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => {
                                      setViewBooking(booking);
                                      setShowCancelDialog(true);
                                    }}
                                  >
                                    Hủy
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
          
          {renderViewDialog()}
          {renderCancelDialog()}
        </Tab>
        <Tab eventKey="vaccination" title="Lịch sử tiêm phòng">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Lịch sử tiêm phòng</h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={fetchVaccinationHistory}
                  disabled={loadingVaccination}
                >
                  {loadingVaccination ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="pi pi-refresh me-2"></i>
                  )}
                  Làm mới
                </Button>
              </div>
              
              {loadingVaccination ? (
                <div className="text-center py-4">
                  <div className="d-flex justify-content-center">
                    <Loading />
                  </div>
                  <p className="mt-2">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  {vaccinationHistory.length === 0 ? (
                    <Alert variant="info">
                      Không tìm thấy lịch sử tiêm phòng nào.
                    </Alert>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th style={{ width: "10%" }}>STT</th>
                          <th style={{ width: "20%" }}>Ngày tiêm</th>
                          <th style={{ width: "30%" }}>Thú cưng</th>
                          <th style={{ width: "40%" }}>Loại dịch vụ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vaccinationHistory.map((item, index) => (
                          <tr key={item._id}>
                            <td>{index + 1}</td>
                            <td>{formatDate(item.createdAt)}</td>
                            <td>{item.bookingId.pet_info.pet_name}</td>
                            <td>
                              {item.bookingId.service_type.name} - 
                              {item.bookingId.service_type.price.toLocaleString("en-US", { currency: "VND" })} VNĐ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default UserBookings;
