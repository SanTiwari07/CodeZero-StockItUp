import React, { useEffect, useState } from 'react';
import { fetchQuote } from './api';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchQuote('AAPL').then(setData);
  }, []);

  return (
    <div>
      <h1>Stock Tracker</h1>
      {data ? (
        <div>
          <p>Current Price: {data.c}</p>
          <p>High Price: {data.h}</p>
          <p>Low Price: {data.l}</p>
          <p>Open Price: {data.o}</p>
          <p>Previous Close: {data.pc}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
