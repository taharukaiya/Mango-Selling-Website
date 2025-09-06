import { Link, NavLink } from "react-router-dom";
import logo from "../assets/aam-khabo-logo.png";

const Header = () => {
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
  );

  return (
    <header className="sticky top-0 z-50 rounded-b-2xl shadow-lg">
      <div className="navbar py-4 sm:w-10/12 w-11/12 mx-auto flex items-center">
        {/* Left: Logo and mobile menu */}
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
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
              alt="Aam Khabo"
            />
            <span className="ml-2 font-extrabold text-2xl hidden sm:flex tracking-wide drop-shadow-lg bg-clip-text text-[#339059]">
              Aam Khabo
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
          <button className="btn btn-outline text-[#339059] border-[#339059]  hover:bg-[#339059] hover:text-white">
            Logout
          </button>
          <Link
            to="/auth/login"
            className="btn btn-outline text-[#339059] border-[#339059]  hover:bg-[#339059] hover:text-white"
          >
            Login
          </Link>
          <Link
            to="/auth/register"
            className="btn hover:text-[#339059] border-[#339059]  hover:bg-white bg-[#339059] text-white"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
