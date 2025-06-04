import React from 'react';
import { Row, Col, Form, InputGroup, Card } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';

const BookingFilters = ({
  filter,
  setFilter,
  selectedService,
  setSelectedService,
  selectedDate,
  setSelectedDate,
  searchTerm,
  setSearchTerm,
  services,
  statusOptions
}) => {
  return (
    <Card className="mb-4 booking-filter-card">
      <Card.Body>
        <Row>
          <Col md={3}>
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
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Dịch vụ</Form.Label>
              <Dropdown
                value={selectedService}
                options={services}
                onChange={(e) => setSelectedService(e.value)}
                optionLabel="name"
                optionValue="_id"
                placeholder="Chọn dịch vụ"
                className="w-100"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
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
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Tìm kiếm</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo tên, SĐT, email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default BookingFilters; 