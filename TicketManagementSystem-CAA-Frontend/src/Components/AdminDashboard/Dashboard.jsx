import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaTimes, FaArrowDown, FaExclamationTriangle } from 'react-icons/fa';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom ProgressBar Component
function ProgressBar({ value }) {
  let color;
  if (value <= 20) color = 'red';
  else if (value <= 40) color = 'orange';
  else if (value <= 60) color = 'yellow';
  else if (value <= 80) color = 'lightgreen';
  else color = 'green';

  return (
    <Box
      sx={{
        width: '100%',
        height: 20,
        backgroundColor: '#f0f0f0',
        border: '1px solid #d0d0d0',
        borderRadius: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: `${value}%`,
          height: '100%',
          backgroundColor: color,
        }}
      />
    </Box>
  );
}

// Admin Progress Table Columns
const progressColumns = [
  { field: 'id', headerName: 'Admin ID', width: 100 },
  { field: 'name', headerName: 'Admin Name', width: 150 },
  { field: 'email', headerName: 'Admin Email', width: 200 },
  { field: 'department', headerName: 'Department', width: 150 },
  { field: 'role', headerName: 'Designation (Role)', width: 180 },
  {
    field: 'progress',
    headerName: 'Progress',
    width: 160,
    renderCell: (params) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <ProgressBar value={params.value} />
      </Box>
    ),
  },
];

// Dummy rows for DataGrid
const progressRows = [
  { id: 1, lastName: 'Snow', firstName: 'Jon', age: 35 },
  { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 42 },
  { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 45 },
  { id: 4, lastName: 'Stark', firstName: 'Arya', age: 16 },
  { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null },
  { id: 6, lastName: 'Melisandre', firstName: null, age: 150 },
  { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44 },
  { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36 },
  { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65 },
];

const paginationModel = { page: 0, pageSize: 5 };

const Dashboard = () => {
  const [boxes, setBoxes] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5044/api/AdminDashboard/complaintsSummary")
      .then((response) => response.json())
      .then((data) => {
        setBoxes(data);
      });

    axios.get('http://localhost:5044/api/adminDashboard/adminProgressData')
      .then(response => {
        const formattedData = response.data.map(admin => ({
          id: admin.aId,
          name: admin.adminname,
          email: admin.email,
          department: admin.departmentName,
          role: admin.role,
          progress: admin.progress,
        }));
        setRows(formattedData);
        setLoading(false);
      })
      .catch(error => {
        console.error("There was an error fetching the admin data!", error);
        setLoading(false);
      });
  }, []);

  const handleBoxClick = (status) => {
    navigate('/admin/complaint-table', {
      state: {
        selectedStatus: status,  // Pass the status title to the AdminComplainTable
      },
    });
  };

  const handleButtonClick = async () => {
    if (rowSelectionModel.length === 0) {
      toast.warn("Please select at least one row.");
      return;
    }

    // Sequentially send notifications
    for (const selectedAdminId of rowSelectionModel) {
      const notificationPayload = {
        adminId: selectedAdminId,  // Admin ID
        title: "Progress Notification",  // Custom title for the notification
        message: "Your progress is going low. Please maintain it"  // Custom message for the admin
      };

      try {
        await axios.post('http://localhost:5044/api/AdminDashboard/sendProgressNotification', notificationPayload);
        toast.success(`Notification sent successfully to Admin ID: ${selectedAdminId}`);
      } catch (error) {
        console.error(`Error sending notification to Admin ID: ${selectedAdminId}`, error);
        toast.error(`Failed to send notification to Admin ID: ${selectedAdminId}`);
      }
    }
  };

  return (
    <div className="p-4">
      {/* Complaint Summary Boxes */}
      <div className="grid grid-cols-3 gap-4">
        {boxes.map((box, index) => {
          const isDroppedComplaints = box.statusTitle === 'Dropped Complaints';
          const isResolvedOrClosed = ['Resolved Complaints', 'Closed Complaints'].includes(box.statusTitle);

          const getBarColor = () => {
            if (isDroppedComplaints) return 'bg-red-500';
            if (isResolvedOrClosed) {
              if (box.percentage >= 50) return 'bg-green-500';
              if (box.percentage >= 30) return 'bg-yellow-500';
              return 'bg-red-500';
            }
            return 'bg-green-500';
          };

          const getTextColor = () => {
            if (isDroppedComplaints) return 'text-red-500';
            if (isResolvedOrClosed) {
              if (box.percentage >= 50) return 'text-green-500';
              if (box.percentage >= 30) return 'text-yellow-500';
              return 'text-red-500';
            }
            return 'text-green-500';
          };

          const getIconColor = () => {
            if (isDroppedComplaints) return 'bg-red-100';
            if (isResolvedOrClosed) {
              if (box.percentage >= 50) return 'bg-green-100';
              if (box.percentage >= 30) return 'bg-yellow-100';
              return 'bg-red-100';
            }
            return 'bg-green-100';
          };

          const getIcon = () => {
            if (isDroppedComplaints) return <FaTimes className="text-xl" />;
            if (isResolvedOrClosed) {
              if (box.percentage >= 30 && box.percentage < 50) return <FaExclamationTriangle className="text-xl" />;
              if (box.percentage < 30) return <FaArrowDown className="text-xl" />;
              return <FaArrowUp className="text-xl" />;
            }
            return <FaArrowUp className="text-xl" />;
          };

          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col items-start cursor-pointer"
              onClick={() => handleBoxClick(box.statusTitle)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${getIconColor()}`}>
                    {getIcon()}
                  </div>
                  <span className={`text-gray-500 font-semibold ml-2 ${getTextColor()}`}>
                    {box.statusTitle}
                  </span>
                </div>
                <div className="flex items-center">
                  {box.statusTitle !== 'Dropped Complaints' && getIcon()}
                  <span className={`ml-1 ${getTextColor()}`}>
                    {(box.percentage ?? 0).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="mt-4 text-3xl font-bold text-gray-800">
                {box.complaintCount}
              </div>
              <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getBarColor()}`}
                  style={{ width: `${box.percentage ?? 0}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Progress Table */}
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          sx={{ mb: 2 }}
        >
          Send Notifications
        </Button>
        <Paper sx={{ height: 400, width: '100%', fontFamily: 'Poppins, sans-serif' }}>
          <DataGrid
            rows={rows}
            columns={progressColumns}
            loading={loading}
            pageSize={5}
            checkboxSelection
            rowSelectionModel={rowSelectionModel}
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setRowSelectionModel(newRowSelectionModel);
            }}
            sx={{
              border: 0,
              fontFamily: 'Poppins, sans-serif',
              '& .MuiDataGrid-cell': {
                fontFamily: 'Poppins, sans-serif',
              },
              '& .MuiDataGrid-columnHeaders': {
                fontFamily: 'Poppins, sans-serif',
              }
            }}
          />
        </Paper>
      </Box>

      <ToastContainer />
    </div>
  );
};

export default Dashboard;
