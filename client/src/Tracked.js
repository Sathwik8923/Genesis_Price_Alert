import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSpinner, faArrowLeft, faTag, faExternalLinkAlt,
    faChartLine, faTimes, faPause, faPlay, faPencilAlt,
    faCheck, faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    Tooltip, ReferenceLine, CartesianGrid
} from 'recharts';

// ─── Price History Modal ──────────────────────────────────────────────────────
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
    const dropped = prices.length >= 2 && prices[prices.length - 1] < prices[0];
    const dropAmount = prices.length >= 2 ? prices[0] - prices[prices.length - 1] : 0;

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
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                        <h2 className="text-lg font-bold text-[#0f172a] line-clamp-2">{product.pname}</h2>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{product.website}</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

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

                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <FontAwesomeIcon icon={faSpinner} className="text-emerald-500 text-3xl animate-spin" />
                    </div>
                ) : history.length < 2 ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl">
                        <p className="text-slate-400 font-bold text-sm">Not enough data yet</p>
                        <p className="text-slate-400 text-xs mt-1">Check back after the next price update</p>
                    </div>
                ) : (
                    <>
                        <div className={`text-center text-sm font-bold mb-3 ${dropped ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {dropped
                                ? `📉 Price dropped ₹${dropAmount} since tracking started`
                                : `📊 Tracking ${history.length} data points`}
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} domain={['auto', 'auto']} width={65} />
                                <Tooltip content={<CustomTooltip />} />
                                <ReferenceLine y={targetPrice} stroke="#10b981" strokeDasharray="4 4" strokeWidth={2}
                                    label={{ value: 'Target', position: 'insideTopRight', fontSize: 11, fill: '#10b981', fontWeight: 700 }} />
                                <Line type="monotone" dataKey="price" stroke="#0f172a" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#0f172a' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Edit Target Price Modal ──────────────────────────────────────────────────
const EditTargetModal = ({ item, onConfirm, onCancel }) => {
    const [newTarget, setNewTarget] = useState(item.tprice);
    const [error, setError] = useState('');

    const handleSubmit = () => {
        const price = Number(newTarget);
        if (!newTarget || isNaN(price) || price <= 0) {
            setError('Please enter a valid price greater than 0');
            return;
        }
        onConfirm(price);
    };

    const dropPct = item.pid.currentprice > 0
        ? Math.round(((item.pid.currentprice - Number(newTarget)) / item.pid.currentprice) * 100)
        : 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-xl font-bold text-[#0f172a] mb-1">Edit Target Price</h2>
                <p className="text-slate-500 text-sm mb-5 font-medium line-clamp-1">{item.pid.pname}</p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 flex items-center justify-between">
                    <span className="text-slate-600 font-semibold text-sm">Current Price</span>
                    <span className="text-2xl font-extrabold text-[#0f172a]">₹{item.pid.currentprice}</span>
                </div>

                <label className="block text-sm font-bold text-slate-700 mb-2">New Target Price (₹)</label>
                <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => { setNewTarget(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full border-2 border-slate-200 focus:border-[#10b981] rounded-xl px-4 py-3 text-lg font-bold outline-none transition-colors mb-1"
                    autoFocus
                />
                {error && <p className="text-red-500 text-sm font-semibold mt-1">{error}</p>}

                {/* ✅ Live drop % preview */}
                {newTarget > 0 && !isNaN(newTarget) && dropPct > 0 && (
                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-2">
                        <FontAwesomeIcon icon={faArrowDown} className="text-emerald-500 text-xs" />
                        <span className="text-emerald-700 font-bold text-sm">
                            Alert when price drops {dropPct}% from current
                        </span>
                    </div>
                )}

                <div className="flex gap-3 mt-5">
                    <button onClick={onCancel} className="flex-1 border-2 border-slate-200 text-slate-600 hover:border-slate-400 py-3 rounded-xl font-bold transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="flex-1 bg-[#10b981] hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors">
                        <FontAwesomeIcon icon={faCheck} className="mr-2" />Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Drop % Badge ─────────────────────────────────────────────────────────────
const DropBadge = ({ currentPrice, targetPrice }) => {
    if (!currentPrice || !targetPrice || currentPrice <= targetPrice) return null;
    const pct = Math.round(((currentPrice - targetPrice) / currentPrice) * 100);
    if (pct <= 0) return null;
    return (
        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
            <FontAwesomeIcon icon={faArrowDown} className="text-[8px]" />
            needs {pct}% drop
        </span>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Tracked = () => {
    const [details, setDetails] = useState([]);
    const [isPending, setIsPending] = useState(true);
    const [historyModal, setHistoryModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch("/tracked", {
            method: "GET",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => { setDetails(Array.isArray(data) ? data : []); setIsPending(false); })
            .catch(() => setIsPending(false));
    }, [token]);

    const handleDelete = (trackedId) => {
        fetch(`/tracked/${trackedId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } })
            .then(res => res.json())
            .then(() => setDetails(prev => prev.filter(item => item._id !== trackedId)))
            .catch(err => console.log(err));
    };

    // ✅ Pause / Resume
    const handleToggle = async (trackedId) => {
        try {
            const res = await fetch(`/tracked/${trackedId}/toggle`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setDetails(prev => prev.map(item =>
                item._id === trackedId ? { ...item, isActive: data.isActive } : item
            ));
            toast.info(data.isActive ? "▶️ Tracking resumed!" : "⏸️ Tracking paused");
        } catch {
            toast.error("Failed to update tracking status");
        }
    };

    // ✅ Edit target price
    const handleEditConfirm = async (newTarget) => {
        const item = editModal;
        setEditModal(null);
        try {
            const res = await fetch(`/tracked/${item._id}/target`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ tprice: newTarget })
            });
            const data = await res.json();
            if (res.ok) {
                setDetails(prev => prev.map(d =>
                    d._id === item._id ? { ...d, tprice: data.tprice } : d
                ));
                toast.success(`✅ Target price updated to ₹${data.tprice}`);
            } else {
                toast.error(data.message || "Update failed");
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">

            {historyModal && (
                <PriceHistoryModal product={historyModal.product} targetPrice={historyModal.targetPrice} onClose={() => setHistoryModal(null)} />
            )}
            {editModal && (
                <EditTargetModal item={editModal} onConfirm={handleEditConfirm} onCancel={() => setEditModal(null)} />
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
                        <span>My Tracked </span>
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
                ) : details.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {details.map((detail, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group ${!detail.isActive ? 'opacity-60 border-slate-200' : 'border-slate-200'}`}
                            >
                                {/* Image */}
                                <div className="relative h-64 overflow-hidden bg-slate-50 p-6">
                                    <img src={detail.pid.imageurl} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" alt={detail.pid.pname} />
                                    <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {detail.pid.website}
                                    </div>
                                    {/* ✅ Paused badge */}
                                    {!detail.isActive && (
                                        <div className="absolute top-4 right-4 bg-slate-700 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Paused
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-[#0f172a] font-bold text-lg leading-tight mb-2 line-clamp-2">{detail.pid.pname}</h3>

                                    {/* Prices row */}
                                    <div className="flex items-end gap-3 mb-2 mt-auto">
                                        <div className="text-2xl font-extrabold text-[#0f172a]">₹{detail.pid.currentprice}</div>
                                        <div className="text-sm font-bold text-emerald-600 mb-1 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faTag} className="text-xs" />
                                            Target: ₹{detail.tprice}
                                        </div>
                                    </div>

                                    {/* ✅ Drop % badge */}
                                    <div className="mb-4">
                                        <DropBadge currentPrice={detail.pid.currentprice} targetPrice={detail.tprice} />
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-col gap-2 mt-2">
                                        {/* Row 1: Chart + Edit target */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setHistoryModal({ product: detail.pid, targetPrice: detail.tprice })}
                                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-sm"
                                            >
                                                <FontAwesomeIcon icon={faChartLine} /> Chart
                                            </button>
                                            <button
                                                onClick={() => setEditModal(detail)}
                                                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-sm"
                                            >
                                                <FontAwesomeIcon icon={faPencilAlt} /> Edit Target
                                            </button>
                                        </div>

                                        {/* Row 2: View Deal */}
                                        <a
                                            href={detail.pid.purl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full bg-[#0f172a] hover:bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors no-underline"
                                        >
                                            View Deal <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                        </a>

                                        {/* Row 3: Pause/Resume + Remove */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleToggle(detail._id)}
                                                className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-sm border-2 ${detail.isActive
                                                    ? 'border-amber-400 text-amber-600 hover:bg-amber-50'
                                                    : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50'}`}
                                            >
                                                <FontAwesomeIcon icon={detail.isActive ? faPause : faPlay} />
                                                {detail.isActive ? 'Pause' : 'Resume'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(detail._id)}
                                                className="py-2.5 rounded-xl font-bold flex items-center justify-center transition-all text-sm border-2 border-slate-300 text-slate-600 hover:border-red-500 hover:text-red-500"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[28px] border border-dashed border-slate-300 max-w-2xl mx-auto px-10">
                        <div className="text-slate-300 text-6xl mb-6">♥</div>
                        <h2 className="text-2xl font-[700] text-slate-800 mb-2">No tracked products yet</h2>
                        <p className="text-slate-500 mb-8 font-medium">Start searching for products and never miss a price drop!</p>
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
