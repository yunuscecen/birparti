import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import ScrollToTop from "./ScrollToTop";

const MainLayout = () => {
  return (
    <>
      <ScrollToTop />
      <Header />

      <main className="site-main">
        <Outlet />
      </main>

      <Footer />
    </>
  );
};

export default MainLayout;