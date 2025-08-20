import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowUp, FaTimes, FaArrowDown, FaExclamationTriangle, FaBell } from 'react-icons/fa';
import axios from 'axios';

const Dashboard = () => {
  const [boxes, setBoxes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const adminId = localStorage.getItem('adminId'); 
    if (adminId) {
      
      fetch(`http://localhost:5044/api/NormalAdminDashboard/complaintsSummary/${adminId}`)
        .then((response) => response.json())
        .then((data) => {
          setBoxes(data);
        });

   
      axios.get(`http://localhost:5044/api/AdminDashboard/notifications/${adminId}`)
        .then((response) => {
          const sortedNotifications = response.data.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
          setNotifications(sortedNotifications.slice(0, 5));
        })
        .catch((error) => console.error('Error fetching notifications:', error));
    }
  }, []);

  const handleBoxClick = (status) => {
    navigate('/normal-admin/complaint-table', {
      state: {
        selectedStatus: status, 
      },
    });
  };

  return (
    <div className="p-4">
      {/* Notifications Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <p>No notifications available</p>
        ) : (
          <ul className="bg-red-50 border border-red-500 shadow-md rounded-lg p-4">
            {notifications.map((notification, index) => (
              <li key={index} className="mb-3 p-2 border-b border-gray-200">
                <div className="flex items-center">
                  <FaBell className="text-yellow-500 mr-2" />
                  <div>
                    <strong>{notification.title}:</strong> {notification.message}
                    <div className="text-gray-500 text-sm">
                      {new Date(notification.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
    </div>
  );
};

export default Dashboard;
