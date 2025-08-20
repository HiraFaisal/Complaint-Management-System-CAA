import React, { useState, useEffect } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";

const DataForm = () => {
  const [formData, setFormData] = useState({
    designation: "",
    description: "",
    subject: "",
  });
  const navigate = useNavigate();

  const [complaintDetail, setComplaintDetail] = useState("");
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(1); // Replace with actual user ID

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Fetch user details from the API
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const response = await fetch(`http://localhost:5044/api/UserDashboard/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setFormData((prevState) => ({
            ...prevState,
            fullName: data.username,
            email: data.email,
            phone: data.mobileno,
            cnic: data.cnic,
          }));
        } else {
          console.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  // Validate inputs using regex
  const validateForm = () => {
    const newErrors = {};
    // Add validation logic here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const userId = localStorage.getItem('userId');
      const dataToSubmit = {
        ...formData,
        complaintDetail,
        t_title: formData.subject, // Store subject as t_title
        userId, // Include user ID
        description: complaintDetail, // Include description
      };

      // Submit form data to backend
      try {
        const response = await fetch('http://localhost:5044/api/UserDashboard/addTicket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSubmit),
        });

        if (response.ok) {
          setShowSuccessMessage(true); // Correct usage
          setFormData({
            fullName: "",
            email: "",
            cnic: "",
            phone: "",
            designation: "",
            description: "",
            subject: "",
          });
          setComplaintDetail("");
          setTimeout(() => {
            setShowSuccessMessage(false);
            navigate('/dashboard'); // Navigate to the dashboard page
          }, 3000);
        } else {
          console.error("Failed to submit form");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    }
  };

  return (
    <div className="col-span-full">
      <div className="card p-0">
        {showSuccessMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline">
              {" "}
              Your Ticket has been generated successfully.
            </span>
          </div>
        )}
        <div className="flex-center-between p-6 pb-4 border-b border-gray-200 dark:border-dark-border m- ">
          <h3 className="text-lg card-title leading-none">
            Fill This Form to Add New Complaint
          </h3>
        </div>
        <form className="p-6" onSubmit={handleSubmit}>
          {/* Full Name and Email on the same line */}
          <div className="flex gap-x-4 mb-4">
            <div className="w-full mb-4">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                style={{ backgroundColor: '#dedcdc' }}
                className="form-input mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                placeholder="Savannah Nguyen"
                value={formData.fullName}
                onChange={handleInputChange}
                autoComplete="off"
                required
                onContextMenu={(e) => e.preventDefault()} // Disable right-click
                onMouseDown={(e) => e.preventDefault()} // Disable left-click
              />
              {errors.fullName && (
                <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>
            <div className="w-full mb-4">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                style={{ backgroundColor: '#dedcdc' }}
                className="form-input mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                placeholder="martinahernandezc@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="off"
                required
                onContextMenu={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="flex lg:flex-row flex-col gap-x-4 mb-2">
            <div className="w-full mb-4">
              <label htmlFor="cnic" className="form-label">
                CNIC
              </label>
              <input
                type="text"
                id="cnic"
                style={{ backgroundColor: '#dedcdc' }}
                className="form-input mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                placeholder="XXXXX-XXXXXXX-X"
                value={formData.cnic}
                onChange={handleInputChange}
                autoComplete="off"
                required
                onContextMenu={(e) => e.preventDefault()} // Disable right-click
                onMouseDown={(e) => e.preventDefault()} // Disable left-click
              />
              {errors.cnic && (
                <p className="text-red-600 text-sm mt-1">{errors.cnic}</p>
              )}
            </div>
            <div className="w-full mb-4">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                style={{ backgroundColor: '#dedcdc' }}
                className="form-input mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                placeholder="(+33)7 55 55 33 70"
                value={formData.phone}
                onChange={handleInputChange}
                autoComplete="off"
                required
                onContextMenu={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="w-full mb-4">
            <label htmlFor="subject" className="form-label">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              className="form-input mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm"
              placeholder="Enter subject"
              value={formData.subject}
              onChange={handleInputChange}
              style={{ backgroundColor: "#ffffff", color: "#000000" }}
            />
            {errors.subject && (
              <p className="text-red-600 text-sm mt-1">{errors.subject}</p>
            )}
          </div>

          <div className="w-full mb-4">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <ReactQuill
              id="description"
              value={complaintDetail}
              onChange={(value) => setComplaintDetail(value)}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <button type="submit" className="btn btn-primary mt-3">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default DataForm;
