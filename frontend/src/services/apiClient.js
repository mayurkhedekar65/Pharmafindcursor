import axios from 'axios'

// Base URL for the Django backend (adjust port if needed)
const api = axios.create({
  baseURL: 'http://localhost:8000/api/pharmacies/',
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pharmafind_token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pharmafind_token')
      localStorage.removeItem('pharmafind_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Simple in-memory caches to avoid repeated calls
let pharmaciesCache = null
let medicinesCache = null

export async function fetchPharmacies() {
  if (pharmaciesCache) return pharmaciesCache
  const response = await api.get('pharmacies/')
  pharmaciesCache = response.data
  return pharmaciesCache
}

export async function fetchMedicines() {
  if (medicinesCache) return medicinesCache
  const response = await api.get('medicines/')
  medicinesCache = response.data
  return medicinesCache
}

export async function searchMedicine({ userLocation, medicineName }) {
  const response = await api.post('medicine-search/', {
    user_location: userLocation,
    medicine_name: medicineName,
  })
  return response.data
}

export async function createReservation({
  pharmacyId,
  medicineId,
  quantity,
  mode,
  userIdentifier,
}) {
  const response = await api.post('reservations/', {
    pharmacy: pharmacyId,
    medicine: medicineId,
    quantity,
    mode,
    user_identifier: userIdentifier || '',
  })
  return response.data
}

export async function createReservationFromNames({
  pharmacyName,
  medicineName,
  quantity,
  mode,
  userIdentifier,
}) {
  const pharmacies = await fetchPharmacies()
  const medicines = await fetchMedicines()

  const pharmacy = pharmacies.find((p) => p.name === pharmacyName)
  const medicine = medicines.find((m) => m.name === medicineName)

  if (!pharmacy) {
    throw new Error('Could not find matching pharmacy in the system.')
  }

  if (!medicine) {
    throw new Error('Could not find matching medicine in the system.')
  }

  return createReservation({
    pharmacyId: pharmacy.id,
    medicineId: medicine.id,
    quantity,
    mode,
    userIdentifier,
  })
}

// Auth APIs
export async function userSignup({ username, password, email }) {
  const response = await api.post('auth/user/signup/', {
    username,
    password,
    email: email || '',
  })
  return response.data
}

export async function pharmacySignup({
  username,
  password,
  email,
  pharmacyName,
  area,
  city,
  latitude,
  longitude,
  contact,
  deliveryAvailable,
}) {
  const response = await api.post('auth/pharmacy/signup/', {
    username,
    password,
    email: email || '',
    pharmacy_name: pharmacyName,
    area,
    city,
    latitude,
    longitude,
    contact: contact || '',
    delivery_available: deliveryAvailable || false,
  })
  return response.data
}

export async function login({ username, password }) {
  const response = await api.post('auth/login/', {
    username,
    password,
  })
  return response.data
}

// Pharmacy portal APIs
export async function getPharmacyProfile(pharmacyId) {
  const response = await api.get(`pharmacy/${pharmacyId}/profile/`)
  return response.data
}

export async function updatePharmacyProfile(pharmacyId, data) {
  const response = await api.put(`pharmacy/${pharmacyId}/profile/`, data)
  return response.data
}

export async function getPharmacyStock(pharmacyId) {
  const response = await api.get(`pharmacy/${pharmacyId}/stock/`)
  return response.data
}

export async function addMedicineToPharmacy(pharmacyId, { medicineName, medicineDescription, quantity }) {
  const response = await api.post(`pharmacy/${pharmacyId}/stock/add/`, {
    medicine_name: medicineName,
    medicine_description: medicineDescription || '',
    quantity,
  })
  return response.data
}

export async function updateStockQuantity(pharmacyId, stockId, quantity) {
  const response = await api.put(`pharmacy/${pharmacyId}/stock/${stockId}/`, {
    quantity,
  })
  return response.data
}

export async function removeMedicineFromPharmacy(pharmacyId, stockId) {
  const response = await api.delete(`pharmacy/${pharmacyId}/stock/${stockId}/delete/`)
  return response.data
}

export async function toggleDelivery(pharmacyId, deliveryAvailable) {
  const response = await api.put(`pharmacy/${pharmacyId}/delivery-toggle/`, {
    delivery_available: deliveryAvailable,
  })
  return response.data
}
