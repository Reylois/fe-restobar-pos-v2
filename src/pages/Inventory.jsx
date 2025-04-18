import AdminSidemenu from "../layouts/AdminSidemenu";
import Header from "../layouts/Header";
import Breadcrumb from "../components/Breadcrumb";
import IngredientsTable from "../components/IngredientsTable";
import BeverageTable from '../components/BeverageTable';
import DessertTable from "../components/DessertTable";
import OthersTable from "../components/OthersTable";
import { useState } from "react";

const Inventory = () => {
  const [category, setCategory] = useState("ingredients");

    return (
        <div className="h-screen w-screen flex flex-col gap-1 overflow-x-hidden">
            <Header />
            <div className="flex w-full h-full gap-3">
                <AdminSidemenu />
                <div className="flex flex-col gap-5 w-full pr-[10px] mt-2">
                    <Breadcrumb />
                    <div className='flex justify-between font-medium text-primary mb-3'>
                        <div className="w-1/2 h-[30px] mb-[-50px] z-30">
                            <select 
                                className='h-[35px] border border-black rounded-sm px-2'
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="ingredients">Ingredients</option>
                                <option value="beverage">Beverage</option>
                                <option value="desserts">Desserts</option>
                                <option value="others">Others</option>
                            </select>
                        </div>
                    </div>
                    {category == "ingredients" ? (
                        <IngredientsTable />
                    ) : category == "beverage" ? (
                        <BeverageTable />
                    ) : category == "desserts" ? (
                        <DessertTable /> 
                    ) : category == "others" ? (
                        <OthersTable />
                    ) : (
                        <></>
                    )}
              </div>
            </div>
        </div>
    );
}

export default Inventory;
