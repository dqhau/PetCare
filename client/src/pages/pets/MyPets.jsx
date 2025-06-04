import React, { useState, useEffect } from "react";
import { Row, Col, Button, Modal, Form, Breadcrumb, Card, Badge, Nav, Table } from "react-bootstrap";
import { FaEdit, FaTrash, FaEye, FaPaw, FaDog, FaCat, FaWeight, FaCalendarAlt, FaVenusMars, FaImage, FaInfoCircle, FaSave, FaTimes, FaPlus, FaSyringe } from "../../utils/IconProvider";
import { uploadImageToCloudinary } from "../../utils/uploadUtils";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/components.css"; // Import CSS hợp nhất cho components
import Loading from "../../components/common/Loading";
import { vaccinationService, petService } from "../../utils/apiServices"; // Import các service

function MyPets() {
  const userId = localStorage.getItem("userId");
  
  // pets state
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [errorPets, setErrorPets] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // modal for add/edit pet
  const [showPetModal, setShowPetModal] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [currentPet, setCurrentPet] = useState({
    _id: "",
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    vaccinated: false,
    notes: "",
    weight: 0,
    image: ""
  });
  const [selectedFile, setSelectedFile] = useState(null);
  
  // modal for view pet details
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailPet, setDetailPet] = useState(null);
  
  // States quản lý cho tính năng lịch sử tiêm chủng
  const [activeTab, setActiveTab] = useState('details'); // Quản lý tab đang được chọn (details hoặc vaccinations)
  const [vaccinations, setVaccinations] = useState([]); // Lưu trữ danh sách lịch sử tiêm chủng
  const [loadingVaccinations, setLoadingVaccinations] = useState(false); // Trạng thái đang tải dữ liệu tiêm chủng
  const [vaccinationError, setVaccinationError] = useState(null); // Lưu trữ lỗi khi tải dữ liệu tiêm chủng

  const loadPets = () => {
    if (!userId) {
      console.error('User ID is not defined');
      return;
    }
    setLoadingPets(true);
    petService.getPetsByUserId(userId)
      .then((response) => {
        setPets(Array.isArray(response.data) ? response.data : []);
      })
      .catch((err) => {
        console.error("Error fetching pets:", err);
        // Improve error handling for toast
        if (err && err.response && err.response.data && err.response.data.message) {
          toast.error("Lỗi: " + err.response.data.message);
        } else {
          toast.error("Không thể tải dữ liệu thú cưng. Vui lòng thử lại sau.");
        }
        setErrorPets("Không thể tải dữ liệu thú cưng. Vui lòng thử lại sau.");
      })
      .finally(() => {
        setLoadingPets(false);
      });
  };

  useEffect(() => {
    if (userId) {
      loadPets();
    } else {
      setErrorPets("Vui lòng đăng nhập để xem thú cưng của bạn");
      setLoadingPets(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // handlers for pet modal open/close
  const openAddPetModal = () => {
    setIsEditingPet(false);
    setCurrentPet({
      name: "",
      species: "",
      breed: "",
      age: "",
      gender: "",
      vaccinated: false,
      notes: "",
      weight: 0,
      image: ""
    });
    setSelectedFile(null);
    setShowPetModal(true);
  };

  const openEditPetModal = (pet) => {
    setIsEditingPet(true);
    setCurrentPet({
      ...pet,
    });
    setSelectedFile(null);
    setShowPetModal(true);
  };

  const closePetModal = () => {
    setShowPetModal(false);
  };
  
  /**
   * Mở modal xem chi tiết thú cưng và tự động tải lịch sử tiêm chủng
   * @param {string} petId - ID của thú cưng cần xem chi tiết
   */
  const openDetailModal = async (petId) => {
    try {
      // Reset các states liên quan đến modal và dữ liệu tiêm chủng
      setActiveTab('details'); // Reset về tab thông tin chi tiết khi mở modal
      setLoadingVaccinations(false); // Reset trạng thái tải dữ liệu tiêm chủng
      setVaccinationError(null); // Reset lỗi dữ liệu tiêm chủng
      setVaccinations([]); // Reset danh sách dữ liệu tiêm chủng
      
      // Tải thông tin chi tiết thú cưng
      const response = await petService.getPetById(petId, userId);
      setDetailPet(response.data);
      setShowDetailModal(true);

      // Tải dữ liệu lịch sử tiêm chủng trong nền (background)
      // Để người dùng có thể xem thông tin chi tiết trước khi chuyển sang tab tiêm chủng
      loadVaccinationHistory(petId);
    } catch (error) {
      console.error("Error fetching pet details:", error);
      toast.error("Lỗi: " + (error.response?.data?.message || error.message || "Không thể tải thông tin thú cưng"));
    }
  };
  
  /**
   * Đóng modal chi tiết thú cưng và reset các states liên quan
   */
  const closeDetailModal = () => {
    setShowDetailModal(false); // Đóng modal
    setDetailPet(null); // Xóa dữ liệu chi tiết thú cưng
    setActiveTab('details'); // Reset về tab mặc định
    setVaccinations([]); // Xóa dữ liệu lịch sử tiêm chủng
    setVaccinationError(null); // Xóa lỗi nếu có
  };

  /**
   * Tải lịch sử tiêm chủng cho một thú cưng
   * Sử dụng vaccinationService từ apiServices.js để gọi API
   * @param {string} petId - ID của thú cưng cần tải lịch sử tiêm chủng
   */
  const loadVaccinationHistory = async (petId) => {
    if (!petId) return; // Kiểm tra ID hợp lệ
    
    setLoadingVaccinations(true); // Bắt đầu trạng thái loading
    setVaccinationError(null); // Reset lỗi nếu có
    
    try {
      // Gọi API lấy lịch sử tiêm chủng theo petId
      const response = await vaccinationService.getVaccinationHistoryByPetId(petId);
      // Lưu kết quả vào state, đảm bảo luôn là một mảng
      setVaccinations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching vaccination history:', error);
      // Hiển thị thông báo lỗi
      setVaccinationError('Không thể tải lịch sử tiêm chủng. Vui lòng thử lại sau.');
    } finally {
      setLoadingVaccinations(false); // Kết thúc trạng thái loading
    }
  };
  
  /**
   * Tính ngày tiêm chủng kế tiếp dựa trên ngày tiêm trước đó
   * Hiện tại ấn định là 6 tháng sau ngày tiêm trước đó
   * @param {string} lastVaccinationDate - Ngày tiêm chủng gần nhất
   * @returns {string} Ngày tiêm chủng tiếp theo dạng chuỗi
   */
  const calculateNextVaccinationDate = (lastVaccinationDate) => {
    if (!lastVaccinationDate) return 'Chưa có dữ liệu';
    
    // Tạo đối tượng Date từ chuỗi ngày tiêm chủng
    const date = new Date(lastVaccinationDate);
    // Thêm 6 tháng vào ngày hiện tại (giả định chu kỳ tiêm chủng là 6 tháng)
    date.setMonth(date.getMonth() + 6);
    // Chuyển đổi ngày thành chuỗi theo định dạng Việt Nam (dd/mm/yyyy)
    return date.toLocaleDateString('vi-VN');
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Tạo URL preview cho ảnh đã chọn
      const fileReader = new FileReader();
      fileReader.onload = () => {
        // Cập nhật state currentPet với URL tạm thởi của ảnh để hiển thị xem trước
        setCurrentPet({
          ...currentPet,
          image: fileReader.result
        });
      };
      fileReader.readAsDataURL(file);
    }
  };

  // submit add or edit
  const handleSubmitPet = async (e) => {
    e.preventDefault();
    
    // Hiển thị trạng thái loading
    setIsUploading(true);
    setUploadProgress(0);

    // 1) Upload file mới lên server nếu có
    let imageUrl = currentPet.image;
    if (selectedFile) {
      try {
        // Cập nhật tiến trình để người dùng biết đang xử lý ảnh
        setUploadProgress(30);
        
        // Tiến hành upload ảnh qua API backend
        imageUrl = await uploadImageToCloudinary(selectedFile);
        
        if (!imageUrl) {
          setIsUploading(false);
          toast.error("Không thể tải ảnh lên. Vui lòng thử lại sau.");
          return;
        }
        
        // Upload thành công
        setUploadProgress(100);
      } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        setIsUploading(false);
        toast.error("Upload ảnh thất bại: " + (error.message || "Vui lòng thử lại sau"));
        return;
      }
    }

    const petData = {
      ...currentPet,
      image: imageUrl,
      owner: userId
    };

    try {
      let response;
      if (isEditingPet) {
        // Cập nhật thú cưng
        response = await petService.updatePet(currentPet._id, petData);
      } else {
        // Thêm thú cưng mới
        response = await petService.addPet(petData);
      }
      
      toast.success(isEditingPet ? "Cập nhật thú cưng thành công!" : "Thêm thú cưng thành công!");
      loadPets(); // Reload pets
      closePetModal();
      setIsUploading(false);
    } catch (error) {
      console.error("Error saving pet:", error);
      toast.error("Lỗi: " + (error.response?.data?.message || error.message || "Không thể lưu thông tin thú cưng"));
      setIsUploading(false);
    }
  };

  // delete pet
  const handleDeletePet = async (petId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thú cưng này?")) {
      return;
    }
    
    try {
      const response = await petService.deletePet(petId);
      
      if (response.status === 200) {
        toast.success("Xóa thú cưng thành công!");
        loadPets(); // Tải lại danh sách thú cưng
      } else {
        toast.error("Lỗi khi xóa thú cưng. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      toast.error("Lỗi khi xóa thú cưng. Vui lòng thử lại sau.");
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <Row className="mt-2">
        <Col>
          <div className="custom-breadcrumb">
            <Breadcrumb>
              <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
              <Breadcrumb.Item active>Thú cưng của tôi</Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </Col>
      </Row>

      <div className="container-fluid mt-4">
        {/* --- Pets management --- */}
        <div className="card mb-4 w-100">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              <FaPaw className="me-2 text-primary" /> Danh sách thú cưng
            </h5>
            <Button onClick={openAddPetModal} variant="primary" className="d-flex align-items-center">
              <FaPlus className="me-2" /> Thêm thú cưng
            </Button>
          </div>
          <div className="card-body p-0">
            {loadingPets ? (
              <div className="text-center my-5">
                <div className="d-flex justify-content-center">
                  <Loading />
                </div>
                <p className="mt-3">Đang tải dữ liệu thú cưng...</p>
              </div>
            ) : errorPets ? (
              <div className="flex-empty-state">
                <div className="flex-empty-icon text-danger">
                  <FaInfoCircle />
                </div>
                <p className="text-danger">{errorPets}</p>
              </div>
            ) : pets.length > 0 ? (
              <div className="flex-card-container">
                {pets.map((pet) => (
                  <div key={pet._id} className="flex-card">
                    <div className="flex-card-img-container">
                      {pet.image ? (
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="flex-card-img"
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100">
                          <FaPaw className="text-secondary" size={48} />
                        </div>
                      )}
                    </div>
                    <div className="flex-card-body">
                      <h5 className="flex-card-title">{pet.name}</h5>
                      <div className="flex-card-text">
                        <div className="mb-1">
                          <strong>Loài:</strong> {pet.species}
                          {pet.breed && (
                            <span className="ms-1 text-muted">({pet.breed})</span>
                          )}
                        </div>
                        <div className="mb-1">
                          <strong>Giới tính:</strong> {pet.gender || "Không xác định"}
                        </div>
                        <div className="mb-1">
                          <strong>Tuổi:</strong> {pet.age || "Không có thông tin"}
                        </div>
                        <div className="mb-1">
                          <strong>Cân nặng:</strong> {pet.weight ? `${pet.weight} kg` : "Không có thông tin"}
                        </div>
                      </div>
                      <div className="flex-card-badges">
                        <Badge bg={pet.vaccinated ? "success" : "danger"} className="flex-card-badge">
                          {pet.vaccinated ? "Đã tiêm ngừa" : "Chưa tiêm ngừa"}
                        </Badge>
                      </div>
                      <div className="flex-card-actions">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => openDetailModal(pet._id)}
                          className="flex-card-btn"
                        >
                          <FaEye className="me-1" /> Chi tiết
                        </Button>
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openEditPetModal(pet)}
                            className="flex-card-btn me-1"
                          >
                            <FaEdit className="me-1" /> Sửa
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeletePet(pet._id)}
                            className="flex-card-btn"
                          >
                            <FaTrash className="me-1" /> Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-empty-state">
                <div className="flex-empty-icon">
                  <FaPaw />
                </div>
                <h5 className="flex-empty-title">Bạn chưa có thú cưng nào</h5>
                <p className="flex-empty-text">Hãy thêm thú cưng để quản lý thông tin và đặt lịch dịch vụ dễ dàng hơn.</p>
                <Button variant="primary" onClick={openAddPetModal}>
                  <FaPlus className="me-2" /> Thêm thú cưng ngay
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Modal for adding/editing pet --- */}
      <Modal show={showPetModal} onHide={closePetModal} size="lg" className="pet-form-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPaw className="pet-icon" />
            {isEditingPet ? "Cập nhật thông tin thú cưng" : "Thêm thú cưng mới"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitPet} className="pet-form">
            <Row>
              <Col md={7}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaPaw className="field-icon" /> Tên thú cưng
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên thú cưng của bạn"
                    value={currentPet.name}
                    onChange={(e) => setCurrentPet({ ...currentPet, name: e.target.value })}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaDog className="field-icon" /> Loài
                      </Form.Label>
                      <Form.Select
                        value={currentPet.species}
                        onChange={(e) => setCurrentPet({ ...currentPet, species: e.target.value })}
                        required
                      >
                        <option value="">Chọn loài thú cưng</option>
                        <option value="Chó">Chó</option>
                        <option value="Mèo">Mèo</option>
                        <option value="Khác">Khác</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaCat className="field-icon" /> Giống
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Husky, Corgi, ..."
                        value={currentPet.breed}
                        onChange={(e) => setCurrentPet({ ...currentPet, breed: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaCalendarAlt className="field-icon" /> Tuổi
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="1 tuổi, 6 tháng, ..."
                        value={currentPet.age}
                        onChange={(e) => setCurrentPet({ ...currentPet, age: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaWeight className="field-icon" /> Cân nặng (kg)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Cân nặng (kg)"
                        value={currentPet.weight}
                        onChange={(e) => setCurrentPet({ ...currentPet, weight: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaVenusMars className="field-icon" /> Giới tính
                  </Form.Label>
                  <Form.Select
                    value={currentPet.gender}
                    onChange={(e) => setCurrentPet({ ...currentPet, gender: e.target.value })}
                    required
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Đực">Đực</option>
                    <option value="Cái">Cái</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Đã tiêm ngừa"
                    checked={currentPet.vaccinated}
                    onChange={(e) => setCurrentPet({ ...currentPet, vaccinated: e.target.checked })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaInfoCircle className="field-icon" /> Ghi chú
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Thông tin thêm về thú cưng của bạn"
                    value={currentPet.notes}
                    onChange={(e) => setCurrentPet({ ...currentPet, notes: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={5}>
                <div className="pet-image-section">
                  <Form.Label className="w-100 text-center mb-2">
                    <FaImage className="field-icon" /> Hình ảnh thú cưng
                  </Form.Label>

                  <div className="pet-image-preview-container">
                    {(currentPet.image || selectedFile) ? (
                      <img
                        src={selectedFile ? URL.createObjectURL(selectedFile) : currentPet.image}
                        alt="Pet Preview"
                        className="pet-image-preview"
                      />
                    ) : (
                      <div className="pet-image-placeholder">
                        <FaPaw className="placeholder-icon" />
                        <p>Chưa có ảnh</p>
                      </div>
                    )}
                  </div>

                  <label className="pet-image-upload-label">
                    <FaImage className="upload-icon" /> Chọn ảnh
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="d-none"
                    />
                  </label>

                  <p className="pet-image-upload-info">
                    Hỗ trợ định dạng: JPG, PNG, GIF
                    <br />
                    Kích thước tối đa: 5MB
                  </p>

                  {isUploading && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-center mb-2">
                        <Loading />
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated"
                          role="progressbar"
                          style={{ width: `${uploadProgress}%` }}
                          aria-valuenow={uploadProgress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {uploadProgress}%
                        </div>
                      </div>
                      <small className="text-muted mt-1 d-block">
                        Đang tải ảnh lên...
                      </small>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closePetModal}
            disabled={isUploading}
            className="pet-form-btn pet-form-btn-cancel"
          >
            <FaTimes className="btn-icon" /> Hủy
          </Button>
          <Button 
            variant="success" 
            onClick={handleSubmitPet}
            className="pet-form-btn pet-form-btn-submit"
            disabled={isUploading}
          >
            <FaSave className="btn-icon" /> {isEditingPet ? "Cập nhật" : "Lưu thú cưng"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- Modal for viewing pet details --- */}
      <Modal show={showDetailModal} onHide={closeDetailModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPaw className="me-2" />
            Chi tiết thú cưng: {detailPet?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!detailPet ? (
            <div className="text-center py-4">
              <Loading />
              <p className="mt-2">Đang tải thông tin thú cưng...</p>
            </div>
          ) : (
            <>
              {/* Tab navigation - Thanh điều hướng giữa các tab */}
              <Nav variant="tabs" className="mb-3" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                {/* Tab thông tin chi tiết thú cưng */}
                <Nav.Item>
                  <Nav.Link eventKey="details" className="d-flex align-items-center">
                    <FaInfoCircle className="me-1" /> Thông tin chi tiết
                  </Nav.Link>
                </Nav.Item>
                {/* Tab lịch sử tiêm chủng */}
                <Nav.Item>
                  <Nav.Link eventKey="vaccinations" className="d-flex align-items-center">
                    <FaSyringe className="me-1" /> Lịch sử tiêm chủng
                    {/* Hiển thị badge "Đã tiêm" nếu thú cưng đã được tiêm chủng */}
                    {detailPet.vaccinated && <Badge bg="success" className="ms-2 rounded-pill">Đã tiêm</Badge>}
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {/* Tab content */}
              {activeTab === 'details' && (
                <Card className="pet-detail-card border-top-0 rounded-top-0">
                  <Row className="g-0">
                    <Col md={4} className="d-flex align-items-center justify-content-center p-3">
                      {detailPet.image ? (
                        <img
                          src={detailPet.image}
                          alt={detailPet.name}
                          className="img-fluid pet-detail-img"
                          style={{ maxHeight: "250px", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="text-center p-5 bg-light rounded">
                          <FaPaw size={64} className="text-secondary" />
                          <p className="mt-2">Không có ảnh</p>
                        </div>
                      )}
                    </Col>
                    <Col md={8}>
                      <Card.Body>
                        <Card.Title className="fs-4 mb-3">{detailPet.name}</Card.Title>
                        <Row className="mb-3">
                          <Col md={6}>
                            <p><strong>Loài:</strong> {detailPet.species}</p>
                            <p><strong>Giống:</strong> {detailPet.breed || "Không có thông tin"}</p>
                            <p><strong>Tuổi:</strong> {detailPet.age || "Không có thông tin"}</p>
                            <p><strong>Cân nặng:</strong> {detailPet.weight ? `${detailPet.weight} kg` : "Không có thông tin"}</p>
                          </Col>
                          <Col md={6}>
                            <p>
                              <strong>Giới tính:</strong> {detailPet.gender || "Không xác định"}
                            </p>
                            <p>
                              <strong>Tiêm ngừa:</strong>{" "}
                              {detailPet.vaccinated ? (
                                <Badge bg="success">Đã tiêm</Badge>
                              ) : (
                                <Badge bg="danger">Chưa tiêm</Badge>
                              )}
                            </p>
                            <p>
                              <strong>Ngày thêm:</strong>{" "}
                              {new Date(detailPet.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </Col>
                        </Row>
                        <div className="mb-3">
                          <h5>Ghi chú</h5>
                          <p className="border p-2 rounded bg-light">
                            {detailPet.notes || "Không có ghi chú"}
                          </p>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Tab lịch sử tiêm chủng - Hiển thị khi activeTab === 'vaccinations' */}
              {activeTab === 'vaccinations' && (
                <Card className="vaccination-history-card border-top-0 rounded-top-0">
                  <Card.Body>
                    {/* Tiêu đề và trạng thái tiêm chủng */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">
                        <FaSyringe className="me-2" />
                        Lịch sử tiêm chủng: {detailPet.name}
                      </h5>
                      {/* Badge hiển thị trạng thái tiêm chủng của thú cưng */}
                      {detailPet.vaccinated ? (
                        <Badge bg="success" className="py-2 px-3">Đã tiêm chủng</Badge>
                      ) : (
                        <Badge bg="danger" className="py-2 px-3">Chưa tiêm chủng</Badge>
                      )}
                    </div>

                    {/* Xử lý các trạng thái của dữ liệu tiêm chủng */}
                    {/* Trạng thái đang tải dữ liệu */}
                    {loadingVaccinations ? (
                      <div className="text-center py-4">
                        <Loading />
                        <p className="mt-2">Đang tải lịch sử tiêm chủng...</p>
                      </div>
                    ) : vaccinationError ? (
                      // Trạng thái lỗi khi tải dữ liệu
                      <div className="alert alert-danger" role="alert">
                        <FaInfoCircle className="me-2" />
                        {vaccinationError}
                      </div>
                    ) : vaccinations.length === 0 ? (
                      // Trạng thái không có dữ liệu tiêm chủng
                      <div className="alert alert-info" role="alert">
                        <FaInfoCircle className="me-2" />
                        Chưa có dữ liệu tiêm chủng cho thú cưng này.
                      </div>
                    ) : (
                      // Bảng hiển thị dữ liệu tiêm chủng khi có dữ liệu
                      <Table striped bordered hover responsive className="mt-3">
                        <thead className="table-primary">
                          <tr>
                            <th className="text-center" style={{ width: '50px' }}>STT</th>
                            <th>Loại vaccine</th>
                            <th>Ngày tiêm</th>
                            <th>Ngày tiêm kế tiếp</th>
                            <th>Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Dùng map để hiển thị từng dòng dữ liệu tiêm chủng */}
                          {vaccinations.map((vaccination, index) => (
                            <tr key={vaccination._id || index}>
                              <td className="text-center">{index + 1}</td>
                              <td>{vaccination.vaccineType}</td>
                              <td>{new Date(vaccination.date).toLocaleDateString('vi-VN')}</td>
                              {/* Sử dụng hàm calculateNextVaccinationDate để tính ngày tiêm kế tiếp */}
                              <td>{calculateNextVaccinationDate(vaccination.date)}</td>
                              <td>{vaccination.notes || 'Không có ghi chú'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDetailModal}>
            Đóng
          </Button>
          {detailPet && (
            <Button variant="primary" onClick={() => {
              closeDetailModal();
              openEditPetModal(detailPet);
            }}>
              <FaEdit /> Chỉnh sửa
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default MyPets;
