import React, { useState, useEffect } from 'react';
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

const columns = [
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

export default function AdminProgressTable() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  useEffect(() => {
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
    <Box>
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
          columns={columns}
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
      <ToastContainer />
    </Box>
  );
}
