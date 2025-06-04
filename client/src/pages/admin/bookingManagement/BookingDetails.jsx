import React from 'react';
import { Row, Col, Table, Button } from 'react-bootstrap';
import { Dialog } from 'primereact/dialog';

const BookingDetails = ({
  viewBooking,
  showViewDialog,
  setShowViewDialog,
  handleUpdateStatus,
  formatDate,
  formatTimeSlot,
  getStatusBadge
}) => {
  if (!viewBooking) return null;

  const renderFooter = () => (
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
  );

  return (
    <Dialog 
      header="Chi tiết đặt lịch" 
      visible={showViewDialog} 
      style={{ width: '70vw' }} 
      onHide={() => setShowViewDialog(false)}
      footer={renderFooter()}
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
                  <td>{viewBooking.service_type?.price?.toLocaleString('vi-VN')} VNĐ</td>
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

export default BookingDetails; 