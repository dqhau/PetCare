import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert } from 'react-bootstrap';
import axiosInstance from "../utils/axiosConfig";

// Helper function to translate status names
const getStatusName = (status) => {
  switch (status) {
    case 'Pending': return 'Đang chờ';
    case 'Processing': return 'Đang xử lý';
    case 'Completed': return 'Hoàn thành';
    case 'Cancel': return 'Đã hủy';
    default: return status;
  }
};

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/statistics/dashboard');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container fluid className="mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu thống kê...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <h4 className="mb-4">Thống kê tổng quan</h4>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h2 className="text-primary">{stats?.totalUsers || 0}</h2>
              <Card.Title>Người dùng</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h2 className="text-success">{stats?.totalPets || 0}</h2>
              <Card.Title>Thú cưng</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h2 className="text-info">{stats?.totalBookings || 0}</h2>
              <Card.Title>Đặt lịch</Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h2 className="text-warning">{stats?.totalServices || 0}</h2>
              <Card.Title>Dịch vụ</Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header>Thống kê đặt lịch theo trạng thái</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Trạng thái</th>
                    <th>Số lượng</th>
                    <th>Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.bookingsByStatus ? (
                    Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                      <tr key={status}>
                        <td>{getStatusName(status)}</td>
                        <td>{count}</td>
                        <td>
                          {stats.totalBookings ? 
                            `${Math.round((count / stats.totalBookings) * 100)}%` : 
                            '0%'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>Dịch vụ được đặt nhiều nhất</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên dịch vụ</th>
                    <th>Số lượng đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.topServices?.map((service, index) => (
                    <tr key={service.id}>
                      <td>{index + 1}</td>
                      <td>{service.name}</td>
                      <td>{service.count}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="3" className="text-center">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Statistics;
