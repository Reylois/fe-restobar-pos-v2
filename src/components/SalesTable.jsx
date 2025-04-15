import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { parseISO, isSameDay } from 'date-fns';

const SalesTable = () => {
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const handleViewClick = (row) => {
    setSelectedRow(row.original);
    setShowViewModal(true);
  };

  const handleViewSubmit = (e) => {
    e.preventDefault();
    setShowViewModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showViewModal) {
      setSelectedRow((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    fetch('/data/salesList.json')
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

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
        accessorKey: 'order_type',
        header: 'Order Type',
        cell: (info) => info.getValue(),
        size: 190,
      },
      {
        accessorKey: 'total_amount',
        header: 'Total Amount',
        cell: (info) => (
          <p className="font-medium">₱{info.getValue().toFixed(2)}</p>
        ),
        size: 160,
      },
      {
        accessorKey: 'dateTime',
        header: 'Date & Time',
        cell: (info) => info.getValue(),
        size: 190,
      },
      {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
          <button
            onClick={() => handleViewClick(row)}
            className="w-fit text-white bg-primary hover:bg-mustard hover:text-black cursor-pointer rounded-sm px-4 py-2"
          >
            View
          </button>
        ),
        size: 20,
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesDate = searchDate ? isSameDay(parseISO(item.dateTime), new Date(searchDate)) : true;
      return matchesDate;
    });
  }, [data, searchDate]);

  const table = useReactTable({
    data: filteredData,
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
    <div className="h-[455px] w-full p-1">
      <div className="flex items-center justify-end h-[35px] w-full mb-2 pr-4">
        <Search className="mr-[-30px] text-primary" />
        <input
          type="text"
          placeholder="Search by order type"
          className="text-[13px] h-[35px] w-[205px] border border-black pl-9 pr-3 py-1 rounded-sm"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <div className='flex items-center gap-2 h-[37px] ml-4'>
            <label className='text-[15px]'>Filter by date:</label>
            <input
                type="date"
                id="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="h-[35px] px-3 py-2 border border-gray-500 rounded-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {searchDate && (
                <button
                onClick={() => setSearchDate('')}
                className="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                Clear
                </button>
            )}
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedRow && (
        <div
          className="fixed inset-0 flex items-center justify-center z-1000"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
          <div className="bg-white p-7 px-20 pb-10 rounded-sm shadow-lg">
            <p className="flex justify-between text-[19px] font-medium text-primary mb-8">
              VIEW ORDER DETAILS
              <span className="text-gray-800 hover:text-gray-600 font-normal">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="cursor-pointer"
                >
                  <X size={20} />
                </button>
              </span>
            </p>
            <form className="flex flex-col" onSubmit={handleViewSubmit}>
              <label className="text-[15px] mb-2">Order Type</label>
              <input
                type="text"
                name="order_type"
                value={selectedRow.order_type || ''}
                onChange={handleInputChange}
                className="w-[300px] text-[17px] border border-gray-500 px-5 py-1 rounded-sm mb-7"
                readOnly
              />
              <label className="text-[15px] mb-2">Total Amount</label>
              <input
                type="text"
                name="total_amount"
                value={`₱${selectedRow.total_amount?.toFixed(2) || '0.00'}`}
                onChange={handleInputChange}
                className="w-[300px] text-[17px] border border-gray-500 px-5 py-1 rounded-sm mb-7"
                readOnly
              />
              <label className="text-[15px] mb-2">Date & Time</label>
              <input
                type="text"
                name="dateTime"
                value={selectedRow.dateTime || ''}
                onChange={handleInputChange}
                className="w-[300px] text-[17px] border border-gray-500 px-5 py-1 rounded-sm mb-7"
                readOnly
              />
              <button
                type="submit"
                className="bg-primary text-white font-medium py-3 rounded-sm cursor-pointer hover:bg-mustard hover:text-black"
              >
                CLOSE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="h-full overflow-auto rounded-lg border border-gray-200">
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                  No records found
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
            {table.getRowModel().rows.length > 0 ? (
              <>
                Showing{' '}
                <span className="font-medium">
                  {pagination.pageIndex * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    (pagination.pageIndex + 1) * pagination.pageSize,
                    filteredData.length
                  )}
                </span>{' '}
                of <span className="font-medium">{filteredData.length}</span> results
              </>
            ) : (
              'No records to show'
            )}
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
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
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

export default SalesTable;
