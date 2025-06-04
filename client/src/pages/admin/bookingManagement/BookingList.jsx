import React from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';

const BookingList = ({
  loading,
  filteredBookings,
  handleViewBooking,
  handleUpdateStatus,
  openChangeTimeslotDialog,
  formatDate,
  formatTimeSlot,
  getStatusBadge,
  totalBookings,
  resetFilters
}) => {
  return (
    <Card className="booking-list-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Danh sách đặt lịch</h5>
          <div>
            <span className="me-2">
              Tổng số: <Badge bg="primary">{totalBookings}</Badge>
            </span>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={resetFilters}
              disabled={loading}
            >
              <i className="pi pi-refresh me-2"></i>
              Làm mới
            </Button>
          </div>
        </div>

        <div className="table-responsive">
          <Table hover className="booking-table">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>ID</th>
                <th style={{ width: '15%' }}>Khách hàng</th>
                <th style={{ width: '15%' }}>Dịch vụ</th>
                <th style={{ width: '10%' }}>Thú cưng</th>
                <th style={{ width: '12%' }}>Ngày hẹn</th>
                <th style={{ width: '8%' }}>Giờ</th>
                <th style={{ width: '10%' }}>Trạng thái</th>
                <th style={{ width: '25%' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    Không tìm thấy đặt lịch nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {booking._id}
                    </td>
                    <td>
                      <div>{booking.userId?.fullname}</div>
                      <small className="text-muted">{booking.userId?.phone}</small>
                    </td>
                    <td>{booking.service_type?.name || booking.serviceId?.name || 'N/A'}</td>
                    <td>
                      <div>{booking.petId?.name || 'Không có thông tin'}</div>
                      <small className="text-muted">{booking.petId?.species || ''}</small>
                    </td>
                    <td>{booking.appointment_date ? formatDate(booking.appointment_date) : 'N/A'}</td>
                    <td className="text-center">{formatTimeSlot(booking)}</td>
                    <td className="text-center">{getStatusBadge(booking.order_status)}</td>
                    <td>
                      <div className="d-flex gap-1 flex-nowrap" style={{ minWidth: '200px' }}>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewBooking(booking._id)}
                        >
                          Chi tiết
                        </Button>
                        
                        {booking.order_status === 'Pending' && (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleUpdateStatus(booking._id, 'Processing')}
                            >
                              Xác nhận
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleUpdateStatus(booking._id, 'Cancel')}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                        
                        {booking.order_status === 'Processing' && (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                            >
                              Hoàn thành
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openChangeTimeslotDialog(booking._id, booking.appointment_date)}
                            >
                              Đổi giờ
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookingList; 