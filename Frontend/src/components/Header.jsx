import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import logo from "../assets/aam-khabo-logo.png";
import LogoutConfirmationModal from "./LogoutConfirmationModal";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkToken = () => setIsLoggedIn(!!localStorage.getItem("token"));
    checkToken();
    window.addEventListener("storage", checkToken);
    return () => window.removeEventListener("storage", checkToken);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, [location]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setShowLogoutModal(false);
    toast.success("Logged out successfully!");
    navigate("/auth/login");
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const navlinks = (
    <>
      <li>
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? "text-[#339059] font-semibold" : undefined
          }
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/mango-category"
          className={({ isActive }) =>
            isActive ? "text-[#339059] font-semibold" : undefined
          }
        >
          Category
        </NavLink>
      </li>
      {isLoggedIn && (
        <>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "text-[#339059] font-semibold" : undefined
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "text-[#339059] font-semibold" : undefined
              }
            >
              Profile
            </NavLink>
          </li>
        </>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#ffffffa7] backdrop-blur-sm border-b border-gray-200">
        <div className="navbar py-4 sm:w-10/12 w-11/12 mx-auto flex items-center">
          {/* Left: Logo and mobile menu */}
          <div className="navbar-start">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
              >
                {navlinks}
              </ul>
            </div>
            <Link
              className="text-xl flex flex-row items-center gap-2 rounded-lg p-1"
              to="/home"
            >
              <img
                className="w-12 h-12 object-contain"
                src={logo}
                alt="Mango Mart"
              />
              <span className="ml-2 font-extrabold text-2xl hidden sm:flex tracking-wide drop-shadow-lg bg-clip-text text-[#339059]">
                Mango Mart
              </span>
            </Link>
          </div>
          {/* Center: Desktop nav links */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-2 text-lg">
              {navlinks}
            </ul>
          </div>
          {/* Right: Auth buttons */}
          <div className="navbar-end flex gap-2">
            {isLoggedIn ? (
              <button
                className="btn btn-outline text-red-600 border-red-600 hover:bg-red-600 hover:text-white flex items-center gap-2"
                onClick={handleLogout}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="btn btn-outline text-[#339059] border-[#339059] hover:bg-[#339059] hover:text-white flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="btn hover:text-[#339059] border-[#339059] hover:bg-white bg-[#339059] text-white flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Render modal outside header using portal for proper positioning */}
      {showLogoutModal &&
        createPortal(
          <LogoutConfirmationModal
            isOpen={showLogoutModal}
            onConfirm={confirmLogout}
            onCancel={cancelLogout}
          />,
          document.body
        )}
    </>
  );
};

export default Header;
