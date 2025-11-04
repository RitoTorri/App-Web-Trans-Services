import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <SideBar />
      <main className="flex-1 lg:pl-64 xl:pl-68 ">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
