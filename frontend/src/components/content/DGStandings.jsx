import { useContext, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import DGTourneysContext from "../context/DGTourneysContext";
import DGUsersContext from "../context/DGUsersContext";
import DGScoresContext from "../context/DGScoresContext";
import DGSumsContext from "../context/DGSumsContext";

function DGStandings() {

    const [users, setUsers] = useContext(DGUsersContext);
    const [tournaments, setTournaments] = useContext(DGTourneysContext);
    const [scores, setScores] = useContext(DGScoresContext);
    const [sums, setSums] = useContext(DGSumsContext);

    return (
        <div>
            <h1>Standings</h1>
            <Table>
                <thead>
                    <tr>
                        <th>Tournament</th>
                        {
                            Object.keys(scores).map(user => {
                                return <th key={user}>{user}</th>
                            })
                        }
                    </tr>
                </thead>
                { ( Object.keys(scores).length == users.length) ? 
                    <tbody>
                        <tr>
                            <td>Season Total</td>
                            {
                                (Object.values(sums).length > 0) ? 
                                Object.values(sums).map(user => {
                                    return <td key={users[Object.values(sums).indexOf(user)]+user}><strong>{user}</strong></td>
                                }) : <></>
                            }
                        </tr>
                        {
                            tournaments.map(tournament => {
                                return <tr key={tournament}>
                                    <td>{tournament}</td>
                                    {
                                        Object.values(scores).map(user => {
                                            if (user[tournament]) return <td key={users[Object.values(scores).indexOf(user)] + tournament}>{user[tournament]}</td>
                                            else return <td key={users[Object.values(scores).indexOf(user)] + tournament}>0</td>
                                        })
                                    }
                                </tr>
                            })
                        }
                    </tbody> : <></>
                }
            </Table>
        </div>
    );
}

export default DGStandings;