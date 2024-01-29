import sqlite3
from sqlite3 import Error
import requests
from bs4 import BeautifulSoup
import pandas as pd
from sqlalchemy import create_engine
import argparse


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
    cur = conn.cursor()
    try:
        cur.execute(sql)
        conn.commit()
    except:
        pass
    return cur.lastrowid

def get_users(conn):
    sql = ' SELECT uname from Users; '
    cur = conn.cursor()
    rows = cur.execute(sql).fetchall()
    names = []
    for user in rows:
        names.append(user[0])
    return names

def calculate_user_scores(conn, users, tourney, score_dict):
    for user in users:
        picks_sql = ' SELECT player1, player2, player3, player4, player5 FROM ' + user + ' WHERE tournament = "' + tourney + '";'
        cur = conn.cursor()
        picks = cur.execute(picks_sql).fetchall()
        score = 0
        for player in picks[0]:
            score += score_dict[player]
        insert_score_sql = ' UPDATE ' + user + ' SET score = ' + str(score) + ' WHERE tournament = "' + tourney + '";'
        print(insert_score_sql)
        cur.execute(insert_score_sql)
        conn.commit()


def main(tourney, url):
    database = r"C:\Users\eliot\fantasydg\backend\db.db"

    fantasy_scores = {}
    # create a database connection
    conn = create_connection(database)
    with conn:
        df = get_data(url)
        names = df['Name']
        scores = df['Total']
        for i in range(len(names)):
            try:
                fantasy_scores[names[i]] = int(scores[i]) - int(scores[0])
            except:
                pass
            add_score(conn, tourney, scores[i], names[i])
        users = get_users(conn)
        calculate_user_scores(conn, users, tourney, fantasy_scores)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description = 'Say hello')
    parser.add_argument('tourney', help='tourney abbreviation')
    parser.add_argument('--url', default='https://www.pdga.com/tour/event/64957', help='link to tournament results page')
    args = parser.parse_args()

    main(args.tourney, args.url)