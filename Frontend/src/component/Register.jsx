// src/components/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNo: '',
    teacherId: '',          // state me teacherId hi rahega
    registrationCode: '',
    contact: '',
    year: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRoleSwitch = (selectedRole) => {
    setRole(selectedRole);
    setFormData({
      ...formData,
      rollNo: '',
      teacherId: '',
      registrationCode: '',
      year: ''
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password.trim()) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";

    if (!formData.contact.trim()) return "Mobile number is required";
    if (!/^[0-9]{10}$/.test(formData.contact)) return "Enter valid 10 digit mobile number";

    if (role === 'student') {
      if (!formData.rollNo.trim()) return "Roll number is required";
      if (!formData.year.trim()) return "Year is required";
    } else {
      if (!formData.teacherId.trim()) return "Teacher ID is required";
    }

    if (!formData.registrationCode.trim()) return "Registration code is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      registrationCode: formData.registrationCode,
      contact: formData.contact
    };

    if (role === 'student') {
      submitData.studentId = formData.rollNo;
      submitData.year = formData.year;
    } else {
      submitData.teacherId = formData.teacherId;   // ✅ correct
    }

    try {
      const response = await api.post('/auth/register', submitData);

      setSuccess(response.data);

      setFormData({
        name: '',
        email: '',
        password: '',
        rollNo: '',
        teacherId: '',
        registrationCode: '',
        contact: '',
        year: ''
      });

    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-8 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join our attendance system</p>
        </div>

        {/* Role Toggle */}
        <div className="flex mb-8 bg-gray-100 p-1 rounded-lg max-w-md mx-auto">
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              role === 'student' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleRoleSwitch('student')}
          >
            👨‍🎓 Student
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              role === 'teacher' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => handleRoleSwitch('teacher')}
          >
            👨‍🏫 Teacher
          </button>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg max-w-2xl mx-auto">
            <div className="flex"><span className="mr-2">✅</span>{success}</div>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg max-w-2xl mx-auto">
            <div className="flex"><span className="mr-2">❌</span>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left Column */}
            <div className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password" required />
              </div>

              {role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                    <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Roll Number" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select name="year" value={formData.year} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                      <option value="">Select Year</option>
                      <option value="1st">1st Year</option>
                      <option value="2nd">2nd Year</option>
                      <option value="3rd">3rd Year</option>
                      <option value="4th">4th Year</option>
                    </select>
                  </div>
                </>
              )}

              {role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  {/* name FIX — UI same */}
                  <input type="text" name="teacherId" value={formData.teacherId} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Employee ID" required />
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Email" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input type="text" name="contact" value={formData.contact} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="10 digit mobile number" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Code</label>
                <input type="text" name="registrationCode" value={formData.registrationCode} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Registration Code" required />
              </div>

            </div>
          </div>

          <div className="mt-8">
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white ${
                role === 'student' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'
              }`}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account? <Link to="/login" className="font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;