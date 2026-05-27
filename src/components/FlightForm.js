import { useState } from 'react';
import FlightService from '../services/FlightService';

const FlightForm = () => {
    const [flight, setFlight] = useState({
        code: '', carrier: '', source: '', destination: '', cost: ''
    });

    const handleChange = (e) => {
        setFlight({ ...flight, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await FlightService.saveFlight(flight);
            alert(`Flight ${res.data.code} saved!`);
            setFlight({ code: '', carrier: '', source: '', destination: '', cost: '' });
        } catch (err) {
            console.error(err);
            alert('Error saving flight');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="code" placeholder="Flight Code" value={flight.code} onChange={handleChange} required />
            <input name="carrier" placeholder="Carrier (Airline)" value={flight.carrier} onChange={handleChange} required />
            <input name="source" placeholder="Source" value={flight.source} onChange={handleChange} required />
            <input name="destination" placeholder="Destination" value={flight.destination} onChange={handleChange} required />
            <input name="cost" type="number" step="0.01" placeholder="Cost" value={flight.cost} onChange={handleChange} required />
            <button type="submit">Save Flight</button>
        </form>
    );
};

export default FlightForm;