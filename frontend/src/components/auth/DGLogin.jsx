import { React, useRef, useContext } from 'react';
import { Form, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router';
import DGLoginStatusContext from '../context/DGLoginStatusContext';

export default function DGLogin() {
    const navigate = useNavigate();
    const [loginStatus, setLoginStatus] = useContext(DGLoginStatusContext);
    
    const usernameRef = useRef();
    const passwordRef = useRef();

    const handleClick = () => {
        if(usernameRef.current.value === "" || passwordRef.current.value === "") {
            alert("You must provide both a username and a password!")
        }
        else {
            fetch(`http://167.71.244.233:53706/api/login`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: usernameRef.current.value,
                    password: passwordRef.current.value
                })
            }).then(res => {
                if (res.status === 200) {
                    alert("Login successful");
                    setLoginStatus(true);
                    sessionStorage.setItem('username', usernameRef.current.value);
                    navigate("/");
                } else if (res.status === 401) {
                    alert("Incorrect username or password!");
                }
            })
        }
    }

    return <>
        <h1>Login</h1>
        <Form>
            <Form.Label htmlFor="username">Username</Form.Label>
            <Form.Control id="username" ref={usernameRef}/>
            <Form.Label htmlFor="password">Password</Form.Label>
            <Form.Control id="password" ref={passwordRef} type="password"/>
        </Form>
        <Button onClick={handleClick}>Login</Button>
    </>
}
