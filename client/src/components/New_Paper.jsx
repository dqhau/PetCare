import React from "react";
import "../style/sup.css";
import { Card } from "primereact/card";
// Use a different image to avoid special character issues
import logo from "../assets/images/logo.png";

const SupportSection = () => {
  return (
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
  );
};

export default SupportSection;
