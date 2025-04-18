import React from 'react';
import Header from '../layouts/Header';
import AdminSidemenu from '../layouts/AdminSidemenu';
import Breadcrumb from '../components/Breadcrumb';
import Card from '../components/Card';
import ColumnChart from '../components/ColumnChart';
import Footer from '../layouts/Footer';


const AdminDashboard = () => {

  return (
    <div className="h-screen w-screen flex flex-col gap-1 overflow-x-hidden">
      <Header />
      <div className="flex w-full h-full gap-3">
        <AdminSidemenu />
        <div className="flex flex-col gap-5 w-full h-fit pr-[10px] mt-2">
          <Breadcrumb />
          <div className="flex justify-between h-full w-full gap-4">
            <ColumnChart />
            <div className='grid grid-rows-4 gap-4 w-full px-5'>
                <Card category="Current Sales" value="₱30,000.00" range="Last 30 days" color="#B82132" />
                <Card category="Current Expenses" value="₱20,000.00" range="Last 30 days" color="#B82132" />
                <Card category="Inventory Level" value="In Stock" range="All products" color="#B82132" />
                <Card category="Net Profit" value="₱50,000.00" range="From Last 30 days" color="#B82132" />
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
