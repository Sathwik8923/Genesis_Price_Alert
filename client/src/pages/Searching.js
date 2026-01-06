import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Searching = () => {
    const [name, setName] = useState('');
    const [details, setDetails] = useState([]);
    const [isPending, setIsPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleClick = async () => {
        if (!name.trim()) {
            setErrorMsg('Please enter something to search!');
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
            setDetails(data);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setIsPending(false);
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleClick();
        }
    };

    const handleTrack = async (detail) => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Sign in to track price drops!");
            navigate('/login');
            return;
        }

        let target_price = prompt(`Please enter your Taeget Price of this Product{Actual Price : ${detail.price}}`);

        if(!target_price || isNaN(target_price) || Number(target_price) <= 0){
            alert("Enter a Valid Price");
            return;
        }

        if (target_price !== null && target_price !== "") {
            alert("Setting Target Price :" + target_price + "rupees");
        } else {
            alert("Target price not entered.");
        }

        const responseTrack = await fetch("/track", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ detail , target_price})
        });

        if (responseTrack.ok) alert("Price tracking active for this item!");
    }

    return (
        <div className="dh-hero">
            <h1>Find the <span className="brand-accent">Best Price</span> in Seconds</h1>
            <p>Search millions of products across Amazon, Flipkart, and more.</p>
            <div className="dh-search-container">
                <div className="dh-search-box">
                    <input
                        type="text"
                        placeholder="Search for products (e.g. iPhone 15, Nike Shoes)..."
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errorMsg) setErrorMsg(''); // Clear error as user types
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
                            <div className="dh-card-price">{detail.price}</div>
                            <div>Merchant:{detail.website}</div>
                        </div>
                        <div className="dh-card-actions">
                            <a href={detail.link} target="_blank" rel="noreferrer" className="dh-btn-buy">View Deal</a>
                            <button className="dh-btn-track" onClick={() => handleTrack(detail)}>Track Price</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Searching;