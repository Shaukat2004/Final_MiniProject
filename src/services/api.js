import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('oncolink_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('oncolink_token');
    window.dispatchEvent(new Event('oncolink:unauthorized'));
  }
  return Promise.reject(error);
});

export const api = {
  // Minimoth OTP & Authentication
  auth: {
    async registerPatient(payload) {
      const res = await apiClient.post('/auth/register', payload);
      return res.data;
    },
    async loginPassword(payload) {
      const res = await apiClient.post('/auth/login-password', payload);
      return res.data;
    },
    async addDoctor(payload) {
      const res = await apiClient.post('/auth/doctors', payload);
      return res.data;
    },
    async sendOtp(contact, channel = 'sms') {
      const res = await apiClient.post('/auth/send-otp', { contact, channel });
      return res.data;
    },
    async verifyOtp(payload) {
      const res = await apiClient.post('/auth/verify-otp', payload);
      return res.data;
    },
    async getProfile(id) {
      const res = await apiClient.get(`/auth/profile/${id}`);
      return res.data;
    }
  },

  // Oral Cancer Screening & PyTorch Grad-CAM
  screenings: {
    async analyzeImage(formDataOrBase64) {
      if (formDataOrBase64 instanceof FormData) {
        const res = await apiClient.post('/screenings/analyze', formDataOrBase64, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
      } else {
        const res = await apiClient.post('/screenings/analyze', formDataOrBase64);
        return res.data;
      }
    },
    async getHistory(patientId) {
      const res = await apiClient.get(`/screenings/history/${patientId}`);
      return res.data;
    },
    async getImage(id) {
      const res = await apiClient.get(`/screenings/image/${id}`, { responseType: 'blob' });
      return res.data;
    }
  },

  // Cancer Hospitals & Real GPS
  hospitals: {
    async getNearby(userLat, userLng, search = '') {
      const params = {};
      if (userLat && userLng) {
        params.userLat = userLat;
        params.userLng = userLng;
      }
      if (search) params.search = search;
      const res = await apiClient.get('/hospitals', { params });
      return res.data;
    }
  },

  // Appointments
  appointments: {
    async getAll(patientId) {
      const res = await apiClient.get('/appointments', { params: { patientId } });
      return res.data;
    },
    async book(data) {
      const res = await apiClient.post('/appointments', data);
      return res.data;
    },
    async reschedule(id, newDate) {
      const res = await apiClient.put(`/appointments/${id}/reschedule`, { newDate });
      return res.data;
    }
  },

  // Doctor Referrals & Triage
  referrals: {
    async getAll() {
      const res = await apiClient.get('/referrals');
      return res.data;
    },
    async getMine() {
      const res = await apiClient.get('/referrals/mine');
      return res.data;
    },
    async dispatch(data) {
      const res = await apiClient.post('/referrals/dispatch', data);
      return res.data;
    },
    async review(id, data) {
      const res = await apiClient.put(`/referrals/${id}/review`, data);
      return res.data;
    }
  },

  // Patient Records
  patient: {
    async getMedicines(patientId) {
      const res = await apiClient.get(`/patients/medicines/${patientId}`);
      return res.data;
    },
    async addMedicine(data) {
      const res = await apiClient.post('/patients/medicines', data);
      return res.data;
    },
    async toggleMedicine(id) {
      const res = await apiClient.put(`/patients/medicines/${id}/toggle`);
      return res.data;
    },
    async deleteMedicine(id) {
      const res = await apiClient.delete(`/patients/medicines/${id}`);
      return res.data;
    },
    async getTrismus(patientId) {
      const res = await apiClient.get(`/patients/trismus/${patientId}`);
      return res.data;
    },
    async logTrismus(data) {
      const res = await apiClient.post('/patients/trismus', data);
      return res.data;
    },
    async getCaretakers(patientId) {
      const res = await apiClient.get(`/patients/caretakers/${patientId}`);
      return res.data;
    },
    async getAssignedCaretakerBookings() {
      const res = await apiClient.get('/patients/caretakers/assigned');
      return res.data;
    },
    async bookCaretaker(data) {
      const res = await apiClient.post('/patients/caretakers', data);
      return res.data;
    }
  }
};
