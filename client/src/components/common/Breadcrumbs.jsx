import React from "react";
import { Link, useLocation } from "react-router-dom";

const breadcrumbNameMap = {
  "/login": "Đăng nhập",
  "/register": "Đăng ký tài khoản",
  "/forgot-password": "Quên mật khẩu",
  "/forgot": "Quên mật khẩu"
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Không hiển thị breadcrumb ở trang chủ
  if (location.pathname === "/") return null;

  return (
    <div
      style={{
        width: "100%",
        padding: "20px 32px 0",
        fontSize: 15,
        color: "#888",
        display: "flex",
        gap: 8,
        alignItems: "center"
      }}
    >
      <Link to="/" style={{ color: "#4096ff", textDecoration: "none" }}>
        Trang chủ
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const label = breadcrumbNameMap[`/${value}`] || value;
        return (
          <React.Fragment key={to}>
            <span style={{ color: "#888" }}>&gt;</span>
            {isLast ? (
              <span style={{ color: "#222" }}>{label}</span>
            ) : (
              <Link
                to={to}
                style={{ color: "#4096ff", textDecoration: "none" }}
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumbs; 