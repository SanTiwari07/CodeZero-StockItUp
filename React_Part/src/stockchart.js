import { Line } from 'react-chartjs-2';

export default function StockChart({ labels, prices }) {
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Stock Price',
        data: prices,
        borderColor: 'green',
        fill: true
      }
    ]
  };

  return <Line data={chartData} />;
}
