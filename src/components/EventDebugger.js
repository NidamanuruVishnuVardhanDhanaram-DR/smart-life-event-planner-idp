import React from 'react';

const EventDebugger = ({ events }) => {
  return (
    <div className="card bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-6 rounded-2xl mb-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Event Data Debug</h2>
      <div className="text-white">
        <p>Total events: {events ? events.length : 0}</p>
        {events && events.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">First Event:</h3>
            <pre className="bg-black/30 p-4 rounded overflow-auto">
              {JSON.stringify(events[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDebugger;