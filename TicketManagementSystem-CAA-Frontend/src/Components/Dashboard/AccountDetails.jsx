import React, { useState, useEffect } from "react";
import axios from "axios";

// Helper function to format field names
const formatFieldName = (field) =>
  field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1");

// Input Field Component
const InputField = ({ name, value, onChange, disabled, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {formatFieldName(name)}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
        disabled ? "bg-blue-400 cursor-not-allowed" : "bg-gray text-black border-gray-300"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const ProfileHeader = ({ userInfo, onProfilePicChange }) => (
  <div className="flex items-center space-x-4 mb-8">
    <div className="relative">
      <img
        src={userInfo.profilePicUrl || '/default-profile-pic.png'} // Use default image if no URL
        alt="Profile"
        className="w-16 h-16 rounded-full object-cover cursor-pointer"
      />
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={onProfilePicChange}
      />
    </div>
    <div>
      <h3 className="text-lg font-medium">{userInfo.username}</h3>
      <p className="text-sm text-gray-500">{userInfo.bio}</p>
      <p className="text-sm text-gray-400">{`${userInfo.city}, ${userInfo.province}`}</p>
    </div>
  </div>
);

// Form Section Component
const FormSection = ({ title, fields, userInfo, handleChange, disabled, onEdit, errors }) => (
  <div className="bg-gray-50 p-4 rounded-md mb-8">
    <div className="flex justify-between items-center mb-4">
      <h4 className="text-md font-medium mb-4">{title}</h4>
      {onEdit && (
        <button onClick={onEdit} className="text-blue-500 hover:underline">
          Edit
        </button>
      )}
    </div>

    <div className="grid grid-cols-2 gap-4">
      {fields.map((field) => (
        <InputField
          key={field}
          name={field}
          value={userInfo[field] || ""}
          onChange={handleChange}
          disabled={disabled}
          error={errors[field]}
        />
      ))}
    </div>
  </div>
);

const AccountDetails = () => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    address: "",
    city: "",
    province: "",
    email: "",
    cnic: "",
    mobileno: "",
    profilePicUrl: "", // Update this property
  });

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null); // Store selected file

  const [isPictureChanged, setIsPictureChanged] = useState(false); 
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5044/api/UserDashboard/users/${userId}`
        );
        setUserInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const validationPatterns = {
    username: /^[a-zA-Z\s]+$/, // Only letters and spaces
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    mobileno: /^\d{10}$/, // Example for a 10-digit phone number
    cnic: /^\d{5}-\d{7}-\d{1}$/, // CNIC format: XX-XXXXXXXXXX-X
  };

  const validateInput = (name, value) => {
    const pattern = validationPatterns[name];
    const examples = {
      cnic: "Example: 42101-1234567-1",
      username: "Example: Ali Ahmed",
      mobileno: "Example: 03017676221",
      email: "Example: name@example.com",
    };

    if (pattern && !pattern.test(value)) {
      return `Invalid ${formatFieldName(name)}: (${examples[name]})`;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validateInput(name, value);

    setUserInfo({
      ...userInfo,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const handleSave = async () => {
    // Validate all fields before saving
    const validationErrors = {};
    Object.keys(userInfo).forEach((key) => {
      const error = validateInput(key, userInfo[key]);
      if (error) {
        validationErrors[key] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorMessage("Please correct the input fields before saving.");
      return; // Exit if there are validation errors
    }

    // Clear errors and error message if validation is successful
    setErrors({});
    setErrorMessage("");

    const userId = localStorage.getItem("userId");
    try {
      // Save user info
      await axios.put(
        `http://localhost:5044/api/UserDashboard/userupdate/${userId}`,
        userInfo
      );
      console.log("User info saved:", userInfo);

      // Save profile picture if a new one is selected
      if (profilePicFile) {
        const formData = new FormData();
        formData.append('profilePic', profilePicFile);

        await axios.put(
          `http://localhost:5044/api/UserDashboard/updateProfilePic/${userId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        console.log("Profile picture updated successfully");
      }

      setIsEditingPersonal(false);
      setIsEditingAddress(false);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        setShowSuccessMessage(false); 
          // Refresh the page after saving
      }, 1000);
      window.location.reload(); // Hide after 3 seconds
    } catch (error) {
      console.error("Failed to update user data:", error);
    }
  };

  const handleEditPersonal = () => {
    setIsEditingPersonal(true);
  };

  const handleEditAddress = () => {
    setIsEditingAddress(true);
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setUserInfo((prevUserInfo) => ({
          ...prevUserInfo,
          profilePicUrl: reader.result, // Base64 data string
        }));
      };

      reader.readAsDataURL(file);
      setProfilePicFile(file);
      setIsPictureChanged(true); // Store the file for saving later
    }
  };

  return (
    <div className="flex justify-center items-start bg-white rounded-lg m-4 p-6 shadow-lg max-w-9xl">
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Profile</h2>
        <ProfileHeader
          userInfo={userInfo}
          onProfilePicChange={handleProfilePicChange}
        />

        {showSuccessMessage && !errorMessage && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline">
              {" "} Your information has been updated.
            </span>
          </div>
        )}
        {errorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">
              {" "} {errorMessage}
            </span>
          </div>
        )}

        <FormSection
          title="Personal Information"
          fields={["username", "email", "mobileno", "cnic"]}
          userInfo={userInfo}
          handleChange={handleChange}
          disabled={!isEditingPersonal}
          onEdit={handleEditPersonal}
          errors={errors}
        />

        <FormSection
          title="Address"
          fields={["address", "city", "province"]}
          userInfo={userInfo}
          handleChange={handleChange}
          disabled={!isEditingAddress}
          onEdit={handleEditAddress}
          errors={errors}
        />
{(isEditingPersonal || isEditingAddress || isPictureChanged) && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDetails;