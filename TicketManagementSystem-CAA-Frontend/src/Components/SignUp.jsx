import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Define regex patterns for validation
  const validationPatterns = {
    fullName: /^[a-zA-Z\s]+$/, // Only letters and spaces
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^.{6,}$/, // Minimum 6 characters
    cnic: /^\d{5}-\d{7}-\d{1}$/, // CNIC format: XXXXX-XXXXXXX-X
    phone: /^\d{11}$/, // 11-digit phone number
  };

  // Validation function
  const validateInput = (name, value) => {
    const pattern = validationPatterns[name];
    const examples = {
      fullName: "Example: Ali Ahmed",
      email: "Example: name@example.com",
      cnic: "Example: 42101-1234567-1",
      phone: "Example: 03017676221",
      password: "Minimum 6 characters",
    };

    if (pattern && !pattern.test(value)) {
      return `Invalid ${name.charAt(0).toUpperCase() + name.slice(1)}: (${examples[name]})`;
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const validationErrors = {};
    validationErrors.fullName = validateInput('fullName', fullName);
    validationErrors.email = validateInput('email', email);
    validationErrors.password = validateInput('password', password);
    validationErrors.cnic = validateInput('cnic', cnic);
    validationErrors.phone = validateInput('phone', phone);

    setErrors(validationErrors);

    // If there are errors, do not proceed
    if (Object.values(validationErrors).some(error => error)) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:5044/api/test/register', {
        Username: fullName,
        Email: email,
        Password: password,
        Address: address,
        City: city,
        Province: state,
        Cnic: cnic,
        Mobileno: phone,
      });

      if (response.status === 200 && response.data.message === 'Registration successful.') {
        alert('Registered Successfully!');
        navigate('/login');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        if (error.response.data.message === 'Used') {
          alert('Email already in use!');
        } else if (error.response.data.message === 'Email and password are required.') {
          alert('Email and password are required!');
        } else {
          alert('Error during registration: ' + error.response.data.message);
        }
      } else {
        alert('Unexpected error during registration');
      }
      console.error('Error registering user', error);
    }
  };

  return (
    <div
      className="min-h-screen p-6 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('./images/airport.jpg')" }}
    >
      <div className="container max-w-screen-lg mx-auto">
        <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
          <div className="text-gray-600 mb-6">
            <p className="text-4xl font-bold text-black">Sign Up</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-2">
              <div className="md:col-span-1">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="md:col-span-1">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div className="md:col-span-1">
                <label htmlFor="full_name">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  id="full_name"
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div className="md:col-span-1">
                <label htmlFor="address">Address / Street</label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="city">City</label>
                <select
                  name="city"
                  id="city"
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Select a city</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label htmlFor="state">State / Province</label>
                <input
                  type="text"
                  name="state"
                  id="state"
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <label htmlFor="cnic">CNIC</label>
                <input
                  type="text"
                  name="cnic"
                  id="cnic"
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="42919-7822290-2"
                />
                {errors.cnic && <p className="text-red-500 text-xs mt-1">{errors.cnic}</p>}
              </div>
              <div className="md:col-span-1">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03992367856"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div className="md:col-span-2 text-right">
                <div className="inline-flex items-end">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
