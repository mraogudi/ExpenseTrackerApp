import api from "../api/axiosClient";

// Get full user profile
const getProfile = () => api.get("/user");

// Update personal details
const updatePersonal = (data) => api.post("/user/personal", data);

// Update contact details
const updateContact = (data) => api.post("/user/contact", data);

// Update password
const updatePassword = (oldPassword, newPassword) =>
  api.post("/user/update-pwd", { oldPassword, newPassword });

// Update personal details
const states = (countryId) => api.get(`/user/states/${countryId}`);

// Update personal details
const countries = () => api.get("/user/countries");

// ✅ FIXED: uploadPhoto must send FormData
//   + must return api.post
//   + must NOT reference setUploadProgress inside service
const uploadPhoto = (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/user/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        const pct = Math.round((evt.loaded * 100) / evt.total);
        onProgress(pct);
      }
    }
  });
};

const deletePhoto = async () => {
  return await api.delete("/user/photo");
}

const sendResetLink = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

const resetPassword = async (token, newPassword) => {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data;
};

const recoverUserNameOrEmail = async (type, value) => {
  const request = { "phoneNumber": value, "dob": type };
  const res = await api.post("/auth/recover-mail", request);
  return res.data;
}

export default {
  getProfile,
  updatePersonal,
  updateContact,
  updatePassword,
  uploadPhoto,
  sendResetLink,
  recoverUserNameOrEmail,
  resetPassword,
  states,
  countries,
  deletePhoto,
};
