import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faArrowLeft, faTag, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const Tracked = () => {
    const [details, setDetails] = useState([]);
    const [isPending, setIsPending] = useState(true);
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
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(() => {
                // remove deleted item from UI
                setDetails(prev =>
                    prev.filter(item => item._id !== trackedId)
                );
            })
            .catch(err => console.log(err));
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Header Section */}
            {/* Header Section - Height reduced to match Navbar (approx 80px) */}
            {/* Header Section - Height matches Home Navbar (80px) */}
            <div className="bg-white border-b border-slate-200 py-2 px-[5%] mb-8 relative flex items-center justify-center min-h-[80px]">

                {/* 1. Back Aligned Option */}
                {Array.isArray(details) && details.length > 0 && (
                    <div className="absolute left-[5%] hidden lg:block">
                        <Link to="/home" className="group flex items-center gap-2 no-underline">
                            <FontAwesomeIcon icon={faArrowLeft} className="text-sm text-[#10b981] group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm text-black font-bold group-hover:text-[#10b981]">Back to Home</span>
                        </Link>
                    </div>
                )}

                {/* 2. Heading and Tagline */}
                <div className="text-center flex flex-col items-center">
                    <h1 className="text-lg md:text-xl font-extrabold tracking-tight leading-tight m-0">
                        <span className="text-[#0f172a]">My Tracked </span>
                        <span className="text-[#10b981]">Products</span>
                    </h1>

                    {/* THE TAGLINE: Small, subtle, and matching the Navbar flow */}
                    <p className="text-[11px] md:text-[12px] text-slate-500 font-medium m-0 uppercase tracking-[0.1em]">
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
                    /* The Product Grid - matching Searching.js layout */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {details.map((detail, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                                {/* Image Container */}
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

                                {/* Content Section */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-[#0f172a] font-bold text-lg leading-tight mb-2 line-clamp-2">
                                        {detail.pid.pname}
                                    </h3>

                                    <div className="flex items-end gap-3 mb-6 mt-auto">
                                        <div className="text-2xl font-extrabold text-[#0f172a]">
                                            ₹{detail.pid.currentprice}
                                        </div>
                                        <div className="text-sm font-bold text-emerald-600 mb-1 flex items-center gap-1">
                                            <FontAwesomeIcon icon={faTag} className="text-xs" />
                                            Target: ₹{detail.tprice}
                                        </div>
                                        <div>
                                            <button onClick={() => handleDelete(detail._id)}>Delete</button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3">
                                        <a
                                            href={detail.pid.purl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full bg-[#0f172a] hover:bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors no-underline"
                                        >
                                            View Deal <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[28px] border border-dashed border-slate-300 max-w-2xl mx-auto px-10">
                        <div className="text-slate-300 text-6xl mb-6">♥</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No tracked products yet</h2>
                        <p className="text-slate-500 mb-8 font-medium">Start searching for products to add them to your tracking list and never miss a price drop!</p>
                        <Link
                            to="/home"
                            className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Go back to Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracked;