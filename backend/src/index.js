// !!! IMPORTANT !!!
// Be sure to run 'npm run dev' from a
// terminal in the 'backend' directory!

import express from 'express';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import crypto from 'crypto';

import { applyRateLimiting, applyLooseCORSPolicy, applyBodyParsing, applyLogging, applyErrorCatching } from './api-middleware.js'

const app = express();
const port = 53706;
const tournaments = ['FLO', 'WACO', 'AUSTN', 'TXSTS', 'JBO', 'MCO', 'DDO', 'OTB', 'PDXO', 'BSF', 'TPC', 'DMC', 'EO',
                        'LSO', 'IDLE', 'WORLDS', 'DGLO', 'GMC', 'MVP', 'USDGC'];

const playerCols = ['tournament', 'player1', 'player2', 'player3', 'player4', 'player5', 'score'];

const GET_USER_SQL = 'SELECT * FROM Users WHERE uname = ?;'
const GET_ALL_USERS_SQL = 'SELECT uname FROM Users;'
const INSERT_USER_SQL = 'INSERT INTO Users(uname, pword, salt) VALUES (?, ?, ?);'

const FS_DB = "./db.db";
const FS_INIT_SQL = "./includes/init.sql";

const db = await new sqlite3.Database(FS_DB, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
db.serialize(() => {
    const INIT_SQL = fs.readFileSync(FS_INIT_SQL).toString();
    INIT_SQL.replaceAll(/\t\r\n/g, ' ').split(';').filter(str => str).forEach((stmt) => {
        db.run(stmt + ';');
    });
});

applyRateLimiting(app);
applyLooseCORSPolicy(app);
applyBodyParsing(app);
applyLogging(app);

app.get('/api/hello-world', (req, res) => {
    res.status(200).send({
        msg: "Hello! :)"
    })
})

app.get('/api/getUsers', (req, res) => {
    db.prepare(GET_ALL_USERS_SQL).get().all((err, ret) => {
        if (err) {
            res.status(500).send({
                msg: "Something went wrong",
                err: err
            });
        }
        else { 
            res.status(200).send(ret);
        }
    })
})

app.get('/api/getPicks/:user', (req, res) => {
    const username = req.params.user;
    const GET_ALL_PICKS = 'SELECT * FROM ' + username + ';'
    db.prepare(GET_ALL_PICKS).get().all((err, ret) => {
        if (err) {
            res.status(500).send({
                msg: "Something went wrong",
                err: err
            });
        }
        else {
            res.status(200).send(ret);
        }
    })
})

app.get('/api/getScores/:user', (req, res) => {
    const username = req.params.user;
    const GET_ALL_PICKS = 'SELECT tournament, score FROM ' + username + ';'
    db.prepare(GET_ALL_PICKS).get().all((err, ret) => {
        if (err) {
            res.status(500).send({
                msg: "Something went wrong",
                err: err
            });
        }
        else {
            res.status(200).send(ret);
        }
    })
})



app.get('/api/getPlayers', (req, res) => {
    const GET_PLAYERS_SQL = 'SELECT * FROM Players;';
    db.prepare(GET_PLAYERS_SQL).get().all((err, ret) => {
        if (err) {
            res.status(500).send({
                msg: "Something went wrong",
                err: err
            });
        }
        else {
            res.status(200).send(ret);
        }
    })
})

app.post('/api/submitPicks', (req, res) => {
    const username = req.body.username;
    const tourney = req.body.tourney;
    const pick1 = req.body.pick1;
    const pick2 = req.body.pick2;
    const pick3 = req.body.pick3;
    const pick4 = req.body.pick4;
    const pick5 = req.body.pick5;
    const REMOVE_EXISTING_PICKS = 'DELETE FROM ' + username + ' WHERE tournament = "' + tourney + '";';
    const INSERT_NEW_PICKS = 'INSERT INTO ' + username + '(tournament, player1, player2, player3, player4, player5)' +
                                ' VALUES ("' + tourney + '", "' + pick1 + '", "' + pick2 + '", "' + pick3 + '", "' + pick4 + '", "' + pick5 + '");';
    console.log(REMOVE_EXISTING_PICKS);
    console.log(INSERT_NEW_PICKS);
    db.serialize(() => {
        db.prepare(REMOVE_EXISTING_PICKS).get((err, ret) => {
            if (err) {
                res.status(500).send({
                    msg: "Something went wrong",
                    err: err
                });
            }
        });
        db.prepare(INSERT_NEW_PICKS).get((err, ret) => {
            if (err) {
                res.status(500).send({
                    msg: "Something went wrong",
                    err: err
                });
            }
            else {
                res.status(200).send();
            }
        })
    })
});

app.post('/api/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = calculateHash(salt, password);

    let CREATE_USER_TABLE = 'CREATE TABLE ' + username + "( ";
    playerCols.forEach(col => CREATE_USER_TABLE += col + " TEXT, ");
    CREATE_USER_TABLE = CREATE_USER_TABLE.slice(0, CREATE_USER_TABLE.length - 2);
    CREATE_USER_TABLE += " );";
    db.serialize(() => {
        db.prepare(GET_USER_SQL).get(username, (err, ret) => {
            if (err) {
                res.status(500).send({
                    msg: "Something went wrong",
                    err: err
                });
            }
            else {
                if (ret) {
                    res.status(409).send({
                        msg: "Username already taken"
                    });
                }
            }
        });

        db.prepare(INSERT_USER_SQL).get(username, hash, salt, (err, ret) => {
            if (err) {
                res.status(500).send({
                    msg: "Something went wrong",
                    err: err
                });
            }
            else {
                // res.status(200).send();
            }
        });
        db.prepare(CREATE_USER_TABLE).get((err, ret) => {
            if (err) {
                res.status(500).send({
                    msg: "Something went wrong",
                    err: err
                });
            }

            else {
                res.status(200).send();
            }
        })
    })
});

app.post('/api/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    db.prepare(GET_USER_SQL).get(username, (err, ret) => {
        if (err) {
            res.status(500).send({
                msg: "Something went wrong",
                err: err
            });
        }
        else {
            if (!ret) {
                res.status(401).send({
                    msg: "Username or password incorrect",
                    err: err
                });
            }
            else {
                let hash = crypto.createHmac('sha256', ret.salt).update(password).digest('hex');
                if (ret.uname !== username || ret.pword !== hash) {
                    res.status(401).send({
                        msg: "Username or password incorrect",
                        err: err
                    });
                }
                else {
                    res.status(200).send();
                }
            }
        }
    });
});

applyErrorCatching(app);

function calculateHash(salt, pass) {
    return crypto.createHmac('sha256', salt).update(pass).digest('hex');
}

// Open server for business!
app.listen(port, () => {
    console.log(`My API has been opened on :${port}`)
});
