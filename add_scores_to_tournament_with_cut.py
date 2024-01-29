import sqlite3
from sqlite3 import Error
import requests
from bs4 import BeautifulSoup
import pandas as pd
from sqlalchemy import create_engine


def get_data(url='https://www.pdga.com/tour/event/68748'):

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
    # mydata.drop('Place', inplace=True, axis=1)
    # mydata.drop('Points', inplace=True, axis=1)
    # mydata.drop('Par', inplace=True, axis=1)
    # mydata.drop('Rd1', inplace=True, axis=1)
    # mydata.drop('Rd2', inplace=True, axis=1)
    # mydata.drop('Rd3', inplace=True, axis=1)
    # mydata.drop('Rd4', inplace=True, axis=1)
    # mydata.drop('Finals', inplace=True, axis=1)
    # # mydata.drop('Total', inplace=True, axis=1)
    # mydata.drop('Prize', inplace=True, axis=1)
    # mydata.drop(mydata.columns[3], inplace=True, axis=1)
    # mydata.drop(mydata.columns[2], inplace=True, axis=1)

    # names = mydata['Name']
    # numbers = mydata['PDGA#']


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


def main():
    database = r"C:\Users\eliot\fantasydg\backend\db.db"

    # create a database connection
    conn = create_connection(database)
    with conn:
        df = get_data()
        names = df['Name']
        scores = df['Total']
        finals = df['Finals']
        for i in range(len(names)):
            if finals[i] != "":
                add_score(conn, 'Sample', scores[i], names[i])
            else: 
                add_score(conn, 'Sample', str(int(int(scores[i])*5/4)), names[i])

if __name__ == '__main__':
    main()