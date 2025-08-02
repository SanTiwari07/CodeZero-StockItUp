import axios from 'axios';

const API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;

export const fetchQuote = async (symbol) => {
  try {
    const res = await axios.get('https://finnhub.io/api/v1/quote', {
      params: { symbol, token: API_KEY }
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to fetch data');
  }
};
