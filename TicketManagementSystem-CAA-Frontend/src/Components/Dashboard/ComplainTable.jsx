import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify'; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for react-toastify

const ComplainTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedStatus, setSelectedStatus] = useState(
    location.state?.selectedStatus || 'TotalComplaints'
  );
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false); // For modal visibility
  const [selectedFeedback, setSelectedFeedback] = useState(''); // Satisfaction feedback
  const [comment, setComment] = useState(''); // Comment feedback
  const userId = localStorage.getItem('userId'); // Replace this with dynamic userId
  const [selectedTicket, setSelectedTicket] = useState(null); // Store selected ticket for feedback

  useEffect(() => {
    const statusIds = {
      TotalComplaints: 0, // This will fetch all tickets
      OpenComplaints: 6,
      ClosedComplaints: 2,
      DroppedComplaints: 4,
      ResolvedComplaints: 5,
      PendingComplaints: 3,
    };

    const fetchTickets = async () => {
      try {
        const statusId = statusIds[selectedStatus];
        const response = await axios.get(
          `http://localhost:5044/api/UserDashboard/tickets/${userId}/${statusId}`
        );
        setTickets(response.data);
      } catch (error) {
        console.error('Error fetching tickets', error);
      }
    };

    fetchTickets();
  }, [selectedStatus]);

  const handleChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleTicketClick = (ticket) => {
    navigate('/dashboard/ticketpage', {
      state: {
        ticketId: ticket.tId,
        tTitle: ticket.tTitle,
        status: ticket.sId // Assuming sId corresponds to the status
      }
    });
  };

  const updateTicketStatus = async (ticketId, newStatusId) => {
    try {
      await axios.put(
        `http://localhost:5044/api/UserDashboard/tickets/${ticketId}`,
        newStatusId, // Send statusId directly
        {
          headers: {
            'Content-Type': 'application/json' // Ensure the content type is set to JSON
          }
        }
      );
      
      // After updating the status, fetch the updated tickets
      const statusIds = {
        TotalComplaints: 0,
        OpenComplaints: 6,
        ClosedComplaints: 2,
        DroppedComplaints: 4,
        ResolvedComplaints: 5,
        PendingComplaints: 3,
      };
      const statusId = statusIds[selectedStatus];
      const response = await axios.get(
        `http://localhost:5044/api/UserDashboard/tickets/${userId}/${statusId}`
      );
      setTickets(response.data);
  
      // Show the modal after 1 second if status ID is "Closed"
      if (newStatusId === 2) {
        setSelectedTicket(ticketId); // Store the closed ticket
        setTimeout(() => {
          setShowModal(true); // Trigger modal for feedback after 1 second
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating ticket status', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedTicket) {
      console.error('No ticket selected for feedback');
      return;
    }
  
    try {
      // Construct feedback data with the correct field names
      const feedbackData = {
        ticketId: selectedTicket,  // Ensure this matches the API's expected field name
        feedback: selectedFeedback,  // Use 'feedback' instead of 'Feedback1'
        comments: comment  // Use 'comments' instead of 'Comments'
      };
  
      // Send feedback to the API
      const response = await axios.post('http://localhost:5044/api/Ticket/addFeedback', feedbackData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Feedback submitted successfully:', response.data);
  
      // Show success toast message
      toast.success('Feedback submitted successfully!');
  
      // Close the modal after submission
      setShowModal(false);
      setSelectedFeedback('');  // Clear feedback state if necessary
      setComment('');  // Clear comment state
    } catch (error) {
      console.error('Error submitting feedback', error.response?.data || error);
      // Show error toast message
      toast.error('Error submitting feedback.');
    }
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
          <option value="TotalComplaints">Total Complaints</option>
          <option value="OpenComplaints">Open Complaints</option>
          <option value="ClosedComplaints">Closed Complaints</option>
          <option value="DroppedComplaints">Dropped Complaints</option>
          <option value="ResolvedComplaints">Resolved Complaints</option>
          <option value="PendingComplaints">Pending Complaints</option>
        </select>
        <Link
          to="/dashboard/new-complaint"
          className="cursor-pointer bg-blue-500 text-white relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-[#4a89ff] hover:text-blue h-9 rounded-md px-3"
        >
          New Complaint
        </Link>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                t_id
              </th>
              <th scope="col" className="px-6 py-3">
                t_title
              </th>
              <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                s_id
              </th>
              <th scope="col" className="px-6 py-3">
                DateTime
              </th>
              <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                Lvlid
              </th>
              <th scope="col" className="px-6 py-3">
                UId
              </th>
              {selectedStatus === 'ResolvedComplaints' && (
                <th scope="col" className="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.tId}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800"
                >
                  {ticket.tId}
                </th>
                <td 
                 className="px-6 py-4 cursor-pointer text-blue-500 underline"
                 onClick={() => handleTicketClick(ticket)}
                >
                 {ticket.tTitle}
                </td>
                <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">{ticket.sId}</td>
                <td className="px-6 py-4">{ticket.dateTime}</td>
                <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">{ticket.lvlid}</td>
                <td className="px-6 py-4">{ticket.uId}</td>
                {selectedStatus === 'ResolvedComplaints' && (
                  <td className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => updateTicketStatus(ticket.tId, 2)} // Set status to ClosedComplaints
                    >
                      Close Request
                    </button>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded ml-2"
                      onClick={() => updateTicketStatus(ticket.tId, 6)} // Set status to OpenComplaints
                    >
                      Open Request
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for feedback form */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Feedback Form</h3>
            <label className="block mb-2">How would you rate the resolution of your issue?</label>

            {/* Emoji feedback section */}
            <div className="flex items-center justify-between mb-4">
              <button
                className={`text-4xl p-2 ${selectedFeedback === 'Excellent' ? 'bg-green-200 rounded-lg' : ''}`}
                onClick={() => setSelectedFeedback('Excellent')}
              >
                😁
                <span className="block text-sm">Excellent</span>
              </button>
              <button
                className={`text-4xl p-2 ${selectedFeedback === 'Good' ? 'bg-blue-200 rounded-lg' : ''}`}
                onClick={() => setSelectedFeedback('Good')}
              >
                😊
                <span className="block text-sm">Good</span>
              </button>
              <button
                className={`text-4xl p-2 ${selectedFeedback === 'Medium' ? 'bg-yellow-200 rounded-lg' : ''}`}
                onClick={() => setSelectedFeedback('Medium')}
              >
                😐
                <span className="block text-sm">Medium</span>
              </button>
              <button
                className={`text-4xl p-2 ${selectedFeedback === 'Poor' ? 'bg-orange-200 rounded-lg' : ''}`}
                onClick={() => setSelectedFeedback('Poor')}
              >
                😕
                <span className="block text-sm">Poor</span>
              </button>
              <button
                className={`text-4xl p-2 ${selectedFeedback === 'Very Bad' ? 'bg-red-200 rounded-lg' : ''}`}
                onClick={() => setSelectedFeedback('Very Bad')}
              >
                😡
                <span className="block text-sm">Very Bad</span>
              </button>
            </div>

            <label className="block mb-2">Additional Comments:</label>
            <textarea
              className="border p-2 rounded w-full mb-4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please provide additional comments..."
            ></textarea>
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={handleSubmitFeedback}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ToastContainer for react-toastify */}
      <ToastContainer />
    </div>
  );
};

export default ComplainTable;
