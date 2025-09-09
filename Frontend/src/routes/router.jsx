import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import Home from "../pages/Home/Home";
import MangoCategory from "../pages/MangoCategory/MangoCategory";
import Profile from "../pages/Profile/Profile";
import Dashboard from "../pages/dashboard/Dashboard";
import Cart from "../pages/dashboard/Cart";
import Orders from "../pages/dashboard/Orders";
import Checkout from "../pages/dashboard/Checkout";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import AdminLayout from "../layouts/AdminLayout";
import MangoCategoryAdmin from "../pages/admin/MangoCategoryAdmin";
import OrdersAdmin from "../pages/admin/OrdersAdmin";
import NotFound from "../pages/NotFound/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        path: "/",
        element: <Home />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "mango-category",
        element: <MangoCategory />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },

      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          {
            path: "cart",
            element: <Cart />,
          },
          {
            path: "orders",
            element: <Orders />,
          },
        ],
      },
    ],
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      {
        path: "mango-category",
        element: <MangoCategoryAdmin />,
      },
      {
        path: "orders",
        element: <OrdersAdmin />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
