"use client";

import { useState } from "react";
import Topbar from "./Topbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* <Topbar hidden={isModalOpen} /> */}
      {children}
    </>
  );
}
