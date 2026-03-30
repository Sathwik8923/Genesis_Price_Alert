import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ✅ Inline modal — no prompt() or alert() anywhere
const TrackModal = ({ detail, onConfirm, onCancel }) => {
    const [targetPrice, setTargetPrice] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        const price = Number(targetPrice);
        if (!targetPrice || isNaN(price) || price <= 0) {
            setError('Please enter a valid price greater than 0');
            return;
        }
        onConfirm(price);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-xl font-bold text-[#0f172a] mb-1">Set Target Price</h2>
                <p className="text-slate-500 text-sm mb-5 font-medium">
                    We'll alert you when <span className="text-[#0f172a] font-bold line-clamp-1">{detail.title}</span> drops to your target.
                </p>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex items-center justify-between">
                    <span className="text-slate-600 font-semibold text-sm">Current Price</span>
                    <span className="text-2xl font-extrabold text-[#0f172a]">₹{detail.price}</span>
                </div>

                <label className="block text-sm font-bold text-slate-700 mb-2">Your Target Price (₹)</label>
                <input
                    type="number"
                    placeholder={`e.g. ${Math.floor(detail.price * 0.85)}`}
                    value={targetPrice}
                    onChange={(e) => { setTargetPrice(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    className="w-full border-2 border-slate-200 focus:border-[#10b981] rounded-xl px-4 py-3 text-lg font-bold outline-none transition-colors mb-1"
                    autoFocus
                />
                {error && <p className="text-red-500 text-sm font-semibold mt-1 mb-3">{error}</p>}

                <div className="flex gap-3 mt-5">
                    <button
                        onClick={onCancel}
                        className="flex-1 border-2 border-slate-200 text-slate-600 hover:border-slate-400 py-3 rounded-xl font-bold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-[#10b981] hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors"
                    >
                        Start Tracking
                    </button>
                </div>
            </div>
        </div>
    );
};

const Searching = () => {
    const [name, setName] = useState('');
    const [details, setDetails] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [trackingModal, setTrackingModal] = useState(null);
    const navigate = useNavigate();

    const handleClick = async () => {
        if (!name.trim()) {
            setErrorMsg('Please enter something to search !');
            return;
        }
        setErrorMsg('');
        setIsPending(true);
        try {
            const response = await fetch("/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            const data = await response.json();
            if (data.error) {
                setErrorMsg(data.error);
            } else {
                setDetails(data);
                if (data.length === 0) setErrorMsg('No products found. Try a different search term.');
            }
        } catch (err) {
            setErrorMsg('Something went wrong. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleClick();
    };

    const openTrackModal = (detail) => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.info("Sign in to track price drops!");
            navigate('/login');
            return;
        }
        setTrackingModal(detail);
    };

    const handleTrackConfirm = async (targetPrice) => {
        const detail = trackingModal;
        setTrackingModal(null);
        const token = localStorage.getItem("token");

        try {
            const responseTrack = await fetch("/track", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ detail, target_price: targetPrice })
            });
            const data = await responseTrack.json();
            if (responseTrack.ok) {
                toast.success("🎯 Price tracking active!");
            } else {
                toast.error(data.message || "Tracking failed");
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="dh-hero">
            {trackingModal && (
                <TrackModal
                    detail={trackingModal}
                    onConfirm={handleTrackConfirm}
                    onCancel={() => setTrackingModal(null)}
                />
            )}

            <div className="text-center mb-10">
                <h1 className="text-2xl md:text-4xl font-semibold text-[#0f172a] tracking-tight mb-4">
                    Find the <span className="text-[#10b981]">Best Price</span> in Seconds
                </h1>
                <p className="text-lg md:text-xl font-semibold text-slate-600 max-w-2xl mx-auto">
                    Search millions of products across Amazon, Flipkart, Croma and more.
                </p>
            </div>

            <div className="dh-search-container">
                <div className="dh-search-box">
                    <input
                        type="text"
                        placeholder="Search for products (e.g. iPhone 15, Nike Shoes)..."
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errorMsg) setErrorMsg('');
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    <button className="dh-search-btn" onClick={handleClick} disabled={isPending}>
                        {isPending ? 'Searching...' : 'Search'}
                    </button>
                </div>
                {errorMsg && <div className="dh-search-error">{errorMsg}</div>}
            </div>

            <div className="dh-grid">
                {details.map((detail, index) => (
                    <div className="dh-card" key={index}>
                        <img src={detail.image} className="dh-card-img" alt={detail.title} />
                        <div className="dh-card-content">
                            <div className="dh-card-title">{detail.title}</div>
                            <div className="dh-card-price">₹{detail.price}</div>
                            <div className="text-sm text-slate-500 font-semibold mt-1">{detail.website}</div>
                        </div>
                        <div className="dh-card-actions">
                            <a href={detail.link} target="_blank" rel="noreferrer" className="dh-btn-buy">View Deal</a>
                            <button className="dh-btn-track" onClick={() => openTrackModal(detail)}>Track Price</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Searching;
