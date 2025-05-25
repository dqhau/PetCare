import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import { Check2Circle, XCircle } from 'react-bootstrap-icons';
import axiosInstance from '../../utils/axiosConfig';

const AddVaccination = ({ visible, setVisible, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [vaccineType, setVaccineType] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [userPets, setUserPets] = useState([]);
  const toast = useRef(null);

  // Common vaccine types
  const vaccineTypes = [
    { label: 'Rabies (Dại)', value: 'Rabies' },
    { label: 'DHPPi (Bệnh Care)', value: 'DHPPi' },
    { label: 'Bordetella (Ho Kennel)', value: 'Bordetella' },
    { label: 'Lepto (Bệnh Lepto)', value: 'Lepto' },
    { label: 'Khác', value: 'Other' }
  ];

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users');
        const formattedUsers = response.data.map(user => ({
          label: user.fullname || user.username,
          value: user._id,
          data: user
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Không thể tải danh sách người dùng', 
          life: 3000 
        });
      }
    };

    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  // Fetch pets when user is selected
  useEffect(() => {
    const fetchPets = async () => {
      if (!selectedUser) {
        setPets([]);
        setUserPets([]);
        return;
      }

      try {
        const response = await axiosInstance.get(`/pets/user/${selectedUser.value}`);
        const formattedPets = response.data.map(pet => ({
          label: `${pet.name} (${pet.species})`,
          value: pet._id,
          data: pet
        }));
        setPets(formattedPets);
        setUserPets(response.data);
      } catch (error) {
        console.error('Error fetching pets:', error);
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Không thể tải danh sách thú cưng', 
          life: 3000 
        });
      }
    };

    fetchPets();
  }, [selectedUser]);

  // Fetch bookings when user is selected
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedUser) {
        setBookings([]);
        return;
      }

      try {
        const response = await axiosInstance.get(`/booking/user/${selectedUser.value}`);
        const formattedBookings = response.data
          .filter(booking => booking.order_status === 'Completed')
          .map(booking => ({
            label: `${new Date(booking.appointment_date).toLocaleDateString('vi-VN')} - ${booking.time_slot}:00`,
            value: booking._id,
            data: booking
          }));
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.current?.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Không thể tải danh sách đặt lịch', 
          life: 3000 
        });
      }
    };

    fetchBookings();
  }, [selectedUser]);

  const handleSubmit = async () => {
    if (!selectedUser || !selectedPet || !vaccineType || !date) {
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: 'Vui lòng điền đầy đủ thông tin bắt buộc', 
        life: 3000 
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: selectedUser.value,
        petId: selectedPet.value,
        vaccineType: vaccineType === 'Other' ? notes : vaccineType,
        date: date.toISOString(),
        notes: notes,
        bookingId: selectedBooking ? selectedBooking.value : null
      };

      const response = await axiosInstance.post('/vaccination', payload);
      
      if (response.status === 201) {
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Thành công', 
          detail: 'Đã thêm lịch sử tiêm phòng thành công', 
          life: 3000 
        });
        
        // Reset form
        setSelectedUser(null);
        setSelectedPet(null);
        setSelectedBooking(null);
        setVaccineType('');
        setDate(new Date());
        setNotes('');
        
        // Close dialog and refresh parent component
        setVisible(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error adding vaccination record:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: error.response?.data?.message || 'Không thể thêm lịch sử tiêm phòng', 
        life: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  const onHide = () => {
    setVisible(false);
  };

  const dialogFooter = (
    <div className="d-flex justify-content-end gap-2">
      <Button
        label="Thêm"
        icon="pi pi-check"
        className="p-button-success"
        onClick={handleSubmit}
        disabled={loading}
      />
      <Button
        label="Đóng"
        icon="pi pi-times"
        className="p-button-secondary"
        onClick={onHide}
        disabled={loading}
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Thêm lịch sử tiêm phòng"
        visible={visible}
        style={{ width: '650px', maxWidth: '95vw' }}
        onHide={onHide}
        footer={dialogFooter}
        modal
        className="vaccination-dialog"
        draggable={false}
        resizable={false}
      >
        {loading && (
          <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{zIndex: 1, top: 0, left: 0}}>
            <Spinner animation="border" variant="primary" size="sm" />
            <span className="ms-2">Đang xử lý...</span>
          </div>
        )}
        
        <Form className="mt-2">
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Người dùng <span className="text-danger">*</span></Form.Label>
                <Dropdown
                  value={selectedUser}
                  options={users}
                  onChange={(e) => setSelectedUser(e.value)}
                  placeholder="Chọn người dùng"
                  className="w-100"
                  filter
                  showClear
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Thú cưng <span className="text-danger">*</span></Form.Label>
                <Dropdown
                  value={selectedPet}
                  options={pets}
                  onChange={(e) => setSelectedPet(e.value)}
                  placeholder={!selectedUser ? "Chọn người dùng trước" : "Chọn thú cưng"}
                  className="w-100"
                  disabled={!selectedUser}
                  filter
                  showClear
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Loại vaccine <span className="text-danger">*</span></Form.Label>
                <Dropdown
                  value={vaccineType}
                  options={vaccineTypes}
                  onChange={(e) => setVaccineType(e.value)}
                  placeholder="Chọn loại vaccine"
                  className="w-100"
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold">Ngày tiêm <span className="text-danger">*</span></Form.Label>
                <Calendar
                  value={date}
                  onChange={(e) => setDate(e.value)}
                  dateFormat="dd/mm/yy"
                  showIcon
                  className="w-100"
                  maxDate={new Date()}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Liên kết với đặt lịch</Form.Label>
            <Dropdown
              value={selectedBooking}
              options={bookings}
              onChange={(e) => setSelectedBooking(e.value)}
              placeholder={!selectedUser ? "Chọn người dùng trước" : "Chọn lịch đặt (không bắt buộc)"}
              className="w-100"
              disabled={!selectedUser}
              showClear
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Ghi chú {vaccineType === 'Other' && <span className="text-danger">*</span>}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú hoặc tên vaccine khác"
            />
          </Form.Group>
        </Form>
      </Dialog>
    </>
  );
};

export default AddVaccination;
