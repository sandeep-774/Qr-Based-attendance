import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const SettingsModal = ({ user, onClose }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [contact, setContact] = useState(user.contact || "");
  const modalRef = useRef();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const updateProfile = async () => {
    await axios.put("http://localhost:8080/api/teacher/update-profile", {
      teacherId: user.teacherId,
      name,
      email,
      contact,
    });
    alert("Profile Updated");
  };

  const changePassword = async () => {
    await axios.put("http://localhost:8080/api/teacher/change-password", {
      teacherId: user.teacherId,
      oldPassword,
      newPassword,
    });
    alert("Password Changed");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div ref={modalRef} className="bg-white w-[400px] p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">⚙️ Settings</h2>

        <h3 className="font-semibold mb-2">Update Profile</h3>
        <input
          className="w-full border p-2 rounded mb-2"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Contact Number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <button
          onClick={updateProfile}
          className="w-full bg-indigo-600 text-white py-2 rounded mb-4 cursor-pointer hover:bg-indigo-700 transition"
        >
          Update Profile
        </button>

        <h3 className="font-semibold mb-2">Change Password</h3>
        <input
          type="password"
          placeholder="Old Password"
          className="w-full border p-2 rounded mb-2"
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 rounded mb-3"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button
          onClick={changePassword}
          className="w-full bg-green-600 text-white py-2 rounded mb-3 cursor-pointer hover:bg-green-700 transition"
        >
          Change Password
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-400 text-white py-2 rounded cursor-pointer hover:bg-gray-500 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;