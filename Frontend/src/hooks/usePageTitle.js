import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const usePageTitle = (title) => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = "Mango Mart";

    if (title) {
      document.title = `${title} - ${baseTitle}`;
    } else {
      // Auto-generate title based on route
      const routeTitles = {
        "/": "Home",
        "/home": "Home",
        "/mango-category": "Mango Category",
        "/profile": "Profile",
        "/checkout": "Checkout",
        "/dashboard": "Dashboard",
        "/dashboard/cart": "Cart",
        "/dashboard/orders": "Orders",
        "/auth/login": "Login",
        "/auth/register": "Create Account",
        "/admin/mango-category": "Manage Mangoes",
        "/admin/orders": "Manage Orders",
      };

      const pageTitle = routeTitles[location.pathname] || "Page Not Found";
      document.title = `${pageTitle} - ${baseTitle}`;
    }
  }, [title, location.pathname]);
};

export default usePageTitle;
