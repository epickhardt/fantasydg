import React, { useState, useEffect } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";

import crest from '../../assets/react.svg'
import DGLoginStatusContext from "../context/DGLoginStatusContext";
import DGPlayersContext from "../context/DGPlayersContext";
import DGTourneysContext from "../context/DGTourneysContext";
import DGTourneyStartsContext from "../context/DGTourneyStartsContext";
import DGUsersContext from "../context/DGUsersContext";
import DGScoresContext from "../context/DGScoresContext";

function DGLayout(props) {

    const [loginStatus, setLoginStatus] = useState(sessionStorage.getItem('username') ? true : false)
    const [tournaments, setTournaments] = useState(['FLO', 'WACO', 'AUSTN', 'TXSTS', 'JBO', 'MCO', 'DDO', 'OTB', 'PDXO', 'BSF', 'TPC', 'DMC', 'EO',
    'LSO', 'IDLE', 'WORLDS', 'DGLO', 'GMC', 'MVP', 'USDGC', 'Sample']);
    const [players, setPlayers] = useState([]);
    const [users, setUsers] = useState([]);
    const [scores, setScores] = useState([]);
    const [tourneyStarts, setTourneyStarts] = useState(
        {
            'FLO': new Date("February 23, 2024 00:00:00"), 
            'WACO': new Date("March 7, 2024 00:00:00") ,
            'AUSTN': new Date("March 15, 2024 00:00:00"), 
            'TXSTS': new Date("March 29, 2024 00:00:00"), 
            'JBO': new Date("April 12, 2024 00:00:00"), 
            'MCO': new Date("April 19, 2024 00:00:00"), 
            'DDO': new Date("May 3, 2024 00:00:00"), 
            'OTB': new Date("May 17, 2024 00:00:00"), 
            'PDXO': new Date("May 30, 2024 00:00:00"), 
            'BSF': new Date("June 7, 2024 00:00:00"), 
            'TPC': new Date("June 21, 2024 00:00:00"), 
            'DMC': new Date("July 5, 2024 00:00:00"), 
            'EO': new Date("July 18, 2024 00:00:00"),
            'LSO': new Date("August 1, 2024 00:00:00"), 
            'IDLE': new Date("August 9, 2024 00:00:00"), 
            'WORLDS': new Date("August 21, 2024 00:00:00"), 
            'DGLO': new Date("September 5, 2024 00:00:00"), 
            'GMC': new Date("September 19, 2024 00:00:00"), 
            'MVP': new Date("September 26, 2024 00:00:00"), 
            'USDGC': new Date("October 10, 2024 00:00:00"), 
            'Sample': new Date("January 20, 2024 00:00:00")
        })

    useEffect(() => {
        fetch(`https://167.71.244.233:53706/api/getPlayers`, {
            method: 'GET',
            credentials: "include"
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } 
            else if (res.status === 500) {
                alert("Internal Error");
            }
        }).then(data => {
            let playerList = [];
            data.forEach(playerObj => playerList.push(playerObj["Name"]));
            setPlayers(playerList.sort());
        });
    }, []);

    useEffect(() => {
        fetch(`https://167.71.244.233:53706/api/getUsers`, {
            method: 'GET',
            credentials: "include"
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } 
            else if (res.status === 500) {
                alert("Internal Error");
            }
        }).then(data => {
            let newUsers = []
            data.forEach(user => newUsers.push(user['uname']))
            setUsers(newUsers);
        });
    }, [])

    useEffect(() => {
        let userScores = []
        users.forEach((user)=>{
            fetch(`https://167.71.244.233:53706/api/getScores/${user}`, {
                method: 'GET',
                credentials: "include"
            }).then(res => {
                if (res.status === 200) {
                    return res.json();
                }
                else if (res.status === 500) {
                    alert("Internal Error");
                }
            }).then(data => {
                let newUserScores = {}
                data.forEach(tourney => newUserScores[tourney['tournament']] = tourney['score'])
                userScores.push(newUserScores);
            })
        })
        setScores(userScores);
    }, [users])

    return (
        <div>
            <Navbar expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        <img
                            alt="DGFantasy Logo"
                            src={crest}
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />{' '}
                        Fantasy Disc Golf 2024
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        <Nav.Link as={Link} to="rules">Rules</Nav.Link>
                        <Nav.Link as={Link} to="standings">Standings</Nav.Link>
                        <Nav.Link hidden={loginStatus!=true} as={Link} to="picks">Picks</Nav.Link>
                        <Nav.Link hidden={loginStatus===true} as={Link} to="login">Login</Nav.Link>
                        <Nav.Link hidden={loginStatus===true} as={Link} to="register">Register</Nav.Link>
                        <NavDropdown title="Tournaments">
                        {
                            tournaments.map(tourney => {
                                return <NavDropdown.Item key={tourney} as={Link} to={"tournaments/" + tourney}>{tourney}</NavDropdown.Item>
                            })
                        }
                        </NavDropdown>
                        <Nav.Link hidden={loginStatus!=true} as={Link} to="logout">Logout</Nav.Link>

                    </Nav>
                </Container>
            </Navbar>
            <div style={{ margin: "1rem" }}>
                <DGLoginStatusContext.Provider value={[loginStatus, setLoginStatus]}>
                    <DGPlayersContext.Provider value={[players, setPlayers]}>
                        <DGTourneysContext.Provider value={[tournaments, setTournaments]}>
                            <DGTourneyStartsContext.Provider value={[tourneyStarts, setTourneyStarts]}>
                                <DGUsersContext.Provider value={[users, setUsers]}>
                                    <DGScoresContext.Provider value={[scores, setScores]}>
                                        <Outlet/>
                                    </DGScoresContext.Provider>
                                </DGUsersContext.Provider>
                            </DGTourneyStartsContext.Provider>
                        </DGTourneysContext.Provider>
                    </DGPlayersContext.Provider>
                </DGLoginStatusContext.Provider>
            </div>
        </div>
    );
}

export default DGLayout;