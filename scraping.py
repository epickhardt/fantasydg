# Import libraries
import requests
from bs4 import BeautifulSoup
import pandas as pd
from sqlalchemy import create_engine

url = 'https://www.pdga.com/tour/event/68748'
page = requests.get(url)

soup = BeautifulSoup(page.text, 'lxml')
soup

table1 = soup.find('table', id='tournament-stats-0')
table1

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

mydata.drop('Place', inplace=True, axis=1)
mydata.drop('Points', inplace=True, axis=1)
mydata.drop('Par', inplace=True, axis=1)
mydata.drop('Rd1', inplace=True, axis=1)
mydata.drop('Rd2', inplace=True, axis=1)
mydata.drop('Rd3', inplace=True, axis=1)
mydata.drop('Rd4', inplace=True, axis=1)
mydata.drop('Finals', inplace=True, axis=1)
mydata.drop('Total', inplace=True, axis=1)
mydata.drop('Prize', inplace=True, axis=1)
mydata.drop(mydata.columns[3], inplace=True, axis=1)
mydata.drop(mydata.columns[2], inplace=True, axis=1)

names = mydata['Name']
numbers = mydata['PDGA#']
print(names[0])
print(numbers[0])


engine = create_engine('sqlite:///backend/db.db', echo=False)
mydata.to_sql('Players', con=engine, if_exists='replace')