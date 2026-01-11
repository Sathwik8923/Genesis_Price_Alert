import { useEffect, useState } from "react";

const PriceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/price-alerts", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // 🔐 SAFETY CHECK
        if (Array.isArray(data)) {
          setAlerts(data);
        } else if (Array.isArray(data.alerts)) {
          setAlerts(data.alerts);
        } else {
          setAlerts([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading alerts...</p>;

  if (alerts.length === 0) {
    return <p>No price alerts yet.</p>;
  }

  return (
    <div>
      <h2>Price Alerts History</h2>

      {alerts.map(alert => (
        <div key={alert._id} style={{ border: "1px solid #444", margin: "10px", padding: "10px" }}>
          <p><b>Product:</b> {alert.pid?.pname}</p>
          <p><b>Old Price:</b> ₹{alert.oldPrice}</p>
          <p><b>New Price:</b> ₹{alert.newPrice}</p>
          <p><b>Website:</b> {alert.website}</p>
          <p><b>Date:</b> {new Date(alert.alertedAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default PriceAlerts;
