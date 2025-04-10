import React from 'react';
import { useLocation } from "react-router";

const Breadcrumb = ({ currentMenu }) => {
  const location = useLocation();

  const handleCurrentLoc = () => {
      if(location.pathname === '/admin-dashboard') {
          return 'DASHBOARD'
      }
      else if (location.pathname === '/admin-sales') {
          return 'SALES MANAGEMENT'
      }
      else if (location.pathname === '/new-sales') {
          return 'SALES MANAGEMENT > NEW TRANSACTION'
      }
      else if (location.pathname === '/inventory') {
          return 'INVENTORY MANAGEMENT'
      }
      else if (location.pathname === '/expenses') {
          return 'EXPENSES MANAGEMENT'
      }
  }

  return (
    <div className="flex justify-start items-center p-[10px] w-full h-[50px] bg-secondary rounded-sm border-l-7 border-primary">
      <h1 className="text-primary font-medium text-[15px]">{handleCurrentLoc()}</h1>
    </div>
  );
};

export default Breadcrumb;
