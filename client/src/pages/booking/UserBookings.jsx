import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Alert, Tabs, Tab, Breadcrumb } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';
import { FaInfoCircle} from 'react-icons/fa';
import Loading from '../../components/common/Loading';
import { bookingService, serviceService, petService } from '../../utils/apiServices';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

const UserBookings = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  const userId = localStorage.getItem('userId');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewBooking, setViewBooking] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [services, setServices] = useState([]);
  const [pets, setPets] = useState([]);

  const statusOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ xử lý', value: 'Pending' },
    { label: 'Đang xử lý', value: 'Processing' },
    { label: 'Hoàn thành', value: 'Completed' },
    { label: 'Đã hủy', value: 'Cancel' }
  ];
  
  const fetchUserBookings = async () => {
    if (!userId) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const response = await bookingService.getBookingsByUserId(userId);
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setBookings([]);
      if (toast.current) {
        toast.current.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: error.response?.data?.message || 'Không thể lấy danh sách đặt lịch', 
          life: 3000 
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserBookings();
  }, [userId, navigate]); 
  
  const handleViewBooking = async (id) => {
    try {
      const response = await bookingService.getBookingById(id);
      setViewBooking(response.data);
      setShowViewDialog(true);
    } catch (error) {
      if (toast.current) {
        toast.current.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: error.response?.data?.message || 'Không thể lấy chi tiết đặt lịch', 
          life: 3000 
        });
      }
    }
  };
  
  const handleCancelBooking = async () => {
    if (!viewBooking) return;
    
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
      await bookingService.updateBookingStatus(viewBooking._id, {
        order_status: 'Cancel',
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
  
  const fetchServices = async () => {
    try {
      const response = await serviceService.getAllServices();
      const serviceOptions = response.data.map(service => ({
        value: service._id,
        label: service.name
      }));
      setServices([{ value: null, label: 'Tất cả' }, ...serviceOptions]);
    } catch (error) {
      console.error('Error fetching services:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách dịch vụ',
          life: 3000
        });
      }
    }
  };

  const fetchUserPets = async () => {
    try {
      const response = await petService.getPetsByUserId(userId);
      const petOptions = response.data.map(pet => ({
        value: pet._id,
        label: `${pet.name} (${pet.species})`
      }));
      setPets([{ value: null, label: 'Tất cả' }, ...petOptions]);
    } catch (error) {
      console.error('Error fetching pets:', error);
      if (toast.current) {
        toast.current.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách thú cưng',
          life: 3000
        });
      }
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserBookings();
      fetchServices();
      fetchUserPets();
    }
  }, [userId]);

  const filteredBookings = bookings
    .filter(booking => {
      // Status filter
      if (filter !== 'all' && booking.order_status !== filter) {
        return false;
      }

      // Date filter
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

      // Service filter
      if (selectedService && booking.service_type?._id !== selectedService) {
        return false;
      }

      // Pet filter
      if (selectedPet && booking.petId?._id !== selectedPet) {
        return false;
      }

      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          booking.service_type?.name?.toLowerCase().includes(searchLower) ||
          booking.petId?.name?.toLowerCase().includes(searchLower) ||
          booking._id?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const clearFilters = () => {
    setFilter('all');
    setSelectedDate(null);
    setSelectedService(null);
    setSelectedPet(null);
    setSearchTerm('');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getStatusBadge = (status) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'Pending':
          return '#ffc107'; // warning yellow
        case 'Processing':
          return '#0dcaf0'; // info blue
        case 'Completed':
          return '#198754'; // success green
        case 'Cancel':
          return '#dc3545'; // danger red
        default:
          return '#6c757d'; // secondary gray
      }
    };

    return (
      <div 
        style={{
          color: getStatusColor(status),
          fontWeight: 500,
          display: 'inline-block'
        }}
      >
        {getStatusText(status)}
      </div>
    );
  };
  
  const getStatusText = (status) => {
    switch(status) {
      case 'Pending': return 'Chờ xác nhận';
      case 'Processing': return 'Đang xử lý';
      case 'Completed': return 'Hoàn thành';
      case 'Cancel': return 'Đã hủy';
      default: return status;
    }
  };
  
  const formatTimeSlot = (booking) => {
    if (booking.timeslot && typeof booking.timeslot.time === 'number') {
      return `${booking.timeslot.time}:00`;
    }
    
    if (typeof booking.time === 'number') {
      return `${booking.time}:00`;
    }
    
    if (booking.startTime) {
      return booking.startTime;
    }
    
    return 'Chưa có giờ hẹn';
  };
  
  const renderViewDialog = () => {
    if (!viewBooking) return null;
    
    return (
      <Dialog
        visible={showViewDialog}
        onHide={() => setShowViewDialog(false)}
        header="Chi tiết đặt lịch"
        className="booking-detail-dialog"
        style={{ width: '90%', maxWidth: '800px' }}
      >
        <div className="booking-detail-content p-3">
          <div className="row">
            <div className="col-md-6">
              <div className="detail-section h-100">
                <h5 className="detail-header">Thông tin đặt lịch</h5>
                <div className="detail-row">
                  <strong>Mã đặt lịch:</strong> {viewBooking._id}
                </div>
                <div className="detail-row">
                  <strong>Ngày đặt:</strong> {new Date(viewBooking.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div className="detail-row">
                  <strong>Ngày hẹn:</strong> {new Date(viewBooking.appointment_date).toLocaleDateString('vi-VN')}
                </div>
                <div className="detail-row">
                  <strong>Giờ hẹn:</strong> {formatTimeSlot(viewBooking)}
                </div>
                <div className="detail-row">
                  <strong>Trạng thái:</strong> <span className="ms-2">{getStatusBadge(viewBooking.order_status)}</span>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="detail-section h-100">
                <h5 className="detail-header">Thông tin dịch vụ & thú cưng</h5>
                <div className="detail-row">
                  <strong>Dịch vụ:</strong> {viewBooking.service_type?.name || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Giá:</strong> {viewBooking.price_at_booking?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div className="detail-row">
                  <strong>Tên thú cưng:</strong> {viewBooking.petId?.name || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Loài:</strong> {viewBooking.petId?.species || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Giống:</strong> {viewBooking.petId?.breed || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {viewBooking.order_status === 'Cancel' && (
            <div className="detail-section mt-3">
              <h5 className="detail-header">Thông tin hủy lịch</h5>
              <div className="detail-row">
                <strong>Lý do hủy:</strong> {viewBooking.cancel_reason || 'Không có lý do'}
              </div>
            </div>
          )}

          <div className="dialog-footer d-flex justify-content-center gap-3 mt-4">
            <Button 
              variant="secondary" 
              onClick={() => setShowViewDialog(false)}
              className="px-4"
            >
              Đóng
            </Button>
            {(viewBooking.order_status === 'Pending' || viewBooking.order_status === 'Processing') && (
              <Button 
                variant="danger"
                onClick={() => {
                  setShowViewDialog(false);
                  setShowCancelDialog(true);
                }}
                className="px-4"
              >
                Hủy đặt lịch
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    );
  };
  
  const renderCancelDialog = () => {
    if (!viewBooking) return null;

    const dialogFooter = (
      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button 
          variant="secondary"
          onClick={() => setShowCancelDialog(false)}
        >
          Không, giữ lại
        </Button>
        <Button 
          variant="danger"
          onClick={handleCancelBooking}
          disabled={loading}
        >
          Xác nhận hủy
        </Button>
      </div>
    );
    
    return (
      <Dialog
        header="Xác nhận hủy đặt lịch"
        visible={showCancelDialog}
        style={{ width: '30vw' }}
        breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        onHide={() => setShowCancelDialog(false)}
        footer={dialogFooter}
      >
        <p>Bạn có chắc chắn muốn hủy đặt lịch này không?</p>
        <Form.Group className="mb-3">
          <Form.Label>Lý do hủy</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Vui lòng nhập lý do hủy đặt lịch"
          />
        </Form.Group>
      </Dialog>
    );
  };
  
  // Thêm CSS cho dialog
  const styles = `
    .booking-detail-dialog .detail-section {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 1.25rem;
      height: 100%;
    }

    .booking-detail-dialog .detail-header {
      color: #0d6efd;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 0.5rem;
    }

    .booking-detail-dialog .detail-row {
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      font-size: 0.95rem;
    }

    .booking-detail-dialog .detail-row strong {
      min-width: 110px;
      color: #495057;
    }

    .booking-detail-dialog .dialog-footer {
      border-top: 1px solid #e9ecef;
      padding-top: 1rem;
    }

    .booking-detail-dialog .dialog-footer .btn {
      min-width: 120px;
      font-weight: 500;
    }

    .booking-detail-dialog .p-dialog-content {
      padding-bottom: 1.5rem;
    }
  `;

  // Thêm style vào component
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);
  
  return (
    <Container className="py-4">
      <Toast ref={toast} />
      
      <Breadcrumb className="custom-breadcrumb mb-4">
        <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item active>Lịch hẹn của tôi</Breadcrumb.Item>
      </Breadcrumb>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Lịch sử đặt lịch</h2>
      </div>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col lg={2}>
              <Form.Group className="mb-0">
                <Form.Label>Tìm kiếm</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col lg={2}>
              <Form.Group className="mb-0">
                <Form.Label>Trạng thái</Form.Label>
                <Dropdown
                  value={filter}
                  options={[
                    { label: 'Tất cả', value: 'all' },
                    { label: 'Chờ xác nhận', value: 'Pending' },
                    { label: 'Đang xử lý', value: 'Processing' },
                    { label: 'Hoàn thành', value: 'Completed' },
                    { label: 'Đã hủy', value: 'Cancel' }
                  ]}
                  onChange={(e) => setFilter(e.value)}
                  placeholder="Trạng thái"
                  className="w-100"
                />
              </Form.Group>
            </Col>
            <Col lg={2}>
              <Form.Group className="mb-0">
                <Form.Label>Ngày hẹn</Form.Label>
                <Calendar
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-100"
                />
              </Form.Group>
            </Col>
            <Col lg={2}>
              <Form.Group className="mb-0">
                <Form.Label>Dịch vụ</Form.Label>
                <Dropdown
                  value={selectedService}
                  options={services}
                  onChange={(e) => setSelectedService(e.value)}
                  placeholder="Dịch vụ"
                  className="w-100"
                />
              </Form.Group>
            </Col>
            <Col lg={2}>
              <Form.Group className="mb-0">
                <Form.Label>Thú cưng</Form.Label>
                <Dropdown
                  value={selectedPet}
                  options={pets}
                  onChange={(e) => setSelectedPet(e.value)}
                  placeholder="Thú cưng"
                  className="w-100"
                />
              </Form.Group>
            </Col>
            <Col lg="auto">
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card className="shadow-sm">
        <Card.Body>
          <div className="mb-3">
            <span>Tổng số: {filteredBookings.length}</span>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <Loading />
            </div>
          ) : (
            <DataTable 
              value={filteredBookings}
              emptyMessage="Không tìm thấy lịch đặt nào"
              responsiveLayout="scroll"
              className="booking-table"
              style={{ width: '100%' }}
            >
              <Column 
                field="_id" 
                header="Mã đặt lịch" 
                style={{ width: '12%' }}
                body={(rowData) => rowData._id.substring(0, 8) + '...'}
              />
              <Column 
                field="createdAt" 
                header="Ngày đặt" 
                style={{ width: '10%' }}
                body={(rowData) => formatDate(rowData.createdAt)} 
              />
              <Column 
                field="appointment_date" 
                header="Ngày hẹn" 
                style={{ width: '10%' }}
                body={(rowData) => formatDate(rowData.appointment_date)} 
              />
              <Column 
                field="time" 
                header="Giờ hẹn" 
                style={{ width: '8%', textAlign: 'center' }}
                body={(rowData) => formatTimeSlot(rowData)} 
              />
              <Column 
                field="service_type.name" 
                header="Dịch vụ" 
                style={{ width: '18%' }}
              />
              <Column 
                field="petId.name" 
                header="Thú cưng" 
                style={{ width: '15%' }}
                body={(rowData) => (
                  <div>
                    {rowData.petId?.name}
                    <br />
                    <span style={{ fontSize: '0.85em', color: '#666' }}>
                      {rowData.petId?.species}
                    </span>
                  </div>
                )}
              />
              <Column 
                field="order_status" 
                header="Trạng thái" 
                style={{ width: '12%', textAlign: 'center' }}
                body={(rowData) => (
                  <span style={{ 
                    color: rowData.order_status === 'Pending' ? '#ffc107' 
                          : rowData.order_status === 'Processing' ? '#0dcaf0'
                          : rowData.order_status === 'Completed' ? '#198754'
                          : rowData.order_status === 'Cancel' ? '#dc3545'
                          : '#6c757d',
                    fontWeight: 500
                  }}>
                    {getStatusText(rowData.order_status)}
                  </span>
                )}
              />
              <Column 
                header="Thao tác" 
                style={{ width: '15%' }}
                body={(rowData) => (
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    width: '100%'
                  }}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      style={{ width: '80px' }}
                      onClick={() => handleViewBooking(rowData._id)}
                    >
                      Chi tiết
                    </Button>
                    {(rowData.order_status === 'Pending' || rowData.order_status === 'Processing') && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        style={{ width: '80px' }}
                        onClick={() => {
                          setViewBooking(rowData);
                          setShowCancelDialog(true);
                        }}
                      >
                        Hủy
                      </Button>
                    )}
                  </div>
                )}
              />
            </DataTable>
          )}
        </Card.Body>
      </Card>
      
      {renderViewDialog()}
      {renderCancelDialog()}
    </Container>
  );
};

export default UserBookings;
