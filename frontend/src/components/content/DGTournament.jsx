import React, { useEffect, useState, useContext } from "react"
import { Container, Row, Col, Pagination, Form, Button } from "react-bootstrap";
import DGTourneysContext from "../context/DGTourneysContext";
import DGPlayersContext from "../context/DGPlayersContext";

export default function DGTournament(props) {

    const [players, setPlayers] = useContext(DGPlayersContext);
    const [shownPlayers, setShownPlayers] = useState([])
    const [scores, setScores] = useState({});
    const [winning, setWinning] = useState(0);


    useEffect(() => {
        setShownPlayers(players);
    }, [players]);

    useEffect(() => {
        fetch(`https://fantasydg.site:53706/api/getPlayers`, {
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
            console.log(data);
            let newScores = {};
            data.forEach(playerObj => {
                if(typeof playerObj[props.name] === 'number') {
                    newScores[playerObj["Name"]] = playerObj[props.name]
                }
            });
            setScores(newScores);
            setShownPlayers(Object.keys(newScores));
            setWinning(Math.min(...Object.values(newScores)))
        });
    }, [props.name])

    return <>
        <h1>{props.name}</h1>
        <p>{winning}</p>
        <a href="httpss://www.pdga.com/tour/event/75422">Link to Tournament Page</a>
        <br/>
        {
            shownPlayers.map(player => 
                <p key={player}><strong>{player + ": " + scores[player] + " (" + (scores[player]-winning) + ")"}</strong></p> 
            )
        }
    </>
}
