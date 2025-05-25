import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, InputGroup, Alert } from 'react-bootstrap';
import { PenFill, PlusCircleFill, Trash, Search } from 'react-bootstrap-icons';
import axiosInstance from '../../utils/axiosConfig';
import { Toast } from 'primereact/toast';
import AddVaccination from './AddVaccination';
import EditVaccination from './EditVaccination';

const VaccinationManagement = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const toast = useRef(null);

  // Fetch all vaccination records
  const fetchVaccinations = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/vaccination');
      setVaccinations(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching vaccination records:', error);
      setError('Không thể tải lịch sử tiêm phòng. Vui lòng thử lại sau.');
      
      if (error.response && error.response.status === 401) {
        // Handle unauthorized access
        toast.current.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 
          life: 3000 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    fetchVaccinations();
  }, [refreshTrigger]);

  // Handle edit vaccination
  const handleEditVaccination = (vaccination) => {
    setSelectedVaccination(vaccination);
    setShowEditDialog(true);
  };

  // Handle delete vaccination
  const handleDeleteVaccination = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử tiêm phòng này?')) {
      try {
        await axiosInstance.delete(`/vaccination/${id}`);
        toast.current.show({ 
          severity: 'success', 
          summary: 'Thành công', 
          detail: 'Đã xóa lịch sử tiêm phòng thành công', 
          life: 3000 
        });
        refreshData();
      } catch (error) {
        console.error('Error deleting vaccination record:', error);
        toast.current.show({ 
          severity: 'error', 
          summary: 'Lỗi', 
          detail: 'Không thể xóa lịch sử tiêm phòng', 
          life: 3000 
        });
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Filter vaccinations based on search term
  const filteredVaccinations = vaccinations.filter(vaccination => {
    const searchTermLower = searchTerm.toLowerCase();
    const vaccineType = vaccination.vaccineType.toLowerCase();
    const notes = vaccination.notes ? vaccination.notes.toLowerCase() : '';
    const userName = vaccination.userId ? 
      (vaccination.userId.fullname || vaccination.userId.username || '').toLowerCase() : '';
    
    return vaccineType.includes(searchTermLower) || 
           notes.includes(searchTermLower) || 
           userName.includes(searchTermLower);
  });

  return (
    <Container fluid className="px-4 py-3">
      <Toast ref={toast} />
      
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">Lịch sử tiêm phòng</h5>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setShowAddDialog(true)}
            className="d-flex align-items-center"
          >
            <PlusCircleFill className="me-2" />
            Thêm mới
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <InputGroup size="sm">
                <Form.Control
                  placeholder="Tìm kiếm theo loại vaccine, ghi chú, tên người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <InputGroup.Text>
                  <Search />
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2 small text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="py-2 small">{error}</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped hover size="sm" className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th width="5%">#</th>
                    <th width="20%">Người dùng</th>
                    <th width="20%">Loại vaccine</th>
                    <th width="15%">Ngày tiêm</th>
                    <th width="25%">Ghi chú</th>
                    <th width="15%" className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVaccinations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-3 text-muted">Không có dữ liệu</td>
                    </tr>
                  ) : (
                    filteredVaccinations.map((vaccination, index) => (
                      <tr key={vaccination._id}>
                        <td>{index + 1}</td>
                        <td>
                          {vaccination.userId ? 
                            (vaccination.userId.fullname || vaccination.userId.username) : 
                            'N/A'}
                        </td>
                        <td>{vaccination.vaccineType}</td>
                        <td>{formatDate(vaccination.date)}</td>
                        <td className="text-truncate" style={{maxWidth: "250px"}}>
                          {vaccination.notes || '-'}
                        </td>
                        <td className="text-center">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-1 p-1"
                            onClick={() => handleEditVaccination(vaccination)}
                            title="Chỉnh sửa"
                          >
                            <PenFill size={14} />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="p-1"
                            onClick={() => handleDeleteVaccination(vaccination._id)}
                            title="Xóa"
                          >
                            <Trash size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Add Vaccination Dialog */}
      {showAddDialog && (
        <AddVaccination 
          visible={showAddDialog} 
          setVisible={setShowAddDialog} 
          onSuccess={refreshData}
        />
      )}
      
      {/* Edit Vaccination Dialog */}
      {showEditDialog && selectedVaccination && (
        <EditVaccination
          visible={showEditDialog}
          setVisible={setShowEditDialog}
          vaccination={selectedVaccination}
          onSuccess={refreshData}
        />
      )}
    </Container>
  );
};

export default VaccinationManagement;
