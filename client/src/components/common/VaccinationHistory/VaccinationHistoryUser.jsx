import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Alert, Badge } from 'react-bootstrap';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import axiosInstance from '../../utils/axiosConfig';

const VaccinationHistoryUser = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useRef(null);
  const userId = localStorage.getItem('userId');

  // Fetch user's pets
  useEffect(() => {
    const fetchPets = async () => {
      if (!userId) {
        setError('Bạn cần đăng nhập để xem lịch sử tiêm phòng');
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/pets/user/${userId}`);
        
        if (response.data.length === 0) {
          setError('Bạn chưa có thú cưng nào. Vui lòng thêm thú cưng trước.');
          setPets([]);
        } else {
          const formattedPets = response.data.map(pet => ({
            label: `${pet.name} (${pet.species})`,
            value: pet._id,
            data: pet
          }));
          setPets(formattedPets);
          
          // Auto-select the first pet
          if (formattedPets.length > 0 && !selectedPet) {
            setSelectedPet(formattedPets[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
        setError('Không thể tải danh sách thú cưng. Vui lòng thử lại sau.');
        
        if (error.response && error.response.status === 401) {
          toast.current?.show({
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

    fetchPets();
  }, [userId]);

  // Fetch vaccination history when a pet is selected
  useEffect(() => {
    const fetchVaccinations = async () => {
      if (!selectedPet) return;

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/vaccination/pet/${selectedPet.value}`);
        setVaccinations(response.data);
        
        if (response.data.length === 0) {
          setError(`Thú cưng ${selectedPet.label} chưa có lịch sử tiêm phòng nào.`);
        } else {
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching vaccination history:', error);
        setError('Không thể tải lịch sử tiêm phòng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedPet) {
      fetchVaccinations();
    }
  }, [selectedPet]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Calculate next vaccination due date (typically 1 year for most vaccines)
  const calculateNextDueDate = (dateString) => {
    const vaccinationDate = new Date(dateString);
    const nextDueDate = new Date(vaccinationDate);
    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
    
    return nextDueDate;
  };

  // Check if vaccination is due soon (within 30 days)
  const isDueSoon = (nextDueDate) => {
    const today = new Date();
    const daysUntilDue = Math.floor((nextDueDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 30 && daysUntilDue >= 0;
  };

  // Check if vaccination is overdue
  const isOverdue = (nextDueDate) => {
    const today = new Date();
    return nextDueDate < today;
  };

  return (
    <Container className="mt-4">
      <Toast ref={toast} />
      
      <Row className="mb-4">
        <Col>
          <h4>Lịch sử tiêm phòng</h4>
          <p className="text-muted">Xem lịch sử tiêm phòng và lịch tiêm nhắc lại cho thú cưng của bạn</p>
        </Col>
      </Row>
      
      {!userId ? (
        <Alert variant="warning">
          Bạn cần đăng nhập để xem lịch sử tiêm phòng của thú cưng.
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            {pets.length > 0 ? (
              <>
                <Row className="mb-4">
                  <Col md={6}>
                    <label className="mb-2">Chọn thú cưng</label>
                    <Dropdown
                      value={selectedPet}
                      options={pets}
                      onChange={(e) => setSelectedPet(e.value)}
                      placeholder="Chọn thú cưng"
                      className="w-100"
                    />
                  </Col>
                </Row>
                
                {loading ? (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải dữ liệu...</p>
                  </div>
                ) : error ? (
                  <Alert variant="info">{error}</Alert>
                ) : (
                  <>
                    <h5 className="mb-3">Lịch sử tiêm phòng của {selectedPet?.label}</h5>
                    <Table responsive striped bordered hover>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Loại vaccine</th>
                          <th>Ngày tiêm</th>
                          <th>Ngày tiêm nhắc lại</th>
                          <th>Trạng thái</th>
                          <th>Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vaccinations.map((vaccination, index) => {
                          const nextDueDate = calculateNextDueDate(vaccination.date);
                          const dueSoon = isDueSoon(nextDueDate);
                          const overdue = isOverdue(nextDueDate);
                          
                          return (
                            <tr key={vaccination._id}>
                              <td>{index + 1}</td>
                              <td>{vaccination.vaccineType}</td>
                              <td>{formatDate(vaccination.date)}</td>
                              <td>{formatDate(nextDueDate)}</td>
                              <td>
                                {overdue ? (
                                  <Badge bg="danger">Quá hạn</Badge>
                                ) : dueSoon ? (
                                  <Badge bg="warning">Sắp đến hạn</Badge>
                                ) : (
                                  <Badge bg="success">Đã tiêm</Badge>
                                )}
                              </td>
                              <td>{vaccination.notes || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                    
                    <div className="mt-4">
                      <h6>Chú thích:</h6>
                      <ul className="list-unstyled">
                        <li><Badge bg="success">Đã tiêm</Badge> - Vaccine còn hiệu lực</li>
                        <li><Badge bg="warning">Sắp đến hạn</Badge> - Cần tiêm nhắc lại trong vòng 30 ngày tới</li>
                        <li><Badge bg="danger">Quá hạn</Badge> - Đã quá thời hạn tiêm nhắc lại, cần tiêm ngay</li>
                      </ul>
                    </div>
                  </>
                )}
              </>
            ) : (
              <Alert variant="info">
                {error || 'Đang tải danh sách thú cưng...'}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default VaccinationHistoryUser;
