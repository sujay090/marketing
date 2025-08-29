import { useState, useEffect } from 'react';
import { getTimezoneDebugInfo } from '../utils/timezone';

const TimezoneTest = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);

  useEffect(() => {
    setDebugInfo(getTimezoneDebugInfo());
    
    // Test server timezone endpoint
    const testServerTimezone = async () => {
      try {
        const response = await fetch('/api/timezone/info');
        const data = await response.json();
        setServerInfo(data);
      } catch (error) {
        console.error('Failed to fetch server timezone info:', error);
      }
    };

    testServerTimezone();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Timezone Debug Information</h2>
      
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Client Timezone Info</h5>
            </div>
            <div className="card-body">
              {debugInfo && (
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Server Timezone Info</h5>
            </div>
            <div className="card-body">
              {serverInfo ? (
                <pre>{JSON.stringify(serverInfo, null, 2)}</pre>
              ) : (
                <div className="text-muted">Loading server info...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimezoneTest;
