import { useEffect } from "react";
import { useState } from "react";

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
            .then((res) => {
                return res.json();
            })
              .then((data) => {
                setDetails(data);
                setIsPending(false);
               })
               .catch((err) => {
                console.log(err);
                setIsPending(false);
               })
    }, [])

    return (
        <div>
            {isPending && <div>Loading...</div>}

            { Array.isArray(details) && details.map((detail, index) => (
                <div key={index}>
                    <div>Product Name:{detail.pid.pname}</div>
                    <div>Product Price:{detail.pid.currentprice}</div>
                    <img src={detail.pid.imageurl} width="200" alt={detail.pid.pname} />
                    <div>Website:{detail.pid.website}</div>
                    <a href={detail.pid.purl} target="_blank" rel="noreferrer">Buy Now</a>
                </div>
            ))}
        </div>
    );
}

export default Tracked;