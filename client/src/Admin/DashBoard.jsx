import React from "react";
import { Breadcrumb, Col, Nav, Row, Tab } from "react-bootstrap";
// Direct imports from Admin directory
import UserManagement from "./UserManagement";
import BookingManagement from "./BookingManagement";
import Statistics from "./Statistics";
import ServiceManagement from "./Services/ServiceManagement";
import TimeSlots from "./TimeSlots/TimeSlotsManagement";
import VaccinationManagement from "./VaccinationManagement/VaccinationManagement";

const DashBoard = () => {
  // Định nghĩa các tab quản lý
  const adminTabs = [
    { key: "users", title: "Quản lý người dùng", component: <UserManagement /> },
    { key: "services", title: "Quản lý dịch vụ", component: <ServiceManagement /> },
    { key: "bookings", title: "Quản lý đặt lịch", component: <BookingManagement /> },
    { key: "timeslots", title: "Quản lý khung giờ", component: <TimeSlots /> },
    { key: "vaccinations", title: "Lịch sử tiêm phòng", component: <VaccinationManagement /> },
    { key: "statistics", title: "Thống kê", component: <Statistics /> }
  ];

  return (
    <Tab.Container
      id="admin-dashboard-tabs"
      defaultActiveKey="users"
    >
      <Row className="mt-2 ml-2 d-flex justify-content-between align-items-center">
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item active>Quản lý</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>
      <Row style={{ marginTop: "50px" }}>
        <Col sm={2}>
          <Nav variant="pills" className="flex-column">
            {adminTabs.map(tab => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key} style={{ color: "black" }}>
                  {tab.title}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Col>
        <Col sm={9}>
          <Tab.Content>
            {adminTabs.map(tab => (
              <Tab.Pane key={tab.key} eventKey={tab.key}>
                {tab.component}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
};

export default DashBoard;
