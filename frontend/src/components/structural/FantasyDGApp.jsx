import React, { useContext, useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

import DGTourneyStartsContext from '../context/DGTourneyStartsContext';

import DGLayout from './DGLayout';
import DGHome from '../content/DGHome';
import DGLogin from '../auth/DGLogin';
import DGLogout from '../auth/DGLogout';
import DGRegister from '../auth/DGRegister';
import DGTournament from '../content/DGTournament';
import DGNoMatch from '../content/DGNoMatch';
import DGStandings from '../content/DGStandings';
import DGPicks from '../content/DGPicks';
import DGRules from '../content/DGRules';

function FantasyDGApp() {

  const [tourneyStarts, setTourneyStarts] = useContext(DGTourneyStartsContext);
  const [pastTourneys, setPastTourneys] = useState([]);

  const tourneys = ['FLO', 'WACO', 'AUSTN', 'TXSTS', 'JBO', 'MCO', 'CHAMP', 'DDO', 'OTB', 'PDXO', 'BSF', 'TPC', 'DMC', 'EO',
  'LSO', 'IDLE', 'WORLDS', 'DGLO', 'GMC', 'MVP', 'USDGC'];


  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<DGLayout tourneys={tourneys} />}>
          <Route index element={<DGHome />} />
          <Route path="/login" element={<DGLogin />}></Route>
          <Route path="/register" element={<DGRegister />}></Route>
          <Route path="/logout" element={<DGLogout />}></Route>
          <Route path="/standings" element={<DGStandings/>}></Route>
          <Route path="/rules" element={<DGRules/>}></Route>
          <Route path="/picks" element={<DGPicks/>}></Route>
          {
            tourneys.map(tourney => {
                          
                return <Route key={tourney} path={`tournaments/${tourney}`} element={<DGTournament name={tourney} />} />
            })
          }
          <Route path="*" element={<DGNoMatch />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default FantasyDGApp;
