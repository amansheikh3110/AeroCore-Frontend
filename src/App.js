import { useState, useEffect } from 'react';
import FlightService from './services/FlightService';
import BoardingPassTicket from './components/BoardingPassTicket';
import FlightRadar from './components/FlightRadar';
import FlightSearchPanel from './components/FlightSearchPanel';
import GlassNotification from './components/GlassNotification';

// Pre-populated default flights for Demo Mode fallback
const MOCK_FLIGHTS = [
  { code: 'EK-201', carrier: 'Emirates', source: 'DXB', destination: 'JFK', cost: '1250.00' },
  { code: 'SQ-321', carrier: 'Singapore Airlines', source: 'SIN', destination: 'LHR', cost: '1420.00' },
  { code: 'LH-430', carrier: 'Lufthansa', source: 'FRA', destination: 'ORD', cost: '890.00' },
  { code: 'JL-006', carrier: 'Japan Airlines', source: 'HND', destination: 'LAX', cost: '1100.00' },
  { code: 'AA-100', carrier: 'American Airlines', source: 'LAX', destination: 'JFK', cost: '320.00' },
  { code: 'QF-002', carrier: 'Qantas', source: 'SYD', destination: 'DXB', cost: '1650.00' }
];

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Connection states
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  // Connect theme to body class
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Form input states
  const [newFlight, setNewFlight] = useState({ code: '', carrier: '', source: '', destination: '', cost: '' });
  const [searchCode, setSearchCode] = useState('');
  const [searchCarrier, setSearchCarrier] = useState('');
  const [searchSource, setSearchSource] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Result states
  const [singleFlight, setSingleFlight] = useState(null);
  const [flightList, setFlightList] = useState([]);
  
  // Custom Glass Toast Alert states
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info'); // 'info' | 'success' | 'error'

  // Custom Deletion Confirmation Modal state
  const [deletingFlightCode, setDeletingFlightCode] = useState(null);

  // Initialize and check connection
  useEffect(() => {
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const checkConnection = async () => {
    setIsCheckingConnection(true);
    try {
      const res = await FlightService.findAll();
      setFlightList(res.data);
      setIsDemoMode(false);
      triggerToast('Linked with Eclipse SQL database.', 'success');
    } catch (err) {
      console.warn('Backend server unreachable. Switching to local Demo Mode.', err);
      setIsDemoMode(true);
      
      // Load from localStorage or populate defaults
      const localData = localStorage.getItem('flight_manifest');
      if (localData) {
        setFlightList(JSON.parse(localData));
      } else {
        localStorage.setItem('flight_manifest', JSON.stringify(MOCK_FLIGHTS));
        setFlightList(MOCK_FLIGHTS);
      }
      triggerToast('Eclipse server offline. AeroCore Demo Mode active.', 'info');
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const fetchAllFlights = async () => {
    if (!isDemoMode) {
      try {
        const res = await FlightService.findAll();
        setFlightList(res.data);
      } catch (err) {
        triggerToast('Error refreshing manifest records.', 'error');
      }
    } else {
      const localData = localStorage.getItem('flight_manifest');
      setFlightList(localData ? JSON.parse(localData) : MOCK_FLIGHTS);
      triggerToast('Refreshed local telemetry data.', 'success');
    }
  };

  // Add new flight
  const handleSave = async (e) => {
    e.preventDefault();
    
    // Quick validation
    if (!newFlight.code || !newFlight.carrier || !newFlight.source || !newFlight.destination || !newFlight.cost) {
      triggerToast('Please complete all boarding details.', 'error');
      return;
    }

    if (!isDemoMode) {
      try {
        const res = await FlightService.saveFlight(newFlight);
        triggerToast(`Flight ${res.data.code} successfully registered!`, 'success');
        setNewFlight({ code: '', carrier: '', source: '', destination: '', cost: '' });
        fetchAllFlights();
      } catch (err) {
        triggerToast('Database failed to save flight record.', 'error');
      }
    } else {
      // Local implementation
      const currentList = [...flightList];
      // Check if code duplicate
      if (currentList.some(f => f.code.toUpperCase() === newFlight.code.toUpperCase())) {
        triggerToast(`Flight ${newFlight.code.toUpperCase()} is already registered.`, 'error');
        return;
      }

      const formattedFlight = {
        ...newFlight,
        code: newFlight.code.toUpperCase(),
        source: newFlight.source.toUpperCase(),
        destination: newFlight.destination.toUpperCase(),
        cost: parseFloat(newFlight.cost).toFixed(2)
      };

      const updatedList = [formattedFlight, ...currentList];
      localStorage.setItem('flight_manifest', JSON.stringify(updatedList));
      setFlightList(updatedList);
      triggerToast(`Flight ${formattedFlight.code} registered locally.`, 'success');
      setNewFlight({ code: '', carrier: '', source: '', destination: '', cost: '' });
    }
  };

  // Search by code
  const handleFindByCode = async () => {
    if (!searchCode) {
      triggerToast('Enter a flight code to search.', 'info');
      return;
    }
    
    const cleanCode = searchCode.trim().toUpperCase();

    if (!isDemoMode) {
      try {
        const res = await FlightService.findByCode(cleanCode);
        setSingleFlight(res.data);
        triggerToast(`Record for ${cleanCode} located.`, 'success');
      } catch (err) {
        setSingleFlight(null);
        triggerToast(err.response?.data || 'Flight record not found.', 'error');
      }
    } else {
      const found = flightList.find(f => f.code.toUpperCase() === cleanCode);
      if (found) {
        setSingleFlight(found);
        triggerToast(`Telemetry for ${cleanCode} located.`, 'success');
      } else {
        setSingleFlight(null);
        triggerToast(`Record ${cleanCode} not found in database.`, 'error');
      }
    }
  };

  // Search by carrier
  const handleFindByCarrier = async () => {
    if (!searchCarrier) {
      triggerToast('Enter a carrier name to search.', 'info');
      return;
    }

    const carrierQuery = searchCarrier.trim().toLowerCase();

    if (!isDemoMode) {
      try {
        const res = await FlightService.findByCarrier(searchCarrier);
        setFlightList(res.data);
        setSingleFlight(null);
        triggerToast(`Retrieved ${res.data.length} flights for ${searchCarrier}.`, 'success');
      } catch (err) {
        setFlightList([]);
        triggerToast('Failed to retrieve carrier flights.', 'error');
      }
    } else {
      const filtered = flightList.filter(f => f.carrier.toLowerCase().includes(carrierQuery));
      setFlightList(filtered);
      setSingleFlight(null);
      triggerToast(`Located ${filtered.length} matches for "${searchCarrier}".`, 'success');
    }
  };

  // Search by route
  const handleFindByRoute = async () => {
    if (!searchSource || !searchDestination) {
      triggerToast('Source and Destination are required for route scanning.', 'info');
      return;
    }

    const src = searchSource.trim().toUpperCase();
    const dst = searchDestination.trim().toUpperCase();

    if (!isDemoMode) {
      try {
        const res = await FlightService.findByRoute(src, dst);
        setFlightList(res.data);
        setSingleFlight(null);
        triggerToast(`Located ${res.data.length} routes from ${src} to ${dst}.`, 'success');
      } catch (err) {
        setFlightList([]);
        triggerToast('Route manifest fetch failed.', 'error');
      }
    } else {
      const filtered = flightList.filter(f => f.source.toUpperCase() === src && f.destination.toUpperCase() === dst);
      setFlightList(filtered);
      setSingleFlight(null);
      triggerToast(`Located ${filtered.length} routes from ${src} to ${dst}.`, 'success');
    }
  };

  // Search by price range
  const handleFindByPriceRange = async () => {
    if (!minPrice || !maxPrice) {
      triggerToast('Min and Max prices are required.', 'info');
      return;
    }

    const minVal = parseFloat(minPrice);
    const maxVal = parseFloat(maxPrice);

    if (isNaN(minVal) || isNaN(maxVal) || minVal > maxVal) {
      triggerToast('Invalid price range specified.', 'error');
      return;
    }

    if (!isDemoMode) {
      try {
        const res = await FlightService.findByPriceRange(minPrice, maxPrice);
        setFlightList(res.data);
        setSingleFlight(null);
        triggerToast(`Found ${res.data.length} flights within price limits.`, 'success');
      } catch (err) {
        setFlightList([]);
        triggerToast('Price filter failed on database.', 'error');
      }
    } else {
      const filtered = flightList.filter(f => {
        const costVal = parseFloat(f.cost);
        return costVal >= minVal && costVal <= maxVal;
      });
      setFlightList(filtered);
      setSingleFlight(null);
      triggerToast(`Found ${filtered.length} flights within pricing bracket.`, 'success');
    }
  };

  // Delete flight logic
  const confirmDelete = (code) => {
    setDeletingFlightCode(code);
  };

  const executeDelete = async () => {
    const code = deletingFlightCode;
    setDeletingFlightCode(null);
    if (!code) return;

    if (!isDemoMode) {
      try {
        await FlightService.deleteFlight(code);
        triggerToast(`Flight ${code} has been decommissioned.`, 'success');
        fetchAllFlights();
        if (singleFlight && singleFlight.code === code) setSingleFlight(null);
      } catch (err) {
        triggerToast(`Error decommissioning flight ${code}.`, 'error');
      }
    } else {
      const updatedList = flightList.filter(f => f.code.toUpperCase() !== code.toUpperCase());
      localStorage.setItem('flight_manifest', JSON.stringify(updatedList));
      setFlightList(updatedList);
      if (singleFlight && singleFlight.code === code) setSingleFlight(null);
      triggerToast(`Flight ${code} decommissioned locally.`, 'success');
    }
  };

  const handleResetSearch = () => {
    setSearchCode('');
    setSearchCarrier('');
    setSearchSource('');
    setSearchDestination('');
    setMinPrice('');
    setMaxPrice('');
    setSingleFlight(null);
    fetchAllFlights();
  };

  // Compute stats metrics dynamically
  const totalFlights = flightList.length;
  const uniqueCarriers = new Set(flightList.map(f => f.carrier)).size;
  const flightCosts = flightList.map(f => parseFloat(f.cost) || 0);
  const avgCost = flightCosts.length ? flightCosts.reduce((a, b) => a + b, 0) / flightCosts.length : 0;
  const maxCost = flightCosts.length ? Math.max(...flightCosts) : 0;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {/* Background blobs for Apple Liquid Glass theme */}
      <div className="bg-fluid-container">
        <div className="bg-blob blob-cyan"></div>
        <div className="bg-blob blob-purple"></div>
        <div className="bg-blob blob-blue"></div>
      </div>

      {/* Slide-in System notifications */}
      <GlassNotification
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />

      {/* Main Dashboard Wrapper */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '30px 24px' }}>
        
        {/* Dashboard Header Banner */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <h1 className="hud-title" style={{ fontSize: '1.95rem', letterSpacing: '-1px' }}>
              <span className="text-gradient-cyan">AEROCORE</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 300, fontFamily: 'Space Grotesk' }}>{"// SYSTEM HUB"}</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Suborbital & Global Aviation Flight Controller Console
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Server Connection Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '24px',
              background: isDemoMode ? 'rgba(211, 142, 0, 0.08)' : 'rgba(48, 209, 88, 0.08)',
              border: isDemoMode ? '1px solid rgba(211, 142, 0, 0.25)' : '1px solid rgba(48, 209, 88, 0.25)',
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isDemoMode ? '#d38e00' : 'var(--success-glow)',
                boxShadow: isDemoMode ? '0 0 8px #d38e00' : '0 0 8px var(--success-glow)',
                display: 'inline-block'
              }} />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isDemoMode ? '#ffbd38' : 'var(--success-glow)',
                letterSpacing: '1px',
                fontFamily: 'Space Grotesk'
              }}>
                {isCheckingConnection ? 'CHECKING...' : isDemoMode ? 'MOCK SYSTEM (DEMO)' : 'ECLIPSE HOST: ONLINE'}
              </span>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="liquid-button"
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                borderRadius: '50%',
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={checkConnection}
              className="liquid-button"
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '24px' }}
              disabled={isCheckingConnection}
            >
              🔄 RECONNECT
            </button>
          </div>
        </header>

        {/* Dynamic Telemetry Stats Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '30px'
        }}>
          {[
            { label: 'TOTAL TELEMETRY RECORDED', value: totalFlights, icon: '✈', color: 'var(--primary-glow)' },
            { label: 'REGISTERED AIRLINES', value: uniqueCarriers, icon: '🛡', color: '#ff9500' },
            { label: 'AVERAGE FARE VALUE', value: `$${avgCost.toFixed(2)}`, icon: '💎', color: 'var(--success-glow)' },
            { label: 'PEAK TICKET COST', value: `$${maxCost.toFixed(2)}`, icon: '📈', color: 'var(--secondary-glow)' }
          ].map((stat, idx) => (
            <div key={idx} className="liquid-glass" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: `rgba(255, 255, 255, 0.03)`,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem'
              }}>
                {stat.icon}
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.5px', display: 'block', fontWeight: 600 }}>
                  {stat.label}
                </span>
                <p style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: stat.color,
                  fontFamily: 'Space Grotesk, sans-serif',
                  marginTop: '4px',
                  textShadow: `0 0 16px ${stat.color}20`
                }}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Main 3-Column Cockpit Workspace */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* COLUMN 1: registration form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="liquid-glass">
              <h3 className="hud-title" style={{ fontSize: '1.1rem', marginBottom: '16px' }}>
                <span>✍</span>
                FLIGHT REGISTRATION GATE
              </h3>
              
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Flight Code</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. EK-201"
                    value={newFlight.code}
                    onChange={e => setNewFlight({ ...newFlight, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Airline Carrier</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Emirates"
                    value={newFlight.carrier}
                    onChange={e => setNewFlight({ ...newFlight, carrier: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Source</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="e.g. DXB"
                      value={newFlight.source}
                      onChange={e => setNewFlight({ ...newFlight, source: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Destination</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="e.g. JFK"
                      value={newFlight.destination}
                      onChange={e => setNewFlight({ ...newFlight, destination: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Ticket Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="glass-input"
                    placeholder="e.g. 1250"
                    value={newFlight.cost}
                    onChange={e => setNewFlight({ ...newFlight, cost: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="liquid-button liquid-button-primary" style={{ marginTop: '8px', width: '100%' }}>
                  🛰 TRANSMIT FLIGHT DATA
                </button>
              </form>
            </div>

            {/* Dynamic preview card */}
            <div className="liquid-glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 className="hud-title" style={{ fontSize: '1.1rem', marginBottom: '8px', alignSelf: 'flex-start' }}>
                <span>🎫</span>
                LIVE BOARDING PASS PREVIEW
              </h3>
              <BoardingPassTicket flight={newFlight} />
            </div>
          </div>

          {/* COLUMN 2: Radar system & search controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <FlightRadar
              flights={flightList}
              onSelectFlight={(flight) => {
                setSingleFlight(flight);
                triggerToast(`Telemetry locked on ${flight.code}.`, 'info');
              }}
              selectedFlightCode={singleFlight?.code}
            />

            <FlightSearchPanel
              searchCode={searchCode}
              setSearchCode={setSearchCode}
              onSearchCode={handleFindByCode}
              searchCarrier={searchCarrier}
              setSearchCarrier={setSearchCarrier}
              onSearchCarrier={handleFindByCarrier}
              searchSource={searchSource}
              setSearchSource={setSearchSource}
              searchDestination={searchDestination}
              setSearchDestination={setSearchDestination}
              onSearchRoute={handleFindByRoute}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              onSearchPriceRange={handleFindByPriceRange}
              onReset={handleResetSearch}
            />
          </div>

          {/* COLUMN 3: Flight Manifest listing */}
          <div className="liquid-glass" style={{ minHeight: '620px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="hud-title" style={{ fontSize: '1.1rem' }}>
                <span>📁</span>
                ACTIVE LOG MANIFEST
              </h3>
              <button 
                onClick={fetchAllFlights}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-glow)',
                  fontSize: '0.85rem',
                  fontFamily: 'Space Grotesk',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ↻ REFRESH
              </button>
            </div>

            {/* If a single flight is searched */}
            {singleFlight ? (
              <div className="animate-fade-in" style={{
                background: 'rgba(0, 122, 255, 0.05)',
                border: '1px solid rgba(0, 122, 255, 0.25)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '20px',
                position: 'relative'
              }}>
                <button
                  onClick={() => setSingleFlight(null)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  ×
                </button>
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  SEARCHED TARGET RECORD
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.4rem', color: '#fff', margin: 0, fontFamily: 'Space Grotesk' }}>
                      {singleFlight.code}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{singleFlight.carrier}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.15rem', color: 'var(--primary-glow)', fontWeight: 600, margin: 0 }}>
                      ${parseFloat(singleFlight.cost).toFixed(2)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {singleFlight.source} ✈ {singleFlight.destination}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                  <button 
                    onClick={() => confirmDelete(singleFlight.code)} 
                    className="liquid-button liquid-button-danger" 
                    style={{ flex: 1, padding: '6px 12px' }}
                  >
                    Decommission
                  </button>
                  <button 
                    onClick={() => setSingleFlight(null)} 
                    className="liquid-button" 
                    style={{ flex: 1, padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Close Target
                  </button>
                </div>
              </div>
            ) : null}

            {/* List Manifest */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, maxHeight: '550px', paddingRight: '4px' }}>
              {flightList.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, opacity: 0.5, minHeight: '200px' }}>
                  <span style={{ fontSize: '2rem', marginBottom: '8px' }}>🛰</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Airspace is clear.<br />No manifest records registered.
                  </p>
                </div>
              ) : (
                flightList.map((flight) => {
                  const isHighlighted = singleFlight?.code === flight.code;
                  return (
                    <div 
                      key={flight.code} 
                      className="animate-fade-in"
                      style={{
                        background: isHighlighted ? 'rgba(0, 255, 213, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                        border: isHighlighted ? '1px solid rgba(0, 255, 213, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSingleFlight(flight)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = isHighlighted ? 'rgba(0, 255, 213, 0.5)' : 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.background = isHighlighted ? 'rgba(0, 255, 213, 0.06)' : 'rgba(255, 255, 255, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = isHighlighted ? 'rgba(0, 255, 213, 0.3)' : 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.background = isHighlighted ? 'rgba(0, 255, 213, 0.04)' : 'rgba(255, 255, 255, 0.02)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontFamily: 'Space Grotesk',
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: '#fff',
                            letterSpacing: '0.5px'
                          }}>
                            {flight.code}
                          </span>
                          <span style={{
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)'
                          }}>
                            {flight.carrier.substring(0, 16)}
                          </span>
                        </div>

                        <span style={{
                          fontFamily: 'Space Grotesk',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          color: 'var(--primary-glow)'
                        }}>
                          ${parseFloat(flight.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 'bold', color: '#fff' }}>{flight.source}</span>
                          <span>✈</span>
                          <span style={{ fontWeight: 'bold', color: '#fff' }}>{flight.destination}</span>
                        </div>

                        {/* Inline button stopped from bubble clicking details */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(flight.code);
                          }}
                          className="liquid-button liquid-button-danger"
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.7rem',
                            borderRadius: '6px'
                          }}
                        >
                          Decommission
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* custom modal backdrop for confirmation dialog */}
      {deletingFlightCode && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 7, 10, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          animation: 'fade-in 0.3s ease forwards'
        }}>
          <div className="liquid-glass" style={{ width: '380px', padding: '30px', textAlign: 'center', border: '1px solid rgba(255, 69, 58, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(255,69,58,0.1)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '14px', animation: 'pulse-glow 1.5s infinite' }}>⚠️</span>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '8px', fontFamily: 'Space Grotesk' }}>
              Decommission Flight?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to permanently decommission flight <strong>{deletingFlightCode}</strong> from active telemetry radars?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeletingFlightCode(null)}
                className="liquid-button"
                style={{ flex: 1, padding: '12px 0', fontSize: '0.9rem' }}
              >
                CANCEL
              </button>
              <button
                onClick={executeDelete}
                className="liquid-button"
                style={{
                  flex: 1,
                  padding: '12px 0',
                  fontSize: '0.9rem',
                  background: 'linear-gradient(135deg, rgba(255, 69, 58, 0.3) 0%, rgba(255, 69, 58, 0.1) 100%)',
                  borderColor: 'rgba(255, 69, 58, 0.6)',
                  color: '#ff6b64'
                }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;