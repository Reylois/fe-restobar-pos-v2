import AdminSidemenu from "../layouts/AdminSidemenu";
import Header from "../layouts/Header";
import Breadcrumb from "../components/Breadcrumb";
import { useState } from "react";
import UsersListTable from "../components/UsersListTable";

const UserList = () => {
  const [category, setCategory] = useState("mainDish");

    return (
        <div className="h-screen w-screen flex flex-col gap-1 overflow-x-hidden">
            <Header />
            <div className="flex w-full h-full gap-3">
                <AdminSidemenu />
                <div className="flex flex-col gap-5 w-full pr-[10px] mt-2">
                    <Breadcrumb />
                    <div className="w-full h-full">
                        <UsersListTable />
                    </div>
              </div>
            </div>
        </div>
    );
}

export default UserList;
