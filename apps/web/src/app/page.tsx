import NonDashboardNavbar from "@/components/NonDashboardNavbar";
import Landing from "@/app/(nondashboard)/landing/page";
import ScrollToTop from "@/components/ScrollToTop";

import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="nondashboard-layout">
      <NonDashboardNavbar />
      <main className="w-full flex flex-col items-center">
        <Landing />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
