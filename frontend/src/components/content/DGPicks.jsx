import { useState, useEffect, useContext } from "react";
import { Button, Dropdown, DropdownButton, DropdownItem } from "react-bootstrap";
import { useNavigate } from "react-router";

import DGPlayersContext from "../context/DGPlayersContext";
import DGTourneysContext from "../context/DGTourneysContext";
import DGTourneyStartsContext from "../context/DGTourneyStartsContext";

function DGPicks(props) {
    const [currTourney, setCurrTourney] = useState("");
    const [currPicks, setCurrPicks] = useState({1: "", 2: "", 3: "", 4: "", 5: ""});
    const [savedPicks, setSavedPicks] = useState([]);
    const [keys, setKeys] = useState([1,2,3,4,5]);
    const [prevSelections, setPrevSelections] = useState({});
    const [pickedPlayers, setPickedPlayers] = useState([]);
    const [username, setUsername] = useState("");

    const [allPlayers, setAllPlayers] = useContext(DGPlayersContext);
    const [tourneys, setTourneys] = useContext(DGTourneysContext);
    const [tourneyStartDate, setTourneyStartDate] = useContext(DGTourneyStartsContext);

    const navigate = useNavigate();
    const handleNewTourney = (tourney) => {
        setSavedPicks([]);
        setCurrTourney(tourney);
        navigate("#/"+tourney);
    }

    useEffect(() => {
        setUsername(sessionStorage.getItem('username'));
    }, []);

    useEffect(() => {
        getPrevSelections();
    }, [username, currPicks, currTourney]);

    const getPrevSelections = () => {
        if (!username) return;
        fetch(`https://fantasydg.site:53706/api/getPicks/${username}`, {
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
            let newSelections = {}
            data.forEach(entry => Object.values(entry).forEach(player => {
                console.log(player)
                if (currTourney === player) { setSavedPicks(Object.values(entry).slice(1,6))}
                if (tourneys.some(tourney => tourney === player) || player === null || !allPlayers.some(aP => aP === player)) {;}
                else if(!newSelections[player]) newSelections[player] = 1;
                else newSelections[player] ++;
            }));
            setPrevSelections(newSelections);
            setPickedPlayers(Object.keys(newSelections))
        });
    }

    const handleNewPick = (player, index) => {
        let newPicks = currPicks;
        newPicks[index] = player;
        setCurrPicks(newPicks);
        setKeys(Object.keys(newPicks));
    }

    const handleSubmit = (tourney, picks) => {
        if(!Object.values(picks).every(pick => pick != "")) {
            alert("Must submit 5 players");
            return;
        }
        if(new Set(Object.values(picks)).size !== Object.values(picks).length) {
            alert("Duplicate players are not allowed for the same tournament")
            return;
        }
        if(Object.values(picks).some(pick => prevSelections[pick] >= 3)) {
            alert("You have already used a player in your selection 3 times!");
            return;
        }
        fetch(`https://fantasydg.site:53706/api/submitPicks`, {
            method: 'POST',
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                tourney: tourney,
                pick1: picks["1"],
                pick2: picks["2"],
                pick3: picks["3"],
                pick4: picks["4"],
                pick5: picks["5"]
            })
        }).then(res => {
            if (res.status === 200) {
                alert("Submitted Players!");
                setCurrPicks({1: "", 2: "", 3: "", 4: "", 5: ""});
                setKeys([1,2,3,4,5]);

            } 
            else if (res.status === 500) {
                alert("Internal Error");
            }
        })
    }

    return (
        <div class="container">
            <div class="row align-items-start">
                <div class="col">
                    <h1>Your Picks</h1>
                    <a target="_blank" href="https://www.pdga.com/tour/event/77759" rel="noreferrer">Open @ Austin PDGA Link</a>
                    <h3>Tournament Select:</h3>
                    <DropdownButton id="dropdown-basic-button" title="Tournament">
                        {
                            tourneys.map(tourney => {
                                return <Dropdown.Item key={tourney} onClick={e=>handleNewTourney(tourney)}>{tourney}</Dropdown.Item>
                            })
                        }
                    </DropdownButton>
                    <br/>
                    {
                        currTourney ? 
                        <div>
                            <h3>{"Your Selections for " + currTourney + ":"}</h3> 
                            {
                                keys.map(index => 
                                    <div key={index}>
                                        <DropdownButton variant="outline-dark" id="dropdown-basic-button" title={currPicks[index] ? currPicks[index] : "Pick #" + index}>
                                            {
                                                allPlayers.map(player => {
                                                    return <Dropdown.Item key={player} onClick={e=>handleNewPick(player, index)}>{player}</Dropdown.Item>
                                                })
                                            }
                                        </DropdownButton>
                                        <p>Current Selection: {savedPicks[index-1]}</p>
                                        <br/>
                                    </div>
                                )
                            }
                            <Button variant="success" disabled={tourneyStartDate[currTourney] < Date.now()} onClick={e => handleSubmit(currTourney, currPicks)}>Submit Picks</Button>
                        </div>
                        : <br/>
                    }
                </div>
                <div class="col">
                    <h2>Previous Selections</h2>
                    {
                        pickedPlayers.map(player => {
                            return <p key={player}>{player} has been selected {prevSelections[player]} times</p>
                        })
                    }
                </div>
            </div>
        </div>
    );
}

export default DGPicks;