import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useLocation } from "react-router-dom";
import { useSpring, animated } from "@react-spring/web";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate } from 'react-router-dom';

const statusMap = {
  6: { name: "Open", class: "bg-yellow-500 text-white" },
  2: { name: "Close", class: "bg-green-500 text-white" },
  5: { name: "Resolved", class: "bg-blue-400 text-white" },
  4: { name: "Dropped", class: "bg-red-500 text-white" },
  3: { name: "Pending", class: "bg-orange-500 text-white" },
  0: { name: "Total Complaints", class: "bg-gray-200 text-black" },
};

const disabledStatuses = [2, 4]; // List of statuses that disable the button

const AdminTicketPage = () => {
  const location = useLocation();
  const { ticketId, tTitle, status } = location.state || {};

  const [fetchedSection, setFetchedSection] = useState(null);
  const [responseSections, setResponseSections] = useState([]);
  const [description, setDescription] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const navigate = useNavigate();


  //
  const [severityModalIsOpen, setSeverityModalIsOpen] = useState(false); // Modal state
const [severityLevel, setSeverityLevel] = useState(""); // Selected severity level state


  useEffect(() => {
    
    const fetchDetails = async () => {
      try {
        const ticketResponse = await axios.get(
          `http://localhost:5044/api/UserDashboard/ticket/${ticketId}`
        );
        console.log("Fetched ticket details:", ticketResponse.data);
  
        const { tTitle: fetchedTitle, lDescription, reason , severityDescription} = ticketResponse.data;
        console.log("Fetched ticket details:", ticketResponse.data);
        setFetchedSection({
          title: fetchedTitle || "No Title",
          content: lDescription || "No description available",
          collapsed: false,
        });
        setSeverityLevel(severityDescription || "N/A");
        if (status === 4) {
          setCancelReason(reason || "No reason provided");
        }
  
        const responsesResponse = await axios.get(
          `http://localhost:5044/api/Ticket/responses/${ticketId}`
        );
        console.log("Fetched ticket responses:", responsesResponse.data);
  
        const responseSections = responsesResponse.data.length > 0
          ? responsesResponse.data.map((response) => ({
              title: response.role === 'admin' ? "Admin Response" : "User Response",
              content: response.rBody,
              collapsed: true,
              user: {
                name: response.role === 'admin' ? response.adminName : response.userName,
                id: response.role === 'admin' ? response.aId : response.uId,
                email: response.role === 'admin' ? response.adminEmail : response.userEmail,
              },
              style: {
                backgroundColor: response.role === 'admin' ? '#fd795c' : '#90EE90', // Light red for admin, light green for user
                color: 'black',
                border: response.role === 'admin' ? '2px solid #fd4b3f' : '2px solid #3d8d3f', // Darker red for admin border, darker green for user border
              },
              
            }))
          : [];
  
        setResponseSections(responseSections);
  
        const userId = localStorage.getItem("userId");
        if (userId) {
          const userResponse = await axios.get(
            `http://localhost:5044/api/UserDashboard/users/${userId}`
          );
          console.log("Fetched user details:", userResponse.data);
          setUser(userResponse.data);
        }
  
        setLoading(false);
      } catch (err) {
        console.error("Error fetching details:", err);
        setLoading(false);
      }
    };
  
    if (ticketId) {
      fetchDetails();
    } else {
      setError("Invalid ticket ID.");
      setLoading(false);
    }
  }, [ticketId, status]);

  const handleQuillChange = (content) => {
    setDescription(content);
  };

  const handleSubmit = async () => {
    const adminId = localStorage.getItem("adminId");

  
    if (!description.trim()) {
      setError("Description cannot be empty.");
      return;
    }
  
    if (!adminId) {
      setError("Admin ID is missing.");
      return;
    }
  
    try {
      // Fetch ticket details to get department and status info
      const ticketResponse = await axios.get(`http://localhost:5044/api/AdminDashboard/ticket/${ticketId}`);
      const ticketDetails = ticketResponse.data;
  console.log(ticketDetails);
    
      // Add the response to the sections
      setResponseSections((prevSections) => [
        ...prevSections,
        {
          title: "Admin Response",
          content: description,
          collapsed: false,
          user: {
            name: user?.adminName || "Unknown",
            id: adminId,
            email: user?.adminEmail || "Unknown",
          },
          style: {
           backgroundColor: 'rgba(229, 62, 62, 0.2)',
            color: 'white',
            border: '2px solid #1b4332',
          },
        },
      ]);
      console.log({
        ticketId: ticketId,
        adminId: adminId,
        userId: ticketDetails.uId,
        responseBody: description,
        departmentId: ticketDetails.assignedToDepartmentId,
        statusId: ticketDetails.sId,
       // Check this in the console

      });
      console.log(localStorage.getItem('adminId')); 
      // Submit the response to the server
      await axios.post("http://localhost:5044/api/AdminDashboard/addAdminResponse", {
        ticketId: ticketId, // Use the ticketId from the state
        adminId: adminId, // Use the adminId from localStorage
        userId: ticketDetails.uId , // Extract userId from ticketDetails
        responseBody: description, // Use the description from the state
        departmentId: ticketDetails.assignedToDepartmentId, // Extract departmentId from ticketDetails
        statusId: ticketDetails.sId, // Extract statusId from ticketDetails
      });
  
      setDescription("");
      setIsCollapsed(true);
    //   navigate("/dashboard");
     window.location.reload();
    } catch (err) {
      console.error("Error adding admin response:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.Message || "Failed to submit your response.");
    }
  };
  
  const handleSeverityChange = async () => {
    if (!severityLevel) {
      setError("Please select a severity level."); // Error handling for empty selection
      return;
    }
  
    try {
      await axios.put(`http://localhost:5044/api/AdminDashboard/updateTicketSeverity/${ticketId}`, {
        severityLevelId: parseInt(severityLevel), // Send severity level ID to backend
      });
      console.log("Severity level updated successfully.");
      setSeverityModalIsOpen(false); // Close modal after updating
      window.location.reload(); // Refresh to reflect changes
    } catch (error) {
      console.error("Error updating severity level:", error);
    }
  };
  
  
  
  

  const toggleSectionCollapse = (index) => {
    setResponseSections((prevSections) =>
      prevSections.map((section, i) =>
        i === index
          ? { ...section, collapsed: !section.collapsed }
          : section
      )
    );
  };

  const mainCollapseProps = useSpring({
    opacity: isCollapsed ? 0 : 1,
    maxHeight: isCollapsed ? "0px" : "500px",
    overflow: "hidden",
    config: { tension: 250, friction: 25 },
  });

  const statusInfo =
    statusMap[status] || { name: "Unknown", class: "bg-gray-200 text-black" };

  const renderReadOnlyContent = (content) => {
    return (
      <div
        className="ql-editor"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  const handleCancelRequest = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5044/api/UserDashboard/updateticketsandreason/${ticketId}`, 
        {
          StatusId: 4, // Status ID for "Dropped Complaint"
          Reason: cancelReason
        }
      );
      console.log('Cancel request successful:', response.data);
      navigate('/dashboard');
      // Handle success, e.g., close the modal and update the UI
    } catch (error) {
      console.error('Error canceling request:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading ticket details...</p>
      </div>
    );
  }

  return (
    <>
      <div className="main-content px-4">
        <div className="relative card flex flex-col gap-3">
          <h2 className="card-title text-2xl font-bold">Ticket Details</h2>
          <div className="ticket-details flex flex-wrap gap-4">
            <div>
              <h3 className="font-semibold">Ticket No:</h3>
              <p>#{ticketId}</p>
            </div>
            <div>
              <h3 className="font-semibold">Complainant Name:</h3>
              <p>{tTitle || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Ticket Status:</h3>
              <p className={`rounded px-2 py-1 inline-block ${statusInfo.class}`}>
                {statusInfo.name}
              </p>
            </div>
            <div>
  <h3 className="font-semibold">Severity Level:</h3>
  <p>{severityLevel ? severityLevel : "N/A"}</p>
</div>


            
<div className="absolute top-4 right-4 flex gap-4">
<button
  onClick={() => setSeverityModalIsOpen(true)} // Open the modal
  className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 ${disabledStatuses.includes(status) ? "opacity-50 cursor-not-allowed" : ""}`}
  disabled={disabledStatuses.includes(status)}
>
  Change Severity Level
</button>

<button
  onClick={() => setModalIsOpen(true)}
  className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 ${disabledStatuses.includes(status) ? "opacity-50 cursor-not-allowed" : ""}`}
  disabled={disabledStatuses.includes(status)}
>
  Cancel Request
</button>

</div>

          </div>
        </div>
      </div>
  
      <Modal
  isOpen={severityModalIsOpen} // Modal open state
  onRequestClose={() => setSeverityModalIsOpen(false)} // Close modal
  contentLabel="Change Severity Level Modal"
  className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
>
  <div className="bg-white rounded-lg p-8 max-w-lg">
    <h2 className="text-2xl font-bold mb-4">Change Severity Level</h2>
    <div>
      <label className="block mb-2 font-semibold">Select Severity Level:</label>
      <select
        value={severityLevel}
        onChange={(e) => setSeverityLevel(e.target.value)} // Update selected severity
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">-- Select Severity --</option>
        <option value="1">High</option>
        <option value="2">Medium</option>
        <option value="3">Low</option>
      </select>
    </div>
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
      onClick={handleSeverityChange} // Call function to update severity
    >
      Update Severity
    </button>
    <button
      className="ml-4 bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
      onClick={() => setSeverityModalIsOpen(false)} // Close modal without saving
    >
      Close
    </button>
  </div>
</Modal>

      {/* Modal for Cancel Request */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Cancel Request"
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
          <h2 className="text-xl font-bold mb-4">Cancel Request</h2>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancellation"
            rows="4"
            className="border border-gray-300 p-2 w-full rounded-md mb-4"
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={handleCancelRequest}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
            >
              Submit
            </button>
            <button
              onClick={() => setModalIsOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
  
      <div className="bg-white rounded-lg m-4 p-4 shadow-md">
        <h3 className="font-semibold">Ticket Subject:</h3>
        <p>{fetchedSection?.title || "No Title Available"}</p>
        <h3 className="font-semibold mt-2">Description:</h3>
        <p>{fetchedSection?.content || "No description available"}</p>
      </div>

      {/* Separate div for Cancellation Reason */}
      {status === 4 && cancelReason && (
        <div className="bg-yellow-500 text-black font-bold rounded-lg m-4 p-4 shadow-md">
          <h3 className="text-lg font-bold">Cancellation Reason:</h3>
          <p>{cancelReason}</p>
        </div>
      )}
  
      <div className="flex flex-col bg-white rounded-lg m-4 p-4 shadow-md">
        <div className="flex justify-end mb-2">
          {!disabledStatuses.includes(status) && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
              {isCollapsed ? "Add Reply" : "Close Reply"}
            </button>
          )}
        </div>
        <animated.div style={mainCollapseProps} className="w-full">
          <label htmlFor="description" className="form-label font-semibold">
            Response
          </label>
          <ReactQuill
            theme="snow"
            value={description}
            onChange={handleQuillChange}
            placeholder="Write your response here..."
            className="mt-2"
          />
          <button
            onClick={handleSubmit}
            className={`bg-green-500 text-white px-4 py-2 rounded mt-4 hover:bg-green-600 transition duration-300 ${disabledStatuses.includes(status) ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={disabledStatuses.includes(status)}
          >
            Submit
          </button>
        </animated.div>
      </div>
  
      {responseSections.length > 0 ? (
        responseSections.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-lg m-4 p-4 shadow-md"
            style={section.style}
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSectionCollapse(index)}
            >
              <span className="font-semibold text-lg">{section.title}</span>
              {section.user && (
                <div className="text-1xl">
                  <p className="font-semibold">{section.user.name}</p>
                  <p>{section.user.email}</p>
                </div>
              )}
              <span className="text-gray-500">
                {section.collapsed ? "▶" : "▼"}
              </span>
            </div>
            {!section.collapsed && (
              <div className="mt-2">
                {renderReadOnlyContent(section.content)}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg m-4 p-4 shadow-md">
          <p className="text-lg">No responses yet.</p>
        </div>
      )}
  
      {error && (
        <div className="text-red-500 text-center mt-4">
          <p>{error}</p>
        </div>
      )}
    </>
  );
};

export default AdminTicketPage;
