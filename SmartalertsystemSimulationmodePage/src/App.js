// App.js
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom vehicle icons
const vehicleIcons = {
  car: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2251/2251874.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  }),
  van: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3576/3576876.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  }),
  truck: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3576/3576900.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  }),
  scooter: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3576/3576861.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  }),
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

// Enhanced permissions system
const PERMISSIONS = {
  [USER_ROLES.ADMIN]: ['all'],
  [USER_ROLES.MANAGER]: ['view', 'edit', 'manage_fleet', 'optimize_routes', 'view_reports', 'export_data'],
  [USER_ROLES.OPERATOR]: ['view', 'edit_limited', 'optimize_routes'],
  [USER_ROLES.VIEWER]: ['view']
};

// Initial users database
const initialUsers = [
  { id: 1, name: 'Admin User', email: 'admin@neurofleetx.com', password: 'admin123', role: USER_ROLES.ADMIN },
  { id: 2, name: 'Fleet Manager', email: 'manager@neurofleetx.com', password: 'manager123', role: USER_ROLES.MANAGER },
  { id: 3, name: 'Operator', email: 'operator@neurofleetx.com', password: 'operator123', role: USER_ROLES.OPERATOR },
  { id: 4, name: 'Viewer', email: 'viewer@neurofleetx.com', password: 'viewer123', role: USER_ROLES.VIEWER },
];

// Vehicle specifications
const VEHICLE_SPECS = {
  car: { maxSpeed: 120, capacity: 4, fuelEfficiency: 15, range: 300 },
  van: { maxSpeed: 100, capacity: 8, fuelEfficiency: 12, range: 250 },
  truck: { maxSpeed: 80, capacity: 2, fuelEfficiency: 8, range: 400 },
  scooter: { maxSpeed: 60, capacity: 1, fuelEfficiency: 40, range: 80 }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (isLocked) {
      alert('Account temporarily locked. Please try again later.');
      return;
    }

    const user = initialUsers.find(u => u.email === formData.email && u.password === formData.password);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginAttempts(0);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setLoginAttempts(0);
        }, 30000);
        alert('Too many failed attempts. Account locked for 30 seconds.');
      } else {
        alert(`Invalid email or password. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Check if email already exists
    if (initialUsers.find(u => u.email === formData.email)) {
      alert('Email already registered. Please use a different email.');
      return;
    }

    const newUser = {
      id: initialUsers.length + 1,
      ...formData,
      role: USER_ROLES.VIEWER
    };
    initialUsers.push(newUser);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
  };

  const toggleForm = () => {
    setIsLoginPage(!isLoginPage);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setFormData({
      name: '',
      email: '',
      password: ''
    });
  };

  if (isLoggedIn) {
    return <HomePage onLogout={handleLogout} currentUser={currentUser} />;
  }

  return (
    <div className="app">
      <div className="auth-container">
        <div className="auth-header">
          <h1>NeuroFleetX</h1>
          <p>AI-Driven Urban Mobility</p>
          {isLocked && <div className="lock-warning">Account temporarily locked. Please wait 30 seconds.</div>}
        </div>
        
        {isLoginPage ? (
          <LoginForm 
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleLogin}
            onToggleForm={toggleForm}
            isLocked={isLocked}
          />
        ) : (
          <SignupForm 
            formData={formData}
            onChange={handleInputChange}
            onSubmit={handleSignup}
            onToggleForm={toggleForm}
          />
        )}
      </div>
    </div>
  );
}

function LoginForm({ formData, onChange, onSubmit, onToggleForm, isLocked }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <h2>Login to Your Account</h2>
      <div className="form-group">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={onChange}
          required
          disabled={isLocked}
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={onChange}
          required
          disabled={isLocked}
        />
      </div>
      <button type="submit" className="auth-button" disabled={isLocked}>
        {isLocked ? 'Account Locked' : 'Login'}
      </button>
      <p className="form-toggle">
        Don't have an account? <span onClick={onToggleForm}>Sign up</span>
      </p>
    </form>
  );
}

function SignupForm({ formData, onChange, onSubmit, onToggleForm }) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      <h2>Create an Account</h2>
      <div className="form-group">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          name="password"
          placeholder="Password (min. 6 characters)"
          value={formData.password}
          onChange={onChange}
          required
          minLength="6"
        />
      </div>
      <button type="submit" className="auth-button">Sign Up</button>
      <p className="form-toggle">
        Already have an account? <span onClick={onToggleForm}>Login</span>
      </p>
    </form>
  );
}

function HomePage({ onLogout, currentUser }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicles, setVehicles] = useState([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [routeRequest, setRouteRequest] = useState({
    origin: '',
    destination: '',
    vehicleType: 'car',
    priority: 'fastest'
  });
  const [newVehicle, setNewVehicle] = useState({
    name: '',
    type: 'car',
    status: 'idle',
    licensePlate: ''
  });
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [weatherData, setWeatherData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Center coordinates for New Delhi, India
  const indiaCenter = [28.6139, 77.2090];

  // Check permissions
  const hasPermission = (permission) => {
    if (currentUser.role === USER_ROLES.ADMIN) return true;
    return PERMISSIONS[currentUser.role]?.includes(permission) || false;
  };

  // Load sample vehicles on first render with Indian locations
  useEffect(() => {
    const sampleVehicles = [
      {
        id: 1,
        name: 'Tata Nexon EV',
        type: 'car',
        status: 'in_use',
        battery: 78,
        location: { lat: 28.6139, lng: 77.2090 }, // New Delhi
        speed: 45,
        licensePlate: 'DL01AB1234',
        driver: 'Raj Kumar',
        phone: '+91 9876543210',
        lastService: '2024-01-15',
        nextService: '2024-04-15',
        maintenance: {
          engine: 85,
          tires: 70,
          brakes: 90,
          batteryHealth: 78,
          mileage: 12500
        },
        telemetry: {
          temperature: 24,
          rpm: 2200,
          fuelLevel: 78,
          tirePressure: { frontLeft: 32, frontRight: 31, rearLeft: 33, rearRight: 32 }
        }
      },
      {
        id: 2,
        name: 'Mahindra eVerito',
        type: 'car',
        status: 'idle',
        battery: 92,
        location: { lat: 28.4595, lng: 77.0266 }, // Gurugram
        speed: 0,
        licensePlate: 'HR26BR4567',
        driver: 'Priya Sharma',
        phone: '+91 9876543211',
        lastService: '2024-02-20',
        nextService: '2024-05-20',
        maintenance: {
          engine: 92,
          tires: 85,
          brakes: 88,
          batteryHealth: 92,
          mileage: 8700
        },
        telemetry: {
          temperature: 26,
          rpm: 0,
          fuelLevel: 92,
          tirePressure: { frontLeft: 33, frontRight: 33, rearLeft: 32, rearRight: 32 }
        }
      },
      {
        id: 3,
        name: 'Ashok Leyland Dost',
        type: 'truck',
        status: 'maintenance',
        battery: 34,
        location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
        speed: 0,
        licensePlate: 'KA01CD7890',
        driver: 'Anil Patel',
        phone: '+91 9876543212',
        lastService: '2023-12-10',
        nextService: '2024-03-10',
        maintenance: {
          engine: 45,
          tires: 30,
          brakes: 60,
          batteryHealth: 34,
          mileage: 32500
        },
        telemetry: {
          temperature: 28,
          rpm: 0,
          fuelLevel: 34,
          tirePressure: { frontLeft: 28, frontRight: 29, rearLeft: 27, rearRight: 28 }
        }
      },
      {
        id: 4,
        name: 'Ola S1 Pro',
        type: 'scooter',
        status: 'idle',
        battery: 100,
        location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
        speed: 0,
        licensePlate: 'MH02EF3456',
        driver: 'Suresh Kumar',
        phone: '+91 9876543213',
        lastService: '2024-01-30',
        nextService: '2024-04-30',
        maintenance: {
          engine: 95,
          tires: 90,
          brakes: 92,
          batteryHealth: 100,
          mileage: 3200
        },
        telemetry: {
          temperature: 30,
          rpm: 0,
          fuelLevel: 100,
          tirePressure: { frontLeft: 25, frontRight: 25, rearLeft: 28, rearRight: 28 }
        }
      },
      {
        id: 5,
        name: 'Tata Tigor EV',
        type: 'car',
        status: 'in_use',
        battery: 65,
        location: { lat: 13.0827, lng: 80.2707 }, // Chennai
        speed: 38,
        licensePlate: 'TN09GH6789',
        driver: 'Deepa Reddy',
        phone: '+91 9876543214',
        lastService: '2024-02-05',
        nextService: '2024-05-05',
        maintenance: {
          engine: 80,
          tires: 75,
          brakes: 82,
          batteryHealth: 65,
          mileage: 15200
        },
        telemetry: {
          temperature: 32,
          rpm: 1800,
          fuelLevel: 65,
          tirePressure: { frontLeft: 31, frontRight: 32, rearLeft: 30, rearRight: 31 }
        }
      },
      {
        id: 6,
        name: 'Mahindra eSupro',
        type: 'van',
        status: 'idle',
        battery: 88,
        location: { lat: 22.5726, lng: 88.3639 }, // Kolkata
        speed: 0,
        licensePlate: 'WB05IJ9012',
        driver: 'Amit Verma',
        phone: '+91 9876543215',
        lastService: '2024-01-25',
        nextService: '2024-04-25',
        maintenance: {
          engine: 88,
          tires: 80,
          brakes: 85,
          batteryHealth: 88,
          mileage: 18500
        },
        telemetry: {
          temperature: 29,
          rpm: 0,
          fuelLevel: 88,
          tirePressure: { frontLeft: 34, frontRight: 34, rearLeft: 33, rearRight: 33 }
        }
      }
    ];
    setVehicles(sampleVehicles);
    
    // Generate maintenance data
    const maintenanceStatus = [
      { status: 'Healthy', count: 4, color: '#0bb56d' },
      { status: 'Due', count: 1, color: '#e67e22' },
      { status: 'Critical', count: 1, color: '#e74c3c' }
    ];
    setMaintenanceData(maintenanceStatus);

    // Generate sample analytics
    setAnalytics({
      totalDistance: 12500,
      fuelSaved: 450,
      emissionsReduced: 1200,
      tripsCompleted: 345,
      averageSpeed: 42,
      utilizationRate: 78,
      activeVehicles: 2,
      revenue: 125000
    });

    // Generate sample alerts
    setAlerts([
      { id: 1, type: 'maintenance', message: 'Vehicle #3 needs immediate service', priority: 'high', timestamp: new Date() },
      { id: 2, type: 'battery', message: 'Vehicle #1 battery below 20%', priority: 'medium', timestamp: new Date() }
    ]);

    // Simulate weather data
    setWeatherData({
      temperature: 28,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12
    });

    // Simulate traffic data
    setTrafficData({
      congestionLevel: 'moderate',
      averageSpeed: 35,
      incidents: 3
    });

    // Add welcome notification
    addNotification(`Welcome back, ${currentUser.name}!`, 'info');
  }, [currentUser]);

  // Enhanced telemetry simulation with weather and traffic effects
  useEffect(() => {
    const interval = setInterval(() => {
      if (simulationMode) {
        setVehicles(prevVehicles => 
          prevVehicles.map(vehicle => {
            if (vehicle.status === 'in_use') {
              // Enhanced simulation with environmental factors
              const weatherFactor = weatherData?.condition === 'Rain' ? 0.8 : 1;
              const trafficFactor = trafficData?.congestionLevel === 'high' ? 0.7 : 
                                  trafficData?.congestionLevel === 'moderate' ? 0.9 : 1;
              
              const batteryChange = (Math.random() * 2 - 1) * weatherFactor;
              const speedChange = (Math.random() * 10 - 5) * trafficFactor;
              const latChange = (Math.random() - 0.5) * 0.001 * trafficFactor;
              const lngChange = (Math.random() - 0.5) * 0.001 * trafficFactor;
              
              const newVehicle = {
                ...vehicle,
                battery: Math.max(0, Math.min(100, vehicle.battery - batteryChange)),
                speed: Math.max(0, vehicle.speed + speedChange),
                location: {
                  lat: vehicle.location.lat + latChange,
                  lng: vehicle.location.lng + lngChange
                },
                maintenance: {
                  ...vehicle.maintenance,
                  batteryHealth: Math.max(0, Math.min(100, vehicle.maintenance.batteryHealth - batteryChange/10)),
                  mileage: vehicle.maintenance.mileage + (vehicle.speed / 60)
                },
                telemetry: {
                  ...vehicle.telemetry,
                  temperature: 20 + Math.random() * 15,
                  rpm: 1500 + Math.random() * 2000,
                  tirePressure: {
                    frontLeft: 30 + Math.random() * 4,
                    frontRight: 30 + Math.random() * 4,
                    rearLeft: 30 + Math.random() * 4,
                    rearRight: 30 + Math.random() * 4
                  }
                }
              };

              // Generate alerts based on conditions
              if (newVehicle.battery < 20 && !alerts.find(a => a.message.includes(`Vehicle #${vehicle.id} battery`))) {
                setAlerts(prev => [...prev, {
                  id: Date.now(),
                  type: 'battery',
                  message: `Vehicle #${vehicle.id} battery critically low`,
                  priority: 'high',
                  timestamp: new Date()
                }]);
                addNotification(`Vehicle ${vehicle.name} battery critically low`, 'warning');
              }

              return newVehicle;
            }
            return vehicle;
          })
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [simulationMode, weatherData, trafficData, alerts]);

  // Enhanced vehicle management
  const handleAddVehicle = () => {
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const indiaBounds = {
      lat: { min: 8.0, max: 37.0 },
      lng: { min: 68.0, max: 97.0 }
    };
    
    const vehicle = {
      id: vehicles.length > 0 ? Math.max(...vehicles.map(v => v.id)) + 1 : 1,
      ...newVehicle,
      battery: 100,
      location: { 
        lat: randomInRange(indiaBounds.lat.min, indiaBounds.lat.max),
        lng: randomInRange(indiaBounds.lng.min, indiaBounds.lng.max)
      },
      speed: 0,
      driver: 'Unassigned',
      phone: '+91 0000000000',
      lastService: new Date().toISOString().split('T')[0],
      nextService: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maintenance: {
        engine: 100,
        tires: 100,
        brakes: 100,
        batteryHealth: 100,
        mileage: 0
      },
      telemetry: {
        temperature: 25,
        rpm: 0,
        fuelLevel: 100,
        tirePressure: { frontLeft: 32, frontRight: 32, rearLeft: 32, rearRight: 32 }
      }
    };
    setVehicles([...vehicles, vehicle]);
    setNewVehicle({ name: '', type: 'car', status: 'idle', licensePlate: '' });
    setShowAddVehicle(false);

    // Add notification
    addNotification(`Vehicle ${vehicle.name} added to fleet`, 'success');
  };

  const handleUpdateVehicle = () => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === editingVehicle.id ? editingVehicle : vehicle
    ));
    setEditingVehicle(null);
    addNotification(`Vehicle ${editingVehicle.name} updated`, 'success');
  };

  const handleDeleteVehicle = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    addNotification(`Vehicle ${vehicle.name} removed from fleet`, 'warning');
  };

  const handleInputChange = (e, field) => {
    if (editingVehicle) {
      setEditingVehicle({
        ...editingVehicle,
        [field]: e.target.value
      });
    } else {
      setNewVehicle({
        ...newVehicle,
        [field]: e.target.value
      });
    }
  };

  // Enhanced route optimization with AI simulation
  const optimizeRoute = () => {
    const distance = Math.floor(Math.random() * 100) + 20;
    const baseTime = Math.floor(distance / 40 * 60);
    
    // Factor in traffic and weather
    const trafficDelay = trafficData?.congestionLevel === 'high' ? baseTime * 0.3 : 
                        trafficData?.congestionLevel === 'moderate' ? baseTime * 0.15 : 0;
    const weatherDelay = weatherData?.condition === 'Rain' ? baseTime * 0.2 : 0;
    
    const totalTime = baseTime + trafficDelay + weatherDelay;
    const savings = Math.floor(Math.random() * 15) + 5;

    const route = [
      { lat: 28.6139, lng: 77.2090 },
      { lat: 28.4595, lng: 77.0266 },
      { lat: 28.4089, lng: 77.3178 }
    ];

    setOptimizationResult({
      distance: `${distance} km`,
      estimatedTime: `${Math.floor(totalTime)} minutes`,
      fuelSavings: `${savings}%`,
      recommendedVehicle: routeRequest.vehicleType,
      trafficDelay: `${Math.floor(trafficDelay)} minutes`,
      weatherImpact: weatherDelay > 0 ? 'Yes' : 'No',
      route: route,
      waypoints: route,
      co2Reduction: Math.floor(distance * 0.12 * (savings/100))
    });

    setSelectedRoute(route);
    addNotification('Route optimized successfully', 'success');
  };

  // Notification system
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Enhanced data export with multiple formats
  const exportData = (format, dataType = 'fleet') => {
    let data = '';
    let filename = '';
    
    switch(dataType) {
      case 'fleet':
        data = vehicles;
        filename = `fleet_data_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'maintenance':
        data = vehicles.map(v => ({
          name: v.name,
          maintenanceStatus: getMaintenanceStatus(v),
          lastService: v.lastService,
          nextService: v.nextService
        }));
        filename = `maintenance_data_${new Date().toISOString().split('T')[0]}`;
        break;
      case 'analytics':
        data = analytics;
        filename = `analytics_${new Date().toISOString().split('T')[0]}`;
        break;
    }

    if (format === 'csv') {
      // Simulate CSV export
      alert(`Exporting ${filename} as CSV`);
    } else if (format === 'json') {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      alert(`Exporting ${filename} as PDF`);
    }
    
    addNotification(`${dataType} data exported as ${format.toUpperCase()}`, 'success');
  };

  // Filter vehicles based on search and filters
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    const matchesType = filterType === 'all' || vehicle.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Batch operations
  const batchUpdateStatus = (status) => {
    if (hasPermission('manage_fleet')) {
      setVehicles(prev => prev.map(vehicle => ({ ...vehicle, status })));
      addNotification(`All vehicles status updated to ${getStatusText(status)}`, 'success');
    }
  };

  const scheduleMaintenance = (vehicleId, date) => {
    setVehicles(prev => 
      prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, nextService: date }
          : vehicle
      )
    );
    addNotification(`Maintenance scheduled for vehicle #${vehicleId}`, 'info');
  };

  // Utility functions
  const getStatusText = (status) => {
    switch(status) {
      case 'idle': return 'Available';
      case 'in_use': return 'In Use';
      case 'maintenance': return 'Needs Service';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'idle': return 'status-available';
      case 'in_use': return 'status-in-use';
      case 'maintenance': return 'status-maintenance';
      default: return '';
    }
  };

  const getMaintenanceStatus = (vehicle) => {
    const avgHealth = (
      vehicle.maintenance.engine + 
      vehicle.maintenance.tires + 
      vehicle.maintenance.brakes + 
      vehicle.maintenance.batteryHealth
    ) / 4;
    
    if (avgHealth >= 80) return 'Healthy';
    if (avgHealth >= 50) return 'Due';
    return 'Critical';
  };

  const canEdit = () => {
    return currentUser.role === USER_ROLES.ADMIN || currentUser.role === USER_ROLES.MANAGER;
  };

  const canViewSensitive = () => {
    return currentUser.role === USER_ROLES.ADMIN || currentUser.role === USER_ROLES.MANAGER || currentUser.role === USER_ROLES.OPERATOR;
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <div>
            <h1>NeuroFleetX India</h1>
            <p>AI-Driven Urban Mobility Solutions | Logged in as: {currentUser.name} ({currentUser.role})</p>
          </div>
          
          {/* Notifications Bell */}
          <div className="notification-container">
            <button className="notification-bell">
              🔔
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <button onClick={() => setNotifications([])}>Clear All</button>
              </div>
              {notifications.slice(0, 5).map(notif => (
                <div key={notif.id} className={`notification-item ${notif.type} ${notif.read ? 'read' : ''}`}>
                  <p>{notif.message}</p>
                  <small>{notif.timestamp.toLocaleTimeString()}</small>
                  {!notif.read && (
                    <button onClick={() => markNotificationAsRead(notif.id)}>Mark read</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <nav className="nav-tabs">
            <button className={activeTab === 'dashboard' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab('dashboard')}>
              Dashboard
            </button>
            <button className={activeTab === 'fleet' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab('fleet')}>
              Fleet Management
            </button>
            <button className={activeTab === 'optimization' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab('optimization')}>
              Route Optimization
            </button>
            <button className={activeTab === 'maintenance' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab('maintenance')}>
              Maintenance
            </button>
            <button className={activeTab === 'analytics' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab('analytics')}>
              Analytics
            </button>
            <button className={activeTab === 'map' ? 'nav-tab active' : 'nav-tab'} onClick={() => setActiveTab('map')}>
              Live Map
            </button>
          </nav>
          
          <div className="header-actions">
            <button 
              className={`simulation-toggle ${simulationMode ? 'active' : ''}`}
              onClick={() => {
                setSimulationMode(!simulationMode);
                addNotification(`Simulation mode ${!simulationMode ? 'enabled' : 'disabled'}`, 'info');
              }}
            >
              Simulation: {simulationMode ? 'ON' : 'OFF'}
            </button>
            <button onClick={onLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="alert-banner">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.priority}`}>
              <span>{alert.message}</span>
              <button onClick={() => clearAlert(alert.id)}>×</button>
            </div>
          ))}
        </div>
      )}
      
      <main className="home-content">
        {activeTab === 'dashboard' ? (
          <DashboardView 
            vehicles={vehicles}
            analytics={analytics}
            alerts={alerts}
            weatherData={weatherData}
            trafficData={trafficData}
            currentUser={currentUser}
          />
        ) : activeTab === 'fleet' ? (
          <FleetManagementView 
            vehicles={filteredVehicles}
            showAddVehicle={showAddVehicle}
            setShowAddVehicle={setShowAddVehicle}
            editingVehicle={editingVehicle}
            setEditingVehicle={setEditingVehicle}
            newVehicle={newVehicle}
            setNewVehicle={setNewVehicle}
            handleAddVehicle={handleAddVehicle}
            handleUpdateVehicle={handleUpdateVehicle}
            handleDeleteVehicle={handleDeleteVehicle}
            handleInputChange={handleInputChange}
            exportData={exportData}
            canEdit={canEdit}
            canViewSensitive={canViewSensitive}
            batchUpdateStatus={batchUpdateStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            getStatusText={getStatusText}
            getStatusClass={getStatusClass}
            getMaintenanceStatus={getMaintenanceStatus}
            getIndianCityName={getIndianCityName}
          />
        ) : activeTab === 'optimization' ? (
          <OptimizationView 
            routeRequest={routeRequest}
            setRouteRequest={setRouteRequest}
            optimizeRoute={optimizeRoute}
            optimizationResult={optimizationResult}
            selectedRoute={selectedRoute}
            weatherData={weatherData}
            trafficData={trafficData}
            indiaCenter={indiaCenter}
            handleRouteInputChange={handleRouteInputChange}
          />
        ) : activeTab === 'maintenance' ? (
          <MaintenanceView 
            vehicles={vehicles}
            maintenanceData={maintenanceData}
            canViewSensitive={canViewSensitive}
            scheduleMaintenance={scheduleMaintenance}
            getMaintenanceStatus={getMaintenanceStatus}
          />
        ) : activeTab === 'analytics' ? (
          <AnalyticsView 
            analytics={analytics}
            vehicles={vehicles}
            exportData={exportData}
            maintenanceData={maintenanceData}
          />
        ) : (
          <LiveMapView 
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            indiaCenter={indiaCenter}
            vehicleIcons={vehicleIcons}
            canViewSensitive={canViewSensitive}
            selectedRoute={selectedRoute}
            getStatusText={getStatusText}
            getStatusClass={getStatusClass}
            getMaintenanceStatus={getMaintenanceStatus}
            getIndianCityName={getIndianCityName}
          />
        )}
      </main>
      
      <footer className="home-footer">
        <p>© 2024 NeuroFleetX India. All rights reserved. | v2.0 Enhanced</p>
      </footer>
    </div>
  );
}

// Enhanced Dashboard Component
function DashboardView({ vehicles, analytics, alerts, weatherData, trafficData, currentUser }) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h2>Revolutionizing Urban Transportation in India</h2>
          <p>NeuroFleetX leverages cutting-edge artificial intelligence to optimize urban mobility, reduce congestion, and create smarter, more efficient cities across India.</p>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Vehicles</h3>
          <p className="stat-number">{vehicles.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Trips</h3>
          <p className="stat-number">{vehicles.filter(v => v.status === 'in_use').length}</p>
        </div>
        <div className="stat-card">
          <h3>Fuel Saved</h3>
          <p className="stat-number">{analytics.fuelSaved}L</p>
        </div>
        <div className="stat-card">
          <h3>Utilization Rate</h3>
          <p className="stat-number">{analytics.utilizationRate}%</p>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="environmental-data">
        <div className="weather-card">
          <h3>Weather Conditions</h3>
          {weatherData && (
            <>
              <p>Temperature: {weatherData.temperature}°C</p>
              <p>Condition: {weatherData.condition}</p>
              <p>Humidity: {weatherData.humidity}%</p>
            </>
          )}
        </div>
        <div className="traffic-card">
          <h3>Traffic Overview</h3>
          {trafficData && (
            <>
              <p>Congestion: {trafficData.congestionLevel}</p>
              <p>Average Speed: {trafficData.averageSpeed} km/h</p>
              <p>Incidents: {trafficData.incidents}</p>
            </>
          )}
        </div>
      </div>

      <section className="features-section">
        <h2>How NeuroFleetX Transforms Urban Mobility in India</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>AI-Powered Routing</h3>
            <p>Our advanced algorithms analyze real-time traffic data, weather conditions, and historical patterns to create the most efficient routes.</p>
          </div>
          <div className="feature-card">
            <h3>Predictive Maintenance</h3>
            <p>AI-driven maintenance predictions reduce downtime and extend vehicle lifespan through proactive servicing.</p>
          </div>
          <div className="feature-card">
            <h3>Real-time Analytics</h3>
            <p>Comprehensive analytics dashboard providing insights into fleet performance and operational efficiency.</p>
          </div>
          <div className="feature-card">
            <h3>Smart Notifications</h3>
            <p>Real-time alerts and notifications for maintenance, low battery, and operational issues.</p>
          </div>
          <div className="feature-card">
            <h3>Environmental Monitoring</h3>
            <p>Track weather and traffic conditions to optimize routes and improve safety.</p>
          </div>
          <div className="feature-card">
            <h3>Advanced Reporting</h3>
            <p>Export data in multiple formats for detailed analysis and reporting.</p>
          </div>
        </div>
      </section>
    </>
  );
}

// Enhanced Fleet Management Component
function FleetManagementView({ 
  vehicles, showAddVehicle, setShowAddVehicle, editingVehicle, setEditingVehicle, 
  newVehicle, setNewVehicle, handleAddVehicle, handleUpdateVehicle, handleDeleteVehicle, 
  handleInputChange, exportData, canEdit, canViewSensitive, batchUpdateStatus,
  searchTerm, setSearchTerm, filterStatus, setFilterStatus, filterType, setFilterType,
  getStatusText, getStatusClass, getMaintenanceStatus, getIndianCityName
}) {
  return (
    <section className="fleet-section">
      <div className="fleet-header">
        <h2>Fleet Management</h2>
        <div className="fleet-actions">
          {canEdit && (
            <>
              <button className="add-vehicle-btn" onClick={() => setShowAddVehicle(true)}>
                + Add Vehicle
              </button>
              <div className="batch-actions-dropdown">
                <button className="batch-action-btn">Batch Actions ▼</button>
                <div className="batch-actions-menu">
                  <button onClick={() => batchUpdateStatus('idle')}>Set All Available</button>
                  <button onClick={() => batchUpdateStatus('maintenance')}>Schedule Maintenance</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="fleet-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search vehicles, license plates, drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="idle">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="car">Car</option>
            <option value="van">Van</option>
            <option value="truck">Truck</option>
            <option value="scooter">Scooter</option>
          </select>
        </div>
      </div>

      {/* Export Options */}
      <div className="export-actions">
        <button onClick={() => exportData('csv', 'fleet')} className="export-btn">Export CSV</button>
        <button onClick={() => exportData('json', 'fleet')} className="export-btn">Export JSON</button>
        <button onClick={() => exportData('pdf', 'fleet')} className="export-btn">Export PDF</button>
      </div>

      {/* Enhanced Vehicles Grid */}
      <div className="vehicles-grid">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="vehicle-header">
              <div className="vehicle-info">
                <h3>{vehicle.name}</h3>
                <span className="license-plate">{vehicle.licensePlate}</span>
              </div>
              <div className="vehicle-controls">
                <span className={`status-chip ${getStatusClass(vehicle.status)}`}>
                  {getStatusText(vehicle.status)}
                </span>
              </div>
            </div>
            
            <div className="vehicle-type">{vehicle.type.toUpperCase()}</div>
            
            <div className="vehicle-details">
              <div className="detail-row">
                <span className="label">Driver:</span>
                <span className="value">{vehicle.driver}</span>
              </div>
              <div className="detail-row">
                <span className="label">Location:</span>
                <span className="value">
                  {getIndianCityName(vehicle.location.lat, vehicle.location.lng)}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Speed:</span>
                <span className="value">{vehicle.speed.toFixed(0)} km/h</span>
              </div>
              <div className="detail-row">
                <span className="label">Battery:</span>
                <div className="battery-container">
                  <div className="battery-level">
                    <div 
                      className="battery-fill"
                      style={{ width: `${vehicle.battery}%` }}
                    ></div>
                  </div>
                  <span className="battery-percent">{vehicle.battery.toFixed(0)}%</span>
                </div>
              </div>
              {canViewSensitive && (
                <>
                  <div className="detail-row">
                    <span className="label">Maintenance:</span>
                    <span className={`value ${getMaintenanceStatus(vehicle).toLowerCase()}`}>
                      {getMaintenanceStatus(vehicle)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Next Service:</span>
                    <span className="value">{vehicle.nextService}</span>
                  </div>
                </>
              )}
            </div>
            {canEdit && (
              <div className="vehicle-actions">
                <button 
                  className="action-btn edit"
                  onClick={() => setEditingVehicle(vehicle)}
                >
                  Edit
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicle && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Vehicle</h3>
            <div className="form-group">
              <label>Vehicle Name</label>
              <input
                type="text"
                value={newVehicle.name}
                onChange={(e) => handleInputChange(e, 'name')}
                placeholder="Enter vehicle name"
              />
            </div>
            <div className="form-group">
              <label>License Plate</label>
              <input
                type="text"
                value={newVehicle.licensePlate}
                onChange={(e) => handleInputChange(e, 'licensePlate')}
                placeholder="Enter license plate"
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={newVehicle.type}
                onChange={(e) => handleInputChange(e, 'type')}
              >
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
                <option value="scooter">Scooter</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={newVehicle.status}
                onChange={(e) => handleInputChange(e, 'status')}
              >
                <option value="idle">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Needs Service</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddVehicle(false)}>Cancel</button>
              <button onClick={handleAddVehicle}>Add Vehicle</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Vehicle</h3>
            <div className="form-group">
              <label>Vehicle Name</label>
              <input
                type="text"
                value={editingVehicle.name}
                onChange={(e) => handleInputChange(e, 'name')}
              />
            </div>
            <div className="form-group">
              <label>Driver</label>
              <input
                type="text"
                value={editingVehicle.driver}
                onChange={(e) => handleInputChange(e, 'driver')}
              />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select
                value={editingVehicle.type}
                onChange={(e) => handleInputChange(e, 'type')}
              >
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="truck">Truck</option>
                <option value="scooter">Scooter</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                value={editingVehicle.status}
                onChange={(e) => handleInputChange(e, 'status')}
              >
                <option value="idle">Available</option>
                <option value='in_use'>In Use</option>
                <option value='maintenance'>Needs Service</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setEditingVehicle(null)}>Cancel</button>
              <button onClick={handleUpdateVehicle}>Update Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Enhanced Optimization View
function OptimizationView({ 
  routeRequest, setRouteRequest, optimizeRoute, optimizationResult, 
  selectedRoute, weatherData, trafficData, indiaCenter, handleRouteInputChange 
}) {
  return (
    <section className="optimization-section">
      <h2>AI Route & Load Optimization</h2>
      
      {/* Environmental Factors Display */}
      <div className="environmental-factors">
        {weatherData && (
          <div className="factor-card">
            <h4>Weather Impact</h4>
            <p>{weatherData.condition} - {weatherData.temperature}°C</p>
          </div>
        )}
        {trafficData && (
          <div className="factor-card">
            <h4>Traffic Conditions</h4>
            <p>{trafficData.congestionLevel} congestion</p>
          </div>
        )}
      </div>

      <div className="optimization-form">
        <div className="form-row">
          <div className="form-group">
            <label>Origin</label>
            <input
              type="text"
              name="origin"
              value={routeRequest.origin}
              onChange={handleRouteInputChange}
              placeholder="Starting location"
            />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              name="destination"
              value={routeRequest.destination}
              onChange={handleRouteInputChange}
              placeholder="Destination"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Vehicle Type</label>
            <select
              name="vehicleType"
              value={routeRequest.vehicleType}
              onChange={handleRouteInputChange}
            >
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
              <option value="scooter">Scooter</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Optimization Priority</label>
            <select
              name="priority"
              value={routeRequest.priority}
              onChange={handleRouteInputChange}
            >
              <option value="fastest">Fastest Route</option>
              <option value="shortest">Shortest Distance</option>
              <option value="eco">Eco-Friendly</option>
              <option value="safe">Safest Route</option>
            </select>
          </div>
        </div>
        
        <button onClick={optimizeRoute} className="optimize-button">
          Optimize Route
        </button>
      </div>
      
      {optimizationResult && (
        <div className="optimization-result">
          <h3>Optimization Results</h3>
          <div className="result-grid">
            <div className="result-card">
              <h4>Distance</h4>
              <p>{optimizationResult.distance}</p>
            </div>
            <div className="result-card">
              <h4>Estimated Time</h4>
              <p>{optimizationResult.estimatedTime}</p>
            </div>
            <div className="result-card">
              <h4>Fuel Savings</h4>
              <p>{optimizationResult.fuelSavings}</p>
            </div>
            <div className="result-card">
              <h4>CO₂ Reduction</h4>
              <p>{optimizationResult.co2Reduction} kg</p>
            </div>
          </div>
          
          <div className="route-visualization">
            <h4>Recommended Route</h4>
            <div className="map-container mini-map">
              <MapContainer
                center={indiaCenter}
                zoom={10}
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {selectedRoute && (
                  <Polyline positions={selectedRoute} color="blue" />
                )}
                {optimizationResult.route.map((point, index) => (
                  <Marker
                    key={index}
                    position={[point.lat, point.lng]}
                  >
                    <Popup>
                      Point {index + 1}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// New Analytics View Component
function AnalyticsView({ analytics, vehicles, exportData, maintenanceData }) {
  return (
    <section className="analytics-section">
      <h2>Fleet Analytics & Insights</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Performance Metrics</h3>
          <div className="metric">
            <span>Total Distance Covered</span>
            <span>{analytics.totalDistance} km</span>
          </div>
          <div className="metric">
            <span>Trips Completed</span>
            <span>{analytics.tripsCompleted}</span>
          </div>
          <div className="metric">
            <span>Average Speed</span>
            <span>{analytics.averageSpeed} km/h</span>
          </div>
          <div className="metric">
            <span>Utilization Rate</span>
            <span>{analytics.utilizationRate}%</span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Environmental Impact</h3>
          <div className="metric">
            <span>Fuel Saved</span>
            <span>{analytics.fuelSaved} liters</span>
          </div>
          <div className="metric">
            <span>Emissions Reduced</span>
            <span>{analytics.emissionsReduced} kg CO₂</span>
          </div>
          <div className="metric">
            <span>Active Vehicles</span>
            <span>{analytics.activeVehicles}</span>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Maintenance Overview</h3>
          <div className="metric">
            <span>Healthy Vehicles</span>
            <span>{maintenanceData.find(d => d.status === 'Healthy')?.count || 0}</span>
          </div>
          <div className="metric">
            <span>Due for Service</span>
            <span>{maintenanceData.find(d => d.status === 'Due')?.count || 0}</span>
          </div>
          <div className="metric">
            <span>Critical Vehicles</span>
            <span>{maintenanceData.find(d => d.status === 'Critical')?.count || 0}</span>
          </div>
        </div>
      </div>

      <div className="analytics-actions">
        <button onClick={() => exportData('json', 'analytics')} className="export-btn">
          Export Analytics Data
        </button>
        <button onClick={() => exportData('csv', 'analytics')} className="export-btn">
          Export as CSV
        </button>
      </div>
    </section>
  );
}

// Enhanced Live Map View
function LiveMapView({ 
  vehicles, selectedVehicle, setSelectedVehicle, indiaCenter, vehicleIcons, 
  canViewSensitive, selectedRoute, getStatusText, getStatusClass, getMaintenanceStatus, getIndianCityName 
}) {
  return (
    <section className="map-section">
      <div className="map-header">
        <h2>Live Vehicle Tracking - India</h2>
        <div className="map-controls">
          <select 
            value={selectedVehicle?.id || ''} 
            onChange={(e) => {
              const vehicleId = parseInt(e.target.value);
              const vehicle = vehicles.find(v => v.id === vehicleId);
              setSelectedVehicle(vehicle || null);
            }}
          >
            <option value="">Select a vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name} ({getStatusText(vehicle.status)})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="map-container">
        <MapContainer
          center={indiaCenter}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Display optimized route if available */}
          {selectedRoute && (
            <Polyline positions={selectedRoute} color="blue" weight={4} opacity={0.7} />
          )}
          
          {vehicles.map(vehicle => (
            <Marker
              key={vehicle.id}
              position={[vehicle.location.lat, vehicle.location.lng]}
              icon={vehicleIcons[vehicle.type]}
            >
              <Popup>
                <div className="vehicle-popup">
                  <h3>{vehicle.name}</h3>
                  <p><strong>Type:</strong> {vehicle.type}</p>
                  <p><strong>Status:</strong> {getStatusText(vehicle.status)}</p>
                  <p><strong>Battery:</strong> {vehicle.battery.toFixed(0)}%</p>
                  <p><strong>Speed:</strong> {vehicle.speed.toFixed(0)} km/h</p>
                  <p><strong>Location:</strong> {getIndianCityName(vehicle.location.lat, vehicle.location.lng)}</p>
                  {canViewSensitive && (
                    <>
                      <p><strong>Driver:</strong> {vehicle.driver}</p>
                      <p><strong>Maintenance:</strong> {getMaintenanceStatus(vehicle)}</p>
                      <p><strong>Next Service:</strong> {vehicle.nextService}</p>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {selectedVehicle && (
        <div className="selected-vehicle-info">
          <h3>{selectedVehicle.name} Details</h3>
          <div className="vehicle-details-grid">
            <div className="detail-item">
              <span className="label">Type:</span>
              <span className="value">{selectedVehicle.type.toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`value ${getStatusClass(selectedVehicle.status)}`}>
                {getStatusText(selectedVehicle.status)}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Battery:</span>
              <span className="value">{selectedVehicle.battery.toFixed(0)}%</span>
            </div>
            <div className="detail-item">
              <span className="label">Speed:</span>
              <span className="value">{selectedVehicle.speed.toFixed(0)} km/h</span>
            </div>
            <div className="detail-item">
              <span className="label">Location:</span>
              <span className="value">
                {getIndianCityName(selectedVehicle.location.lat, selectedVehicle.location.lng)}
              </span>
            </div>
            {canViewSensitive && (
              <>
                <div className="detail-item">
                  <span className="label">Driver:</span>
                  <span className="value">{selectedVehicle.driver}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span className="value">{selectedVehicle.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="label">License Plate:</span>
                  <span className="value">{selectedVehicle.licensePlate}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Maintenance Status:</span>
                  <span className={`value ${getMaintenanceStatus(selectedVehicle).toLowerCase()}`}>
                    {getMaintenanceStatus(selectedVehicle)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Next Service:</span>
                  <span className="value">{selectedVehicle.nextService}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// Keep your existing MaintenanceView component (similar structure as before)
function MaintenanceView({ vehicles, maintenanceData, canViewSensitive, scheduleMaintenance, getMaintenanceStatus }) {
  // Your existing maintenance component code here
  return (
    <section className="maintenance-section">
      <h2>Predictive Maintenance & Health Analytics</h2>
      
      <div className="maintenance-overview">
        <div className="maintenance-stats">
          <h3>Fleet Health Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Healthy</h4>
              <p className="stat-value healthy">{maintenanceData.find(d => d.status === 'Healthy')?.count || 0}</p>
            </div>
            <div className="stat-card">
              <h4>Due for Service</h4>
              <p className="stat-value due">{maintenanceData.find(d => d.status === 'Due')?.count || 0}</p>
            </div>
            <div className="stat-card">
              <h4>Critical</h4>
              <p className="stat-value critical">{maintenanceData.find(d => d.status === 'Critical')?.count || 0}</p>
            </div>
          </div>
          
          <div className="maintenance-chart">
            <h4>Maintenance Status Distribution</h4>
            <div className="chart-container">
              <div className="pie-chart">
                {maintenanceData.map((item, index) => {
                  const percentage = (item.count / vehicles.length) * 100;
                  const offset = maintenanceData.slice(0, index).reduce((acc, curr) => acc + (curr.count / vehicles.length) * 100, 0);
                  
                  return (
                    <div 
                      key={item.status}
                      className="pie-segment"
                      style={{
                        backgroundColor: item.color,
                        transform: `rotate(${offset * 3.6}deg)`,
                        clipPath: `conic-gradient(transparent 0deg, transparent ${percentage * 3.6}deg)`
                      }}
                      title={`${item.status}: ${percentage.toFixed(1)}%`}
                    ></div>
                  );
                })}
              </div>
              <div className="chart-legend">
                {maintenanceData.map(item => (
                  <div key={item.status} className="legend-item">
                    <span className="legend-color" style={{backgroundColor: item.color}}></span>
                    <span>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="maintenance-list">
          <h3>Vehicle Health Details</h3>
          <table className="vehicle-health-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Engine</th>
                <th>Tires</th>
                <th>Brakes</th>
                <th>Battery</th>
                <th>Status</th>
                {canViewSensitive && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle.id}>
                  <td>{vehicle.name}</td>
                  <td>{vehicle.type}</td>
                  <td>
                    <div className="health-bar">
                      <div 
                        className="health-fill" 
                        style={{width: `${vehicle.maintenance.engine}%`}}
                      ></div>
                      <span>{vehicle.maintenance.engine}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="health-bar">
                      <div 
                        className="health-fill" 
                        style={{width: `${vehicle.maintenance.tires}%`}}
                      ></div>
                      <span>{vehicle.maintenance.tires}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="health-bar">
                      <div 
                        className="health-fill" 
                        style={{width: `${vehicle.maintenance.brakes}%`}}
                      ></div>
                      <span>{vehicle.maintenance.brakes}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="health-bar">
                      <div 
                        className="health-fill" 
                        style={{width: `${vehicle.maintenance.batteryHealth}%`}}
                      ></div>
                      <span>{vehicle.maintenance.batteryHealth}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`health-status ${getMaintenanceStatus(vehicle).toLowerCase()}`}>
                      {getMaintenanceStatus(vehicle)}
                    </span>
                  </td>
                  {canViewSensitive && (
                    <td>
                      <button 
                        className="action-btn schedule"
                        onClick={() => scheduleMaintenance(vehicle.id, new Date().toISOString().split('T')[0])}
                      >
                        Schedule
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// Helper function to get Indian city name from coordinates
function getIndianCityName(lat, lng) {
  // Approximate coordinates for major Indian cities
  const cities = [
    { name: "New Delhi", lat: 28.6139, lng: 77.2090 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
    { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
    { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { name: "Gurugram", lat: 28.4595, lng: 77.0266 },
    { name: "Noida", lat: 28.5355, lng: 77.3910 }
  ];

  // Find the closest city
  let closestCity = cities[0];
  let minDistance = Number.MAX_VALUE;

  for (const city of cities) {
    const distance = Math.sqrt(
      Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  }

  // If the distance is small enough, return the city name
  if (minDistance < 1.5) { // Approximately 1.5 degrees (roughly 150km)
    return closestCity.name;
  }

  // Otherwise return coordinates
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export default App;