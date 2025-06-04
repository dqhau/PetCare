import React, { useState, useEffect, useRef } from "react";
import { Button, Col, Row, Breadcrumb } from "react-bootstrap";
import bookLogo from "../../assets/images/booking.png";
import logo from "../../assets/images/service-support-247.png";
import Form from "react-bootstrap/Form";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import Loading from "../../components/common/Loading";
import { serviceService, petService, timeslotService, userService, bookingService } from "../../utils/apiServices";

const OnlineBooking = () => {
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [errors, setErrors] = useState({});
  const toast = useRef(null);
  const [showSlots, setShowSlots] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    service_type: "",
    petId: "",
    description: "",
    customer_name: "",
    phone_number: "",
    email: "",
    address: "",
    appointment_date: "",
    timeslotId: "",
    userId: "",
  });
  
  // State for user profile
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Danh sách pet của user để chọn
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  // Load services
  useEffect(() => {
    setIsLoading(true);
    serviceService.getAllServices()
      .then((res) => setServices(res.data))
      .catch(() => {
        toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách dịch vụ',
          life: 3000
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Load pets của user
  useEffect(() => {
    if (userId) {
      setLoadingPets(true);
      petService.getPetsByUserId(userId)
        .then((res) => {
          setPets(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {
          setPets([]);
        })
        .finally(() => setLoadingPets(false));
    }
  }, [userId]);

  // Load all slots
  useEffect(() => {
    timeslotService.getAllTimeSlots()
      .then((res) => setSlots(res.data))
      .catch(() => {
        toast.current?.show({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể lấy danh sách khung giờ',
          life: 3000
        });
      });
  }, []);

  // Fetch user profile and set userId into bookingData
  useEffect(() => {
    if (userId && username) {
      setLoadingProfile(true);
      setBookingData((prev) => ({ ...prev, userId }));
      
      // Fetch user profile
      userService.getUserByUsername(username)
        .then((response) => {
          setUserProfile(response.data);
          // Pre-fill form with user data
          setBookingData(prev => ({
            ...prev,
            customer_name: response.data.fullname || username,
            phone_number: response.data.phone || "",
            email: response.data.email || "",
            address: response.data.address || ""
          }));
        })
        .catch(() => {
          // Still set userId even if profile fetch fails
          setBookingData((prev) => ({ ...prev, userId }));
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [userId, username]);

  // Fetch all available slots
  const fetchSlotsByDate = async (date) => {
    try {
      setIsLoading(true);
      const res = await timeslotService.getAllTimeSlots();
      
      // Sort slots by time
      const sortedSlots = [...res.data].sort((a, b) => a.time - b.time);
      setSlots(sortedSlots);
      
      if (sortedSlots.length === 0) {
        toast.current.show({
          severity: 'info',
          summary: 'Thông báo',
          detail: 'Không có khung giờ nào. Vui lòng liên hệ quản trị viên.',
          life: 3000
        });
      }
    } catch (err) {
      toast.current.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể lấy thông tin khung giờ. Vui lòng thử lại sau.',
        life: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle top-level form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "petId") {
      // chọn pet có sẵn: reset pet_info
      setBookingData((prev) => ({
        ...prev,
        petId: value,
        pet_info: { pet_name: "", species: "", breed: "", age: "", weight: "", notes: "" },
      }));
      return;
    }
    if (name === "appointment_date") {
      fetchSlotsByDate(value);
      setShowSlots(true);
    }
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
      timeslotId: name === "appointment_date" ? "" : prev.timeslotId,
    }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!bookingData.service_type) newErrors.service_type = "Yêu cầu dịch vụ là bắt buộc";
    if (!bookingData.petId) newErrors.petId = "Vui lòng chọn thú cưng";
    if (!bookingData.description) newErrors.description = "Mô tả tình trạng/yêu cầu là bắt buộc";
    if (!bookingData.customer_name) newErrors.customer_name = "Họ và tên là bắt buộc";
    if (!bookingData.phone_number) newErrors.phone_number = "Số điện thoại là bắt buộc";
    if (!bookingData.appointment_date) newErrors.appointment_date = "Ngày hẹn là bắt buộc";
    if (!bookingData.timeslotId) newErrors.timeslotId = "Vui lòng chọn khung giờ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit booking
  const handleSubmit = async () => {
    if (!validate()) {
      toast.current.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Vui lòng điền đầy đủ thông tin",
        life: 3000,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const payload = {
        service_type: bookingData.service_type,
        petId: bookingData.petId,
        description: bookingData.description,
        customer_name: bookingData.customer_name,
        phone_number: bookingData.phone_number,
        email: bookingData.email,
        address: bookingData.address,
        appointment_date: bookingData.appointment_date,
        timeslotId: bookingData.timeslotId,
        userId: bookingData.userId
      };
      
      await bookingService.createBooking(payload);
      
      toast.current.show({
        severity: "success",
        summary: "Thành công",
        detail: "Yêu cầu đặt lịch thành công",
        life: 3000,
      });
      
      // reset form
      setBookingData({
        service_type: "",
        petId: "",
        description: "",
        customer_name: userProfile?.fullname || username || "",
        phone_number: userProfile?.phone || "",
        email: userProfile?.email || "",
        address: userProfile?.address || "",
        appointment_date: "",
        timeslotId: "",
        userId,
      });
      setShowSlots(false);
      setSlots([]);
      setErrors({});
      setSelectedSlot("");
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Lỗi",
        detail: `Lỗi: ${err.response?.data?.message || "Không thể đặt lịch. Vui lòng thử lại sau."}`,
        life: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="online-booking-container">
      <Row>
        <Col>
          <Breadcrumb className="custom-breadcrumb mb-4">
            <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item href="/services">Dịch vụ</Breadcrumb.Item>
            <Breadcrumb.Item active>Đặt lịch online</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      
      <Row className="mt-3">
        <div
          className="text-center py-3"
          style={{ backgroundColor: "#f4f5f5", width: "100%", height: "120px" }}
        >
          <img src={bookLogo} alt="logo" style={{ maxHeight: "80px" }} />
        </div>
      </Row>

      <Row>
        <Col md={{ span: 10, offset: 1 }}>
          <Row>
            <Col md={8}>
              <Form>
                {/* Chọn dịch vụ */}
                <Form.Group controlId="serviceType">
                  <Form.Label>Yêu Cầu Dịch Vụ</Form.Label>
                  <Form.Control
                    as="select"
                    name="service_type"
                    value={bookingData.service_type}
                    onChange={handleInputChange}
                    isInvalid={!!errors.service_type}
                  >
                    <option value="">Chọn dịch vụ</option>
                    {services.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">{errors.service_type}</Form.Control.Feedback>
                </Form.Group>
                
                {/* Chọn thú cưng */}
                <Form.Group controlId="petId">
                  <Form.Label>Chọn thú cưng</Form.Label>
                  <Form.Control
                    as="select"
                    name="petId"
                    value={bookingData.petId}
                    onChange={handleInputChange}
                    isInvalid={!!errors.petId}
                  >
                    <option value="">-- Chọn thú cưng --</option>
                    {loadingPets ? (
                      <option value="" disabled>Đang tải danh sách thú cưng...</option>
                    ) : Array.isArray(pets) && pets.length > 0 ? (
                      pets.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.species} - {p.breed})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Bạn chưa có thú cưng nào. Vui lòng thêm thú cưng trước.</option>
                    )}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">{errors.petId}</Form.Control.Feedback>
                  {pets.length === 0 && !loadingPets && (
                    <div className="text-danger mt-2">
                      <small>Bạn chưa có thú cưng nào. Vui lòng thêm thú cưng trước khi đặt lịch.</small>
                    </div>
                  )}
                </Form.Group>

                {/* Thông tin khách - Được lấy từ profile */}
                <Form.Group controlId="customerName">
                  <Form.Label>Họ và Tên</Form.Label>
                  <Form.Control
                    name="customer_name"
                    value={bookingData.customer_name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.customer_name}
                  />
                  <Form.Control.Feedback type="invalid">{errors.customer_name}</Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Thông tin được lấy từ hồ sơ của bạn. Bạn có thể chỉnh sửa cho lần đặt lịch này.
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="phoneNumber">
                  <Form.Label>Số Điện Thoại {!bookingData.phone_number && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control
                    name="phone_number"
                    value={bookingData.phone_number}
                    onChange={handleInputChange}
                    isInvalid={!!errors.phone_number}
                    placeholder={!bookingData.phone_number ? "Vui lòng nhập số điện thoại" : ""}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phone_number}</Form.Control.Feedback>
                  {!bookingData.phone_number && (
                    <Form.Text className="text-muted">
                      Bạn chưa cập nhật số điện thoại trong hồ sơ
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Thông tin được lấy từ hồ sơ của bạn. Bạn có thể chỉnh sửa cho lần đặt lịch này.
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="address">
                  <Form.Label>Địa Chỉ</Form.Label>
                  <Form.Control
                    name="address"
                    value={bookingData.address}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Thông tin được lấy từ hồ sơ của bạn. Bạn có thể chỉnh sửa cho lần đặt lịch này.
                  </Form.Text>
                </Form.Group>

                {/* Thời gian & slot */}
                <Form.Group controlId="appointmentDate">
                  <Form.Label>Ngày hẹn</Form.Label>
                  <Form.Control
                    type="date"
                    name="appointment_date"
                    min={new Date().toISOString().split("T")[0]}
                    max={(() => {
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 3);
                      return maxDate.toISOString().split("T")[0];
                    })()}
                    value={bookingData.appointment_date}
                    onChange={handleInputChange}
                    isInvalid={!!errors.appointment_date}
                  />
                  <Form.Control.Feedback type="invalid">{errors.appointment_date}</Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Chọn ngày để xem các khung giờ có sẵn (tối thiểu hôm nay, tối đa 3 tháng kể từ hôm nay)
                  </Form.Text>
                </Form.Group>

                {showSlots && (
                  <Form.Group controlId="slot">
                    <Form.Label>Chọn khung giờ</Form.Label>
                    {isLoading ? (
                      <div className="d-flex justify-content-center my-3">
                        <Loading />
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="alert alert-info">
                        Không có khung giờ nào cho ngày này. Vui lòng chọn ngày khác.
                      </div>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <Button
                            key={slot._id}
                            value={slot._id}
                            variant={bookingData.timeslotId === slot._id ? "success" : "outline-primary"}
                            disabled={slot.availableSlots === 0}
                            onClick={() => {
                              setSelectedSlot(slot._id);
                              setBookingData((prev) => ({ ...prev, timeslotId: slot._id }));
                            }}
                            className={slot.availableSlots === 0 ? "opacity-50" : ""}
                          >
                            <div className="text-center">
                              <div>{slot.time}:00</div>
                              <small className={slot.availableSlots < 3 ? "text-danger" : "text-muted"}>
                                {slot.availableSlots > 0 ? `Còn ${slot.availableSlots} chỗ` : "Hết chỗ"}
                              </small>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                    {bookingData.timeslotId && (
                      <div className="mt-2 text-success">
                        Bạn đã chọn khung giờ: {slots.find(s => s._id === bookingData.timeslotId)?.time}:00
                      </div>
                    )}
                  </Form.Group>
                )}


                {/* Mô tả tình trạng/yêu cầu */}
                <Form.Group controlId="description">
                  <Form.Label>Mô tả tình trạng/yêu cầu</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Mô tả tình trạng thú cưng hoặc yêu cầu cụ thể của bạn..."
                    value={bookingData.description}
                    onChange={handleInputChange}
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col className="mt-3">
                    <Button onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang xử lý...
                        </>
                      ) : 'Gửi yêu cầu'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>

            <Col md={4}>
              <div className="support-section">
                <div className="support-header d-flex">
                  <h2>
                    Hỗ trợ <span className="highlight">24/7</span>
                  </h2>
                  <div className="clock-icon">
                    <img 
                      src={logo} 
                      alt="Hỗ trợ 24/7" 
                      style={{ height: "100px" }} 
                    />
                  </div>
                </div>

                <div className="articles-section">
                  <h3>Bài Viết Mới</h3>
                  <Card className="mb-3">
                    <h4>Triệu Chứng Bệnh Dại Ở Mèo</h4>
                    <a href="/blog/trieu-chung-benh-dai-o-meo" aria-label="Đọc thêm về triệu chứng bệnh dại ở mèo">
                      XEM THÊM »
                    </a>
                  </Card>
                  <Card>
                    <h4>Tắm Thú Cưng Tại Nhà Cầu Giấy - Hà Nội</h4>
                    <a href="/blog/tam-thu-cung-tai-nha-cau-giay" aria-label="Đọc thêm về tắm thú cưng tại nhà Cầu Giấy">
                      XEM THÊM »
                    </a>
                  </Card>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      <Toast ref={toast} />
    </div>
  );
};

export default OnlineBooking;
