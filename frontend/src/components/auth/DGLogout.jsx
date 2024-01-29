
import { useNavigate } from "react-router";
import React, { useEffect, useContext } from 'react';
import DGLoginStatusContext from "../context/DGLoginStatusContext";

export default function DGLogout() {
    const [loginStatus, setLoginStatus] = useContext(DGLoginStatusContext);

    useEffect(() => {
        setLoginStatus(false)
        sessionStorage.removeItem('username');
    }, []);

    return <>
        <h1>Logout</h1>
        <p>You have been successfully logged out.</p>
    </>
}
