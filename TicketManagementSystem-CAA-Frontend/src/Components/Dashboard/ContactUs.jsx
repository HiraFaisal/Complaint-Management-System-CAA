import React, { useState } from "react";
import axios from "axios";

const ContactUs = () => {
  // State variables for the form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  // State variable for form validation errors
  const [errors, setErrors] = useState({});
  // State variable for submission status
  const [status, setStatus] = useState("");

  // Validation function to check if the input fields are valid
  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for validating email addresses
    const nameRegex = /^[a-zA-Z\s]+$/; // Regex for validating names (only letters and spaces)

    if (!nameRegex.test(name)) {
      errors.name = "Name can only contain letters and spaces";
    }
    if (!emailRegex.test(email)) {
      errors.email = "Invalid email address";
    }
    if (!subject) {
      errors.subject = "Subject is required";
    }
    if (!message) {
      errors.message = "Message is required";
    }

    return errors;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from submitting the traditional way
    const validationErrors = validate(); // Perform validation
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors); // Set errors if validation fails
    } else {
      try {
        // Make the API call to submit the form data
        const response = await axios.post("http://localhost:5044/api/UserDashboard/contact", {
          name,
          email,
          subject,
          message,
        });

        if (response.status === 200) {
          
          // Clear form fields and errors after successful submission
          setName("");
          setEmail("");
          setSubject("");
          setMessage("");
          setErrors({});
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 10000);
        } else {
          setStatus("Failed to send email. Please try again.");
        }
      } catch (error) {
        setStatus(`Error: ${error.message}`);
      }
    }
  };

  return (
    
    <div className="flex justify-center items-start bg-gray-100 m-4">
      <div className="w-full bg-white shadow-md rounded-lg p-6 sm:p-12">
      {showSuccessMessage && (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Success!</strong>
        <span className="block sm:inline">Dear{name},
Thank you for contacting PCAA Support. We have received your message regarding '{subject}'. Our team will reach out to you as soon as possible. If your issue is urgent, please contact us directly at +923633633633.
Best regards,
PCAA Support Team</span>
      </div>
    )}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full bg-transparent border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-transparent border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full bg-transparent border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.subject && (
              <p className="text-red-600 text-sm mt-1">{errors.subject}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 block w-full bg-transparent border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
            {errors.message && (
              <p className="text-red-600 text-sm mt-1">{errors.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md shadow hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
        </form>
        {status && <p className="mt-4 text-gray-800">{status}</p>}
      </div>
    </div>
  );
};

export default ContactUs;
