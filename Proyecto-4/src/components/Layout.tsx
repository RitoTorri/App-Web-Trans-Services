import SideBar from "./SideBar";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <SideBar />
      <main className="flex-1 lg:pl-64 xl:pl-68 ">{children}</main>
    </div>
  );
};

export default Layout;
