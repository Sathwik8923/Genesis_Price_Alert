import { useState } from "react";

const Login = () => {


    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');

    const handleLogin = async ()=>{
        const response = await fetch('/login',{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({email,password})
        })
        const data = await response.json()

        if(response.ok){
            localStorage.setItem("token",data.token)
            console.log("Logged in")
        }
    }

    return ( 
        <div>
            <label>Email:</label>
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <label>Password:</label>
            <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
        </div>
     );
}
 
export default Login;