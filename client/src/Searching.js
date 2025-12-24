import { useState } from "react";

const Searching = () => {
    const [name, setName] = useState('');
    const [details,setDetails] = useState([]);
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
    const handleTrack = async (detail)=>{
        const token = localStorage.getItem("token");

        if(!token){
            alert("Please Login First");
            return;
        }

        const responseTrack = await fetch("/track",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify({detail})
        })
        
        alert("Product Tracked");
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

            {details.map((detail,index)=>(
                <div key={index}>
                    <div>Product Name:{detail.title}</div>
                    <div>Product Price:{detail.price}</div>
                    <img src={detail.image} width="200" alt={detail.title}/>
                    <div>Website:{detail.website}</div>
                    <a href={detail.link} target="_blank" rel="noreferrer">Buy Now</a>
                    <button onClick={()=>{handleTrack(detail)}}>Track</button>
                </div>
            ))}
        </>
    );
}
export default Searching;