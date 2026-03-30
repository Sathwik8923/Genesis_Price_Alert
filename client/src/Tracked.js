import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft, faTag, faExternalLinkAlt, faChartLine, faTimes } from '@fortawesome/free-solid-svg-icons';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
    CartesianGrid
} from 'recharts';

// ✅ Price History Modal with recharts line chart
const PriceHistoryModal = ({ product, targetPrice, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`/product/${product._id}/history`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                const formatted = (data.priceHistory || []).map(entry => ({
                    price: entry.price,
                    date: new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                }));
                setHistory(formatted);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [product._id, token]);

    const prices = history.map(h => h.price);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const dropped = prices.length >= 2 && prices[prices.length - 1] < prices[0];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
                    <p className="text-xs text-slate-500 font-semibold mb-1">{label}</p>
                    <p className="text-lg font-extrabold text-[#0f172a]">₹{payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                        <h2 className="text-lg font-bold text-[#0f172a] line-clamp-2">{product.pname}</h2>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{product.website}</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {/* Stats row */}
                {!loading && history.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Current</p>
                            <p className="text-xl font-extrabold text-[#0f172a]">₹{product.currentprice}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Lowest</p>
                            <p className="text-xl font-extrabold text-emerald-600">₹{minPrice}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Your Target</p>
                            <p className="text-xl font-extrabold text-[#0f172a]">₹{targetPrice}</p>
                        </div>
                    </div>
                )}

                {/* Chart */}
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <FontAwesomeIcon icon={faSpinner} className="text-emerald-500 text-3xl animate-spin" />
                    </div>
                ) : history.length < 2 ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl">
                        <p className="text-slate-400 font-bold text-sm">Not enough data yet</p>
                        <p className="text-slate-400 text-xs mt-1">Check back after the next price update (runs every 30 min)</p>
                    </div>
                ) : (
                    <>
                        <div className={`text-center text-sm font-bold mb-3 ${dropped ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {dropped
                                ? `📉 Price dropped ₹${prices[0] - prices[prices.length - 1]} since tracking started`
                                : `📊 Tracking ${history.length} data points`}
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `₹${v}`}
                                    domain={['auto', 'auto']}
                                    width={65}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                {/* Target price reference line */}
                                <ReferenceLine
                                    y={targetPrice}
                                    stroke="#10b981"
                                    strokeDasharray="4 4"
                                    strokeWidth={2}
                                    label={{ value: 'Target', position: 'insideTopRight', fontSize: 11, fill: '#10b981', fontWeight: 700 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke="#0f172a"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#0f172a' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}
            </div>
        </div>
    );
};

const Tracked = () => {
    const [details, setDetails] = useState([]);
    const [isPending, setIsPending] = useState(true);
    const [historyModal, setHistoryModal] = useState(null); // { product, targetPrice }
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch("/tracked", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setDetails(data);
                setIsPending(false);
            })
            .catch((err) => {
                console.log(err);
                setIsPending(false);
            });
    }, [token]);

    const handleDelete = (trackedId) => {
        fetch(`/tracked/${trackedId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(() => {
                setDetails(prev => prev.filter(item => item._id !== trackedId));
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">

            {/* Price History Modal */}
            {historyModal && (
                <PriceHistoryModal
                    product={historyModal.product}
                    targetPrice={historyModal.targetPrice}
                    onClose={() => setHistoryModal(null)}
                />
            )}

            <div className="bg-[#f8fafc] py-12 px-[5%] mb-4 relative flex items-center justify-center">
                {Array.isArray(details) && details.length > 0 && (
                    <div className="absolute left-[5%] top-1/2 -translate-y-1/2 hidden lg:block">
                        <Link to="/" className="group flex items-center gap-3 no-underline transition-all duration-300">
                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center transition-all duration-300 group-hover:bg-[#10b981] group-hover:scale-110 shadow-sm">
                                <FontAwesomeIcon icon={faArrowLeft} className="text-white text-lg transform group-hover:-translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </div>
                )}
                <div className="text-center flex flex-col items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-[700] text-[#0f172a]">
                        <span className="text-[#0f172a]">My Tracked </span>
                        <span className="text-[#10b981]">Products</span>
                    </h1>
                    <p className="text-lg md:text-xl font-bold text-slate-700 max-w-2xl mx-auto m-0">
                        We're monitoring these prices for you in real-time.
                    </p>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-[5%]">
                {isPending ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <FontAwesomeIcon icon={faSpinner} className="text-emerald-500 text-4xl animate-spin mb-4" />
                        <p className="text-slate-500 font-bold">Loading your wishlist...</p>
                    </div>
                ) : Array.isArray(details) && details.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {details.map((detail, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                                <div className="relative h-64 overflow-hidden bg-slate-50 p-6">
                                    <img
                                        src={detail.pid.imageurl}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                        alt={detail.pid.pname}
                                    />
                                    <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {detail.pid.website}
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-[#0f172a] font-bold text-lg leading-tight mb-2 line-clamp-2">
                                        {detail.pid.pname}
                                    </h3>

                                    <div className="flex items-end gap-3 mb-4 mt-auto">
                                        <div className="text-2xl font-extrabold text-[#0f172a]">
                                            ₹{detail.pid.currentprice}
                                        </div>
                                        <div className="text-sm font-bold text-emerald-600 mb-1 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faTag} className="text-xs" />
                                            Target: ₹{detail.tprice}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 mt-2">
                                        {/* ✅ New: Price History Chart button */}
                                        <button
                                            onClick={() => setHistoryModal({ product: detail.pid, targetPrice: detail.tprice })}
                                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm"
                                        >
                                            <FontAwesomeIcon icon={faChartLine} /> Price History
                                        </button>
                                        <a
                                            href={detail.pid.purl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full bg-[#0f172a] hover:bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors no-underline"
                                        >
                                            View Deal <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(detail._id)}
                                            className="w-full bg-white border-2 border-slate-700 text-slate-700 hover:border-red-500 hover:text-red-500 py-3 rounded-xl font-[700] flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
                                        >
                                            Remove Product
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[28px] border border-dashed border-slate-300 max-w-2xl mx-auto px-10">
                        <div className="text-slate-300 text-6xl mb-6">♥</div>
                        <h2 className="text-2xl font-[700] text-slate-800 mb-2">No tracked products yet</h2>
                        <p className="text-slate-500 mb-8 font-medium">Start searching for products to add them to your tracking list and never miss a price drop!</p>
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

export default Tracked;
