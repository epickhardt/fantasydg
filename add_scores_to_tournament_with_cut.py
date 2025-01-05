import argparse
import sqlite3
from sqlite3 import Error
import requests
from bs4 import BeautifulSoup
import pandas as pd
from sqlalchemy import create_engine


def get_data(url):

    page = requests.get(url)

    soup = BeautifulSoup(page.text, 'lxml')

    table1 = soup.find('table', id='tournament-stats-0')

    headers = []
    for i in table1.find_all('th'):
        title = i.text
        headers.append(title)

    mydata = pd.DataFrame(columns = headers)
    for j in table1.find_all('tr')[1:]:
        row_data = j.find_all('td')
        row = [i.text for i in row_data]
        length = len(mydata)
        mydata.loc[length] = row

    return mydata


def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
    except Error as e:
        print(e)

    return conn


def add_score(conn, tournament, score, name):
    """
    Update record with a new tournament score
    """
    sql = ' UPDATE Players SET ' + tournament + ' = ' + score + ' WHERE Name = "' + name + '";'
    print(sql)
    cur = conn.cursor()
    cur.execute(sql)
    conn.commit()
    return cur.lastrowid

def get_users(conn):
    sql = ' SELECT uname from Users; '
    cur = conn.cursor()
    rows = cur.execute(sql).fetchall()
    names = []
    for user in rows:
        names.append(user[0])
    names.remove("Cdpeterson")
    print(names)
    return names

def calculate_user_scores(conn, users, tourney, score_dict):
    for user in users:

        picks_sql = ' SELECT player1, player2, player3, player4, player5 FROM ' + user + ' WHERE tournament = "' + tourney + '";'
        cur = conn.cursor()
        picks = cur.execute(picks_sql).fetchall()
        score = 0
        if False:
            pass
        else:
            for player in picks[0]:
                score += score_dict[player]
        insert_score_sql = ' UPDATE ' + user + ' SET score = ' + str(score) + ' WHERE tournament = "' + tourney + '";'
        print(insert_score_sql)
        cur.execute(insert_score_sql)
        conn.commit()

def main(tourney, url):
    database = r"/root/fantasydg/backend/db.db"
    fantasy_scores = {}
    # create a database connection
    conn = create_connection(database)
    with conn:
        df = get_data(url)
        names = df['Name']
        scores = df['Total']
        finals = df['Finals']
        max_made_cut = 0
        for i in range(len(names)):
            try:
                if finals[i] != "":
                    if int(scores[i]) > max_made_cut:
                        max_made_cut = int(scores[i])
                    add_score(conn, tourney, scores[i], names[i])
                    fantasy_scores[names[i]] = int(scores[i]) - int(scores[0])
                else:
                    to_par = int(scores[i]) - 192 # Par thru 3 rounds
                    to_par *= 4/3 # Extrapolate for 4th rd
                    to_par = 256 + to_par # Add back total par through 4 rounds
                    to_par = max(max_made_cut, int(to_par)) # see if better than worst that made cut
                    add_score(conn, tourney, str(to_par), names[i])
                    fantasy_scores[names[i]] = to_par - int(scores[0])
            except:
                print(names[i])
                fantasy_scores[names[i]] = 265 - int(scores[0])  #worst score by selected player
        # fantasy_scores["Jakub Semerád"] = 265 - int(scores[0]) 
        users = get_users(conn)
        calculate_user_scores(conn, users, tourney, fantasy_scores)

if __name__ == '__main__':

    parser = argparse.ArgumentParser(description = 'Say hello')
    parser.add_argument('tourney', help='tourney abbreviation')
    parser.add_argument('--url', default='https://www.pdga.com/tour/event/64957', help='link to tournament results page')
    args = parser.parse_args()

    main(args.tourney, args.url)
