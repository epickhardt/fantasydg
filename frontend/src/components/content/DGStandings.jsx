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
    const [totals, setTotals] = useState({});

    useEffect(() => {
        setTotals(JSON.parse(sessionStorage.getItem("totals")));
    }, [])
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
                            {
                                (Object.values(totals).length > 0) ? 
                                Object.values(totals).map(user => {
                                    return <td>totals</td>
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