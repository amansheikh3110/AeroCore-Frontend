import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/flights';

const FlightService = {
    saveFlight: (flight) => axios.post(API_BASE, flight),
    findByCode: (code) => axios.get(`${API_BASE}/${code}`),
    findByCarrier: (carrier) => axios.get(`${API_BASE}/carrier/${carrier}`),
    findByRoute: (source, destination) => axios.get(`${API_BASE}/route?source=${source}&destination=${destination}`),
    findByPriceRange: (min, max) => axios.get(`${API_BASE}/price?min=${min}&max=${max}`),
    findAll: () => axios.get(API_BASE),
    deleteFlight: (code) => axios.delete(`${API_BASE}/${code}`)
};

export default FlightService;