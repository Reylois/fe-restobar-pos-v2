import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { CirclePlus, Search, X, Settings, PencilLine, Trash } from 'lucide-react';
import api from '../api/axios';
import Snackbar from './Snackbar';
import Loading from '../components/Loading';

const IngredientsTable = ({openSettingsModal, lowStock}) => {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [addIngredients, setAddIngredients] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [newIngredient, setNewIngredient] = useState({ name: '', stock: '', category: 'ingredients' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [keyTrigger, setKeyTrigger] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [responseStatus, setResponseStatus] = useState('');

  const [updateIngredient, setUpdateIngredient] = useState({
    name: '',
    stock: 0,
  });

  useEffect(() => {
    if (selectedRow) {
      setUpdateIngredient({
        name: selectedRow.name || '',
        stock: selectedRow.stock || 0,
      });
    }
  }, [selectedRow]);

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === 'stock') {
      // Keep only digits (whole numbers)
      processedValue = value.replace(/[^0-9]/g, '');
    }

    setUpdateIngredient(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };


  const handleSaveUpdate = async (e) => {
    e.preventDefault();    
    try {
        if (!selectedRow || !selectedRow.id) {
            return;
        }

        const response = await api.put(`/ingredient/update/${selectedRow.id}`, updateIngredient);
        setMessage(response.data?.message);
        setResponseStatus(response.data?.status);
        setShowUpdateModal(false);
        setShowSnackbar(true);
        setKeyTrigger(prev => prev + 1);
    } catch (error) {
        setMessage(error.response?.data?.message);
        setResponseStatus(error.response?.data?.status);
        setShowUpdateModal(false);
        setShowSnackbar(true);
    } finally {
        setShowUpdateModal(false);
    }
  };

  const handleUpdateClick = (row) => {
    setSelectedRow(row.original);
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row.original);
    setShowDeleteModal(true);
  };

  const handleModalClose = () => {
    setAddIngredients(false);
    setNewIngredient({ name: '', stock: '', category: 'ingredients' });
  };

  const deleteIngredient = async () => {
    try {
      const response = await api.patch(`/ingredient/disable/${selectedRow.id}`);
      setMessage(response.data?.message);
      setResponseStatus(response.data?.status);
      setShowSnackbar(true);
      setKeyTrigger(prev => prev + 1);
      setShowDeleteModal(false);
    } catch (error) {
      setMessage(error.response?.data?.message);
      setResponseStatus(error.response?.data?.status);
      setShowSnackbar(true);
      setShowDeleteModal(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (showUpdateModal) {
      setSelectedRow(prev => ({ ...prev, [name]: value }));
    } else {
      setNewIngredient(prev => ({
        ...prev,
        [name]: name === 'stock'
          ? (
              value === '' || /^[0-9]*$/.test(value) // only whole numbers allowed
                ? value
                : prev[name]
            )
          : value
      }));
    }
  };


  const handleAddIngredients = async (e) => {
    e.preventDefault();
    try {
         const payload = {
      ...newIngredient,
      stock: parseFloat(newIngredient.stock || 0),
    };
      const response = await api.post('/ingredient/add', payload);
      setMessage(response.data?.message);
      setResponseStatus(response.data?.status);
      setShowSnackbar(true);
      setAddIngredients(false);
      setKeyTrigger(prev => prev + 1);
      setNewIngredient({ name: '', stock: '', category: 'ingredients' });
    } catch (error) {
      setResponseStatus(error.response?.data?.status);
      setMessage(error.response?.data?.message);
      setShowSnackbar(true)
    } finally {
      setAddIngredients(false);
      setNewIngredient({ name: '', stock: '', category: 'ingredients' });
    }
  };

  const stockColorCode = (stock_quantity) => {
    if (stock_quantity <= lowStock) return 'bg-red-500';
    else return 'bg-green-500';
  };

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ingredient/fetch');
      setData(response.data);
      setLoading(false);
    } catch (error) {
      setMessage(error.response?.data?.message);
      setResponseStatus(error.response?.data?.status);
      setShowSnackbar(true);
      setLoading(false);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [keyTrigger]);

  const columns = useMemo(
    () => [
      {
        id: 'rowNumber',
        header: '#',
        cell: ({ row }) => row.index + 1,
        accessorFn: (row, index) => index + 1,
        size: 50,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: info => info.getValue(),
        size: 190,
      },
      {
        accessorKey: 'stock',
        header: 'Quantity',
        cell: info => (
          <p className={`${stockColorCode(info.getValue())} text-white py-1 px-3 w-[48px]`}>
            {info.getValue()}
          </p>
        ),
        size: 160,
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <button
              onClick={() => handleUpdateClick(row)}
              className="text-white bg-primary hover:bg-mustard hover:text-black cursor-pointer rounded-sm px-2 py-2"
            >
              <PencilLine size={15} />
            </button>
            <button
              onClick={() => handleDeleteClick(row)}
              className="text-white bg-primary hover:bg-mustard hover:text-black cursor-pointer rounded-sm px-2 py-2"
            >
              <Trash size={15} />
            </button>
          </div>
        ),
        size: 20,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="h-[455px] w-full p-1 mt-[-35px]">

    {showSnackbar && (
      <Snackbar 
        message={message && message}
        type={responseStatus}
        onClose={() => setShowSnackbar(false)}
      />
    )}

      <div className="flex items-center justify-end h-[35px] w-full mb-2">
        <p className='mr-2 text-[15px] font-medium'>Legend:</p>
        <p className='px-3 py-1 bg-green-500 rounded-sm text-[14px] font-medium mr-2'>High Stock</p>
        <p className='px-3 py-1 bg-red-500 rounded-sm text-[14px] font-medium mr-5'>Low Stock</p>
        <div className='relative'>
          <Search className="text-primary absolute top-1 left-2" />
          <input
            type="text"
            placeholder="Search ingredient by name"
            className="text-[13px] h-[35px] w-[205px] border border-black pl-9 pr-3 py-1 rounded-sm"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <div className="flex justify-end ml-2 gap-2"> 
          <button
            onClick={() => setAddIngredients(true)}
            className="flex items-center gap-2 h-[35px] bg-primary text-white font-medium px-3 rounded-sm cursor-pointer hover:bg-mustard hover:text-black"
          >
            <CirclePlus />
            Add New Ingredient
          </button>
          <button 
            onClick={() => openSettingsModal(true)}
            className='bg-primary px-3 rounded-sm cursor-pointer hover:bg-mustard'>
            <Settings className='text-white hover:text-black' />
          </button>
        </div>
      </div>

      {/* Add Ingredients Modal */}
      {addIngredients && (
        <div className="fixed inset-0 flex items-center justify-center z-1000" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white p-7 px-20 pb-10 rounded-sm shadow-lg">
            <p className="flex justify-between text-[19px] font-medium text-primary mb-8">
              ADD INGREDIENT
              <span className="text-gray-800 hover:text-gray-600 font-normal">
                <button onClick={handleModalClose} className="cursor-pointer">
                  <X size={20} />
                </button>
              </span>
            </p>
            <form className="flex flex-col" onSubmit={handleAddIngredients}>
              <label className="text-[15px] mb-2">Ingredient Name</label>
              <input
                type="text"
                name="name"
                value={newIngredient.name}
                onChange={handleInputChange}
                className="w-[300px] text-[17px] border border-gray-500 px-5 py-1 rounded-sm mb-7"
                required
              />
              <label className="text-[15px] mb-2">Quantity</label>
              <input
                type="text"
                name="stock"
                value={newIngredient.stock}
                onChange={handleInputChange}
                className="w-[300px] text-[17px] border border-gray-500 px-5 py-1 rounded-sm mb-7"
                min={0}
                required
              />
              <button
                type="submit"
                className="bg-primary text-white font-medium py-3 rounded-sm cursor-pointer hover:bg-mustard hover:text-black"
              >
                ADD NEW INGREDIENT
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedRow && (
        <div className="fixed inset-0 flex items-center justify-center z-50"  style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)'}}>
        <div className="bg-white p-7 rounded-sm shadow-lg w-[350px]">
          <div className='flex justify-center w-full'>
            <p>Are you sure to delete this ingredient?</p>
          </div>
          <div className='flex justify-end gap-2 w-full mt-5'>
            <button 
              onClick={deleteIngredient}
              className='bg-primary px-3 py-1 text-white rounded-sm cursor-pointer hover:bg-mustard hover:text-black'>
              Yes
            </button>
            <button 
                onClick={() => setShowDeleteModal(false)}
                className='bg-primary px-3 py-1 text-white rounded-sm cursor-pointer hover:bg-mustard hover:text-black'>
              No
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedRow && (
        <div className="fixed inset-0 flex items-center justify-center z-1000" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <div className="bg-white p-7 px-20 pb-10 rounded-sm shadow-lg">
            <p className="flex justify-between text-[19px] font-medium text-primary mb-8">
              UPDATE INGREDIENTS
              <span className="text-gray-800 hover:text-gray-600 font-normal">
                <button onClick={() => setShowUpdateModal(false)} className="cursor-pointer">
                  <X size={20} />
                </button>
              </span>
            </p>
            <form className="flex flex-col" onSubmit={handleSaveUpdate}>
              <label className="text-[15px] mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={updateIngredient.name}
                onChange={handleUpdateChange}
                className="w-[300px] text-[17px] border border-gray-500 px-5 py-1 rounded-sm mb-7"
              />
              <label className="text-[15px] mb-2">Quantity</label>
              <input
                type="text"
                name="stock"
                value={updateIngredient.stock}
                onChange={handleUpdateChange}
                className="w-[300px] text-[17px] border border-gray-500 px-5 py-1 rounded-sm mb-7"
                min={0}
              />
              <button
                type="submit"
                className="bg-primary text-white font-medium py-3 rounded-sm cursor-pointer hover:bg-mustard hover:text-black"
              >
                UPDATE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="h-full overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 border-collapse">
          <thead className="bg-gray-200 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-gray-200"
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center'
                            : 'flex items-center'
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <span className="ml-2">↑</span>,
                          desc: <span className="ml-2">↓</span>,
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-600 font-medium border border-gray-200"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  {loading ? <Loading /> : 'No ingredients available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-1">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="ml-3 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <p className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                data.length
              )}
            </span>{' '}
            of <span className="font-medium">{data.length}</span> results
          </p>
          <div>
            <nav
              className="inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &laquo;
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() =>
                  table.setPageIndex(table.getPageCount() - 1)
                }
                disabled={!table.getCanNextPage()}
                className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &raquo;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientsTable;
