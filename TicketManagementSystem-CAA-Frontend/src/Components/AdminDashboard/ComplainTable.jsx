import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminComplainTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedStatus, setSelectedStatus] = useState('OpenComplaints');
  const [tickets, setTickets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');

  const statusIds = {
    OpenComplaints: 6,
    ClosedComplaints: 2,
    DroppedComplaints: 4,
    ResolvedComplaints: 5,
    PendingComplaints: 3,
  };

  const fetchTickets = async (status) => {
    try {
      const normalizedStatus = status.replace(/\s+/g, '');
      const statusId = statusIds[normalizedStatus];

      if (statusId === undefined) {
        console.error(`Invalid status: ${status}`);
        return;
      }

      const response = await axios.get(`http://localhost:5044/api/AdminDashboard/complaints/${statusId}`);
      console.log('Fetched tickets:', response.data); // Debug: Log fetched tickets
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets', error);
    }
  };

  useEffect(() => {
    const initialStatus = location.state?.selectedStatus?.replace(/\s+/g, '') || 'OpenComplaints';
    setSelectedStatus(initialStatus);
    fetchTickets(initialStatus);
  }, [location.state]);

  useEffect(() => {
    fetchTickets(selectedStatus);
  }, [selectedStatus]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('http://localhost:5044/api/AdminDashboard/departments');
        console.log('Fetched departments:', response.data); // Debug: Log fetched departments
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments', error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      if (!selectedDepartment) return;
      try {
        const response = await axios.get('http://localhost:5044/api/AdminDashboard/admins', {
          params: { departmentId: selectedDepartment }
        });
        console.log('Fetched admins:', response.data); // Debug: Log fetched admins
        setAdmins(response.data);
      } catch (error) {
        console.error('Error fetching admins', error);
      }
    };
    fetchAdmins();
  }, [selectedDepartment]);

  const handleChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleTicketClick = (ticket) => {
    navigate('/admin/AdminTicketPage', {
      state: {
        ticketId: ticket.tId,
        tTitle: ticket.tTitle,
        status: ticket.sId,
      },
    });
  };

  const handleAssignClick = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedDepartment(ticket.assignedToDepartment || ''); // Pre-select the department if already assigned
    setSelectedAdmin(ticket.assignedToAdmin || ''); // Pre-select the admin if already assigned
    setShowPopup(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedTicket || !selectedAdmin || !selectedDepartment) return;

    try {
      await axios.put(`http://localhost:5044/api/AdminDashboard/tickets/${selectedTicket.tId}`, {
        AssignedToDepartment: selectedDepartment,
        AssignedToAdmin: selectedAdmin
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      fetchTickets(selectedStatus);
      handlePopupClose();
    } catch (error) {
      console.error('Error assigning user', error);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedTicket(null);
    setSelectedDepartment('');
    setSelectedAdmin('');
  };

  const getTitleBgColor = (lvlid) => {
    return lvlid === 1
      ? 'bg-red-100 text-red-500' // Light red background with red text
      : '';
  };
  

  return (
    <div className="flex justify-center items-start flex-col bg-white rounded-lg m-4 p-4">
      <div className="flex gap-3">
        <select
          className="bg-gray-100 text-gray-900 border-0 rounded-md p-2 mb-4 focus:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition ease-in-out duration-150"
          id="complain"
          onChange={handleChange}
          value={selectedStatus}
        >
          <option value="OpenComplaints">Open Complaints</option>
          <option value="ClosedComplaints">Closed Complaints</option>
          <option value="DroppedComplaints">Dropped Complaints</option>
          <option value="ResolvedComplaints">Resolved Complaints</option>
          <option value="PendingComplaints">Pending Complaints</option>
        </select>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">t_id</th>
              <th scope="col" className="px-6 py-3">t_title</th>
              {/* <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">s_id</th> */}
              <th scope="col" className="px-6 py-3"> Created Date</th>
              <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">Severity Level</th>
              <th scope="col" className="px-6 py-3">Employee ID</th>
              <th scope="col" className="px-6 py-3">Assigned Department</th>
              <th scope="col" className="px-6 py-3">Assigned Admin</th>
              {selectedStatus === 'OpenComplaints' && (
                <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No tickets found
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.tId} className="border-b border-gray-200 dark:border-gray-700">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800">{ticket.tId}</th>
                  <td className={`px-6 py-4 cursor-pointer  ${getTitleBgColor(ticket.lvlid)} hover:underline`} onClick={() => handleTicketClick(ticket)}>{ticket.tTitle}</td>
                  {/* <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">{ticket.sId}</td> */}
                  <td className="px-6 py-4">
  {new Date(ticket.dateTime).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })}
</td>

                  <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">{ticket.lvlid}</td>
                  <td className="px-6 py-4">{ticket.uId}</td>
                  <td className="px-6 py-4">
  {ticket.assignedToDepartment ? ticket.assignedToDepartment : "Not Assigned"}
</td>
<td className="px-6 py-4">
  {ticket.assignedToAdmin ? ticket.assignedToAdmin : "Not Assigned"}
</td>

                  {selectedStatus === 'OpenComplaints' && (
                    <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                      {!ticket.assignedToDepartment && !ticket.assignedToAdmin && (
                        <button className="bg-blue-500 text-white px-2 py-1 rounded-md" onClick={() => handleAssignClick(ticket)}>
                          Assign To
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4">Assign Ticket</h2>
            <div className="mb-4">
              <label className="block text-gray-700">Department</label>
              <select
                className="w-full border-gray-300 rounded-md p-2"
                onChange={(e) => setSelectedDepartment(e.target.value)}
                value={selectedDepartment}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Admin</label>
              <select
                className="w-full border-gray-300 rounded-md p-2"
                onChange={(e) => setSelectedAdmin(e.target.value)}
                value={selectedAdmin}
                disabled={!selectedDepartment}
              >
                <option value="">Select Admin</option>
                {admins.map(admin => (
  <option key={admin.id} value={admin.id}>{admin.name} ({admin.role})</option>
))}

              </select>
            </div>
            <div className="flex justify-end">
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleAssignSubmit}>
                Assign
              </button>
              <button className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md" onClick={handlePopupClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplainTable;
