import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft, faBell, faCalendarAlt, faHistory } from '@fortawesome/free-solid-svg-icons';

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
  }, [token]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      
      {/* 1. Hero-Style Header Section */}
      <div className="bg-[#f8fafc] py-12 px-[5%] mb-4 relative flex items-center justify-center">
        
        {/* TOP LEFT ARROW: Now ONLY available if there are alerts */}
        {!loading && alerts.length > 0 && (
          <div className="absolute left-[5%] top-1/2 -translate-y-1/2 hidden lg:block">
            <Link to="/" className="group flex items-center gap-4 no-underline transition-all duration-300">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center transition-all duration-300 group-hover:bg-[#10b981] group-hover:scale-110 shadow-sm">
                <FontAwesomeIcon 
                  icon={faArrowLeft} 
                  className="text-white text-lg transform group-hover:-translate-x-1 transition-transform" 
                />
              </div>
              
            </Link>
          </div>
        )}

        <div className="text-center flex flex-col items-center gap-2">
          <h1 className="text-2xl md:text-4xl font-[700] text-[#0f172a]  m-0 leading-[1.1]">
            Price <span className="text-[#10b981]">Alerts</span>
          </h1>
          <p className="text-lg md:text-2xl font-semibold text-slate-700 max-w-2xl mx-auto m-0 ">
            See every deal you've successfully hunted.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-[5%]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FontAwesomeIcon icon={faSpinner} className="text-[#10b981] text-4xl animate-spin mb-4" />
            <p className="text-slate-500 font-[900] tracking-tighter">Scanning for price drops...</p>
          </div>
        ) : alerts.length > 0 ? (
          <div className="flex flex-col gap-4">
           
            {alerts.map((alert) => (
              <div key={alert._id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-center gap-6 w-full">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#10b981] flex items-center justify-center text-2xl group-hover:bg-[#10b981] group-hover:text-white transition-colors duration-300 shadow-inner shrink-0">
                    <FontAwesomeIcon icon={faBell} />
                  </div>
                  
                  <div className="flex-grow">
                    <h3 className="text-[#0f172a] font-[700] text-xl  mb-1 line-clamp-1">
                      {alert.pid?.pname || "Product Alert"}
                    </h3>
                    <div className="flex items-center gap-4 text-slate-500 text-sm font-bold">
                      <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-xs text-slate-400" />
                        {new Date(alert.alertedAt).toLocaleDateString()}
                      </span>
                      <span className="bg-emerald-100 text-[#065f46] px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-black">
                        {alert.website || "Store"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 mt-4 md:mt-0 w-full md:w-auto justify-between border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                  <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest">New Price</span>
                    <span className="text-3xl font-[700] text-[#10b981]">
                      ₹{alert.newPrice}
                    </span>
                  </div>
                  <Link to="/tracked" className="bg-[#0f172a] hover:bg-black text-white px-6 py-3 rounded-xl font-[700]  transition-all flex items-center gap-2 no-underline">
                    View <FontAwesomeIcon icon={faHistory} className="text-xs" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 3. Styled Empty State */
          <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 max-w-2xl mx-auto px-10">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600 text-4xl">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <h2 className="text-2xl font-[700] text-slate-800 mb-2 ">No price alerts yet</h2>
            <p className="text-slate-500 mb-8 font-medium">We'll notify you here as soon as one of your tracked items hits your target price!</p>
            <Link to="/" className="group inline-flex items-center gap-3 no-underline">
                <div className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center transition-all duration-300 group-hover:bg-black group-hover:scale-110 shadow-sm">
                    <FontAwesomeIcon icon={faArrowLeft} className="text-white text-lg transform group-hover:-translate-x-1 transition-transform" />
                </div>
               
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceAlerts;