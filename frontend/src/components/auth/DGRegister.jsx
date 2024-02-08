import { useState, useContext, React } from 'react';
import { useNavigate } from 'react-router';
import { Button, Form } from 'react-bootstrap';

import DGLoginStatusContext from '../context/DGLoginStatusContext';

export default function DGRegister() {
    const navigate = useNavigate();
    
    const [loginStatus, setLoginStatus] = useContext(DGLoginStatusContext);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPW, setConfirmPW] = useState("");

    const handleClick = () => {
        if (username === "" || password === "") {
            alert("You must provide both a username and password!");
        }
        else if (password != confirmPW) {
            alert("Your passwords do not match!")
        }
        else newUser();
    }

    const newUser = () => {
        fetch(`http://167.71.244.233:53706/api/register/`, {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then(res => {
            if (res.status === 200) {
                alert("Registration successful!");
                setLoginStatus(true);
                sessionStorage.setItem('username', username);
                navigate("/");
            } 
            else if (res.status === 409) {
                alert("That username has already been taken!")
            }
            else if (res.status === 500) {
                alert("Internal Error");
            }
        })
    }

    return <>
        <h1>Register</h1>
        <Form>
            <Form.Label htmlFor="user">Username</Form.Label>
            <Form.Control id="user" value={username} onChange={(e) => setUsername(e.target.value)}></Form.Control>
            <Form.Label htmlFor="password">Password</Form.Label>
            <Form.Control id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}></Form.Control>
            <Form.Label htmlFor="confirmPW">Repeat Password</Form.Label>
            <Form.Control id="confirmPW" type="password" value={confirmPW} onChange={(e) => setConfirmPW(e.target.value)}></Form.Control>
        </Form>
        <Button onClick={handleClick}>Register</Button>
    </>
}
