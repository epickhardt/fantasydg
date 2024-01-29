import { useContext, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import DGTourneysContext from "../context/DGTourneysContext";
import DGUsersContext from "../context/DGUsersContext";
import DGScoresContext from "../context/DGScoresContext";

function DGStandings() {

    const [users, setUsers] = useContext(DGUsersContext);
    const [tournaments, setTournaments] = useContext(DGTourneysContext);
    const [scores, setScores] = useContext(DGScoresContext);

    return (
        <div>
            <h1>Standings</h1>
            <Table>
                <thead>
                    <tr>
                        <th>Tournament</th>
                        {
                            users.map(user => {
                                return <th key={user}>{user}</th>
                            })
                        }
                    </tr>
                </thead>
                { (scores.length == users.length) ? 
                    <tbody>
                        {
                            tournaments.map(tournament => {
                                return <tr key={tournament}>
                                    <td>{tournament}</td>
                                    {
                                        scores.map(user => {
                                            if (user[tournament]) return <td>{user[tournament]}</td>
                                            else return <td>0</td>
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