import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Form, Button } from 'react-bootstrap';
import axiosInstance from "../utils/axiosConfig";
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  
  // Thêm state cho bộ lọc thời gian
  const [timeFilter, setTimeFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Lấy ngày hiện tại và định dạng thành chuỗi YYYY-MM-DD
  const today = new Date();
  const formattedToday = today.toISOString().split('T')[0];
  
  // Tính ngày đầu tháng
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const formattedFirstDayOfMonth = firstDayOfMonth.toISOString().split('T')[0];
  
  // Tính ngày đầu năm
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const formattedFirstDayOfYear = firstDayOfYear.toISOString().split('T')[0];


  // Hàm xử lý khi thay đổi bộ lọc thời gian
  const handleTimeFilterChange = (e) => {
    setTimeFilter(e.target.value);
  };

  // Hàm xử lý khi thay đổi ngày bắt đầu tùy chỉnh
  const handleStartDateChange = (e) => {
    setCustomDateRange(prev => ({
      ...prev,
      startDate: e.target.value
    }));
  };

  // Hàm xử lý khi thay đổi ngày kết thúc tùy chỉnh
  const handleEndDateChange = (e) => {
    setCustomDateRange(prev => ({
      ...prev,
      endDate: e.target.value
    }));
  };

  // Hàm xử lý khi nhấn nút áp dụng bộ lọc
  const applyFilter = () => {
    fetchStats();
  };

  // Xây dựng tham số truy vấn dựa trên bộ lọc thời gian
  const buildQueryParams = () => {
    let params = {};
    
    switch (timeFilter) {
      case 'today':
        params = { startDate: formattedToday, endDate: formattedToday };
        break;
      case 'thisMonth':
        params = { startDate: formattedFirstDayOfMonth, endDate: formattedToday };
        break;
      case 'thisYear':
        params = { startDate: formattedFirstDayOfYear, endDate: formattedToday };
        break;
      case 'custom':
        if (customDateRange.startDate && customDateRange.endDate) {
          params = { startDate: customDateRange.startDate, endDate: customDateRange.endDate };
        }
        break;
      default: // 'all'
        // Không thêm tham số ngày
        break;
    }
    
    return params;
  };

  // Hàm lấy dữ liệu thống kê từ server
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Xây dựng tham số truy vấn
      const params = buildQueryParams();
      
      // Thêm tham số vào URL nếu có
      const response = await axiosInstance.get('/statistics/dashboard', { params });
      setStats(response.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  useEffect(() => {
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Thống kê tổng quan</h4>
        
        <div className="d-flex align-items-center">
          <Form.Group className="me-3" style={{ minWidth: '200px' }}>
            <Form.Select value={timeFilter} onChange={handleTimeFilterChange}>
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="thisMonth">Tháng này</option>
              <option value="thisYear">Năm nay</option>
              <option value="custom">Tùy chỉnh</option>
            </Form.Select>
          </Form.Group>
          
          {timeFilter === 'custom' && (
            <>
              <Form.Group className="me-2">
                <Form.Control 
                  type="date" 
                  value={customDateRange.startDate} 
                  onChange={handleStartDateChange} 
                  placeholder="Ngày bắt đầu"
                />
              </Form.Group>
              <Form.Group className="me-2">
                <Form.Control 
                  type="date" 
                  value={customDateRange.endDate} 
                  onChange={handleEndDateChange} 
                  placeholder="Ngày kết thúc"
                />
              </Form.Group>
            </>
          )}
          
          <Button variant="primary" onClick={applyFilter}>
            Áp dụng
          </Button>
        </div>
      </div>
      
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
        <Col md={6}>
          <Card>
            <Card.Header>Thống kê đặt lịch theo trạng thái</Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                {stats?.bookingsByStatus ? (
                  <Doughnut
                    data={{
                      labels: Object.keys(stats.bookingsByStatus).map(status => getStatusName(status)),
                      datasets: [
                        {
                          data: Object.values(stats.bookingsByStatus),
                          backgroundColor: [
                            'rgba(255, 193, 7, 0.8)',  // Pending - yellow
                            'rgba(33, 150, 243, 0.8)', // Processing - blue
                            'rgba(76, 175, 80, 0.8)',  // Completed - green
                            'rgba(244, 67, 54, 0.8)',  // Cancelled - red
                          ],
                          borderColor: [
                            'rgba(255, 193, 7, 1)',
                            'rgba(33, 150, 243, 1)',
                            'rgba(76, 175, 80, 1)',
                            'rgba(244, 67, 54, 1)',
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      },
                    }}
                  />
                ) : (
                  <div className="text-center p-5">Không có dữ liệu</div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>Dịch vụ được đặt nhiều nhất</Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                {stats?.topServices && stats.topServices.length > 0 ? (
                  <Bar
                    data={{
                      labels: stats.topServices.map(service => service.name),
                      datasets: [
                        {
                          label: 'Số lượng đặt',
                          data: stats.topServices.map(service => service.count),
                          backgroundColor: 'rgba(54, 162, 235, 0.8)',
                          borderColor: 'rgba(54, 162, 235, 1)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      indexAxis: 'y',
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="text-center p-5">Không có dữ liệu</div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Statistics;
