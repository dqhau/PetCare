import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Form, Row, Col, Spinner } from 'react-bootstrap';
import { Check2Circle, XCircle } from 'react-bootstrap-icons';
import axiosInstance from '../../utils/axiosConfig';

const EditVaccination = ({ visible, setVisible, vaccination, onSuccess }) => {
  const [vaccineType, setVaccineType] = useState('');
  const [date, setDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  // Common vaccine types
  const vaccineTypes = [
    { label: 'Rabies (Dại)', value: 'Rabies' },
    { label: 'DHPPi (Bệnh Care)', value: 'DHPPi' },
    { label: 'Bordetella (Ho Kennel)', value: 'Bordetella' },
    { label: 'Lepto (Bệnh Lepto)', value: 'Lepto' },
    { label: 'Khác', value: 'Other' }
  ];

  // Initialize form with vaccination data
  useEffect(() => {
    if (vaccination) {
      // Check if the vaccine type is in our predefined list
      const foundType = vaccineTypes.find(type => type.value === vaccination.vaccineType);
      setVaccineType(foundType ? vaccination.vaccineType : 'Other');
      setDate(new Date(vaccination.date));
      setNotes(vaccination.notes || '');
    }
  }, [vaccination]);

  const handleSubmit = async () => {
    if (!vaccineType || !date) {
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
        vaccineType: vaccineType === 'Other' ? notes : vaccineType,
        date: date.toISOString(),
        notes: notes
      };

      const response = await axiosInstance.put(`/vaccination/${vaccination._id}`, payload);
      
      if (response.status === 200) {
        toast.current?.show({ 
          severity: 'success', 
          summary: 'Thành công', 
          detail: 'Đã cập nhật lịch sử tiêm phòng thành công', 
          life: 3000 
        });
        
        // Close dialog and refresh parent component
        setVisible(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error updating vaccination record:', error);
      toast.current?.show({ 
        severity: 'error', 
        summary: 'Lỗi', 
        detail: error.response?.data?.message || 'Không thể cập nhật lịch sử tiêm phòng', 
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
        label="Lưu"
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
        header="Chỉnh sửa lịch sử tiêm phòng"
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

export default EditVaccination;
