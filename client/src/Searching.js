import { useState } from "react";

const Searching = () => {
    const [name, setName] = useState('');
    const [details,setDetails] = useState(null);
    const [isPending,setIsPending] = useState(false);
    const handleClick =async () => {
        setIsPending(true)
        const response = await fetch("/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name})
        });

        const data = await response.json();
        setDetails(data);
        setIsPending(false);
    }
    return (
        <>
            <label>Product Name:</label>
            <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <br></br>
            <button onClick={handleClick} disabled={isPending}>Submit</button>
            {isPending && <div>Loading...</div>}
            { details &&<div>Product Name:{details.title}</div>}
            { details &&<div>Product Price:{details.price}</div>}
            {details && <img src={details.image} width="200" alt={details.title}/>}
            {details && <a href={details.link} target="_blank" rel="noreferrer">Buy Now</a>}
        </>
    );
}
export default Searching;