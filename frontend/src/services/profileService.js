import api from "../api/axiosClient";

// Get full user profile
const getProfile = () => api.get("/user");

// Update personal details
const updatePersonal = (data) =>
  api.post("/user/personal", data);

// Update contact details
const updateContact = (data) =>
  api.post("/user/contact", data);

// Update password
const updatePassword = (oldPassword, newPassword) =>
  api.post("/user/update-pwd", { oldPassword, newPassword });

// Upload profile picture
const uploadPhoto = (form) => {
  api.post("/user/photo", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      setUploadProgress(pct);
    },
  });
};

export default {
  getProfile,
  updatePersonal,
  updateContact,
  updatePassword,
  uploadPhoto,
};
