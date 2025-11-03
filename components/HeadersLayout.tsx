"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface MenuItem {
  label: string;
  link: string;
  subItems?: MenuItem[];
}

const HeaderLayout = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const whyRoof: MenuItem[] = [
    { label: "Contractor Reviews", link: "/whyRoof/contractor-reviews" },
    { label: "About Us", link: "/whyRoof/about" },
    { label: "Manufacturers", link: "/whyRoof/manufacturers" },
    { label: "Distributors", link: "/whyRoof/distributors" },
  ];

  const features: MenuItem[] = [
    { label: "Roof Measurements", link: "/features/roof-measurements" },
    { label: "Clearoof™ Aerial Imagery", link: "/features/aerial-imagery" },
    { label: "Order Roof Reports", link: "/features/roof-reports" },
    { label: "Instant Roofing Estimator", link: "/features/roofing-estimator" },
    { label: "AI Roof Color Visualizer", link: "/features/color-visualizer" },
    { label: "Sales Presentations", link: "/features/sales-presentations" },
    { label: "Catalogs & Materials", link: "/features/catalogs-materials" },
    { label: "Signatures & Documents", link: "/features/signatures-documents" },
    { label: "Supply Orders", link: "/features/supply-orders" },
    { label: "Project Management", link: "/features/project-management" },
  ];

  const resources: MenuItem[] = [
    { label: "Help Center", link: "/resources/help-center" },
    { label: "Tutorial Videos", link: "/resources/tutorials" },
    { label: "Roofing Blog", link: "/resources/blog" },
    {
      label: "Client? Schedule Training",
      link: "/resources/schedule-training",
    },
    { label: "Demo App", link: "/resources/demo-app" },
  ];

  const contact: MenuItem[] = [
    { label: "New? Schedule Demo", link: "/contact/schedule-demo" },
    { label: "Client? Schedule Training", link: "/contact/schedule-training" },
    { label: "Contact Us", link: "/contact" },
  ];

  const renderDropdown = (items: MenuItem[], menuName: string) => (
    <div
      className={`absolute left-0 top-full bg-[#DDDDDD] text-black shadow-lg rounded md:w-58 
        ${
          isMobile
            ? activeMenu === menuName
              ? "block"
              : "hidden"
            : "hidden group-hover:block"
        } 
        z-50`}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group/sub"
          onMouseEnter={() => !isMobile && setHoveredItem(item.label)}
          onMouseLeave={() => !isMobile && setHoveredItem(null)}
        >
          <a
            href={item.link}
            className="flex justify-between items-center px-4 py-2 text-[16px] font-bold hover:bg-gray-100 cursor-pointer"
            onClick={(e) => {
              if (isMobile && item.subItems) {
                e.preventDefault();
                setHoveredItem(hoveredItem === item.label ? null : item.label);
              }
            }}
          >
            {item.label}
            {item.subItems && (
              <i className="fas fa-chevron-right ml-2 text-[14px]"></i>
            )}
          </a>

          {item.subItems && (
            <div
              className={`absolute top-0 left-full bg-[#DDDDDD] text-black min-w-[140px] md:min-w-[180px] shadow-lg rounded z-50 
                ${
                  isMobile
                    ? hoveredItem === item.label
                      ? "block"
                      : "hidden"
                    : hoveredItem === item.label
                    ? "block"
                    : "hidden"
                }`}
            >
              {item.subItems.map((subItem, subIdx) => (
                <a
                  key={subIdx}
                  href={subItem.link}
                  className="block px-4 py-2 hover:bg-gray-100 cursor-pointer font-bold text-[18px]"
                >
                  {subItem.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <section
      className="relative w-full overflow-hidden flex flex-col justify-center"
      ref={menuRef}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Navbar */}
      <div
        className={`w-full fixed top-0 left-0 z-70  transition-colors duration-300 ${
          scrolled
            ? "bg-gradient-to-r from-[#5a5d2f] to-[#2d394b] pr-34 pl-15  h-[140px]"
            : "bg-transparent pt-15 pl-15 pr-34 py-4"
        }`}
      >
        <div className="flex justify-between items-center px-6 ">
          <Link href={"/"}>
            <Image
              className="cursor-pointer"
              src={"/Logo.png"}
              width={225}
              height={40}
              alt="logo"
            />
          </Link>

          <div className="hidden  lg:flex items-center space-x-6 text-white">
            <div
              className="relative group"
              onMouseLeave={() => !isMobile && setHoveredItem(null)}
            >
              <Link
                href="/product-pages"
                className={`flex items-center gap-1 text-[18px] cursor-pointer p-2 font-semibold hover:bg-[#2d394b] ${
                  isActive("/product-pages")
                    ? "bg-[#2d394b] text-white"
                    : "text-white"
                }`}
                onClick={() => isMobile && toggleMenu("products")}
              >
                Why roofing{" "}
                <i className="fas fa-chevron-down text-xs mt-[2px]"></i>
              </Link>
              {renderDropdown(whyRoof, "products")}
            </div>

            <div
              className="relative group"
              onMouseLeave={() => !isMobile && setHoveredItem(null)}
            >
              <div
                className="flex items-center gap-1 text-[18px] cursor-pointer hover:bg-[#2d394b] p-2 font-semibold"
                onClick={() => isMobile && toggleMenu("teamStore")}
              >
                Features{" "}
                <i className="fas fa-chevron-down text-xs mt-[2px]"></i>
              </div>
              {renderDropdown(features, "teamStore")}
            </div>

            <div
              className="relative group"
              onMouseLeave={() => !isMobile && setHoveredItem(null)}
            >
              <div
                className="flex items-center gap-1 text-[18px] cursor-pointer hover:bg-[#2d394b] p-2 font-semibold"
                onClick={() => isMobile && toggleMenu("support")}
              >
                Resources{" "}
                <i className="fas fa-chevron-down text-xs mt-[2px]"></i>
              </div>
              {renderDropdown(resources, "support")}
            </div>

            <Link
              href={"/pricing"}
              className="text-[18px] font-semibold hover:bg-[#2d394b] p-2"
            >
              Pricing
            </Link>

            <div
              className="relative group"
              onMouseLeave={() => !isMobile && setHoveredItem(null)}
            >
              <div
                className="flex items-center gap-1 text-[18px] cursor-pointer hover:bg-[#2d394b] p-2 font-semibold"
                onClick={() => isMobile && toggleMenu("contact")}
              >
                Contact <i className="fas fa-chevron-down text-xs mt-[2px]"></i>
              </div>
              {renderDropdown(contact, "contact")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeaderLayout;
