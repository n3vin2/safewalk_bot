import os
from datetime import datetime
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import ElementNotInteractableException
from selenium.common.exceptions import TimeoutException

from webdriver_manager.chrome import ChromeDriverManager

from bs4 import BeautifulSoup
import time

TIMEOUT = 1000000000000000000

time_index_mapping = {
    "7:00 PM": 0,
    "8:00 PM": 1,
    "9:00 PM": 2
}

role_index_mapping = {
    "Patroller": 0,
    "Study": 1,
    "Trainee": 2,
    "Trainer": 3,
}

shift_cnt = len(time_index_mapping.keys())
role_cnt = len(role_index_mapping.keys())
grid = []
for i in range(shift_cnt):
    if i < shift_cnt - 1:
        grid.append([0] * (role_cnt - 1))
    else:
        grid.append([0] * (role_cnt - 2))

def login(driver):
    load_dotenv()
    username = os.getenv("username")
    password = os.getenv("password")

    url = "https://app.betterimpact.com/Login/admin"
    driver.get(url)

    # logging in
    user_element = driver.find_element(By.CSS_SELECTOR, "#UserName")
    password_element = driver.find_element(By.CSS_SELECTOR, "#Password")

    user_element.send_keys(username)
    password_element.send_keys(password)

    login_button = driver.find_element(By.CSS_SELECTOR, "#SubmitLoginForm")
    login_button.click()
    pass

def getVolunteers(driver):
    WebDriverWait(driver, TIMEOUT).until(
        expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "a.favouriteLink"))
    )
    favLink = driver.find_element(By.CSS_SELECTOR, "a.favouriteLink")
    favLink.click()

    WebDriverWait(driver, TIMEOUT).until(
        expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "#ExpandAllShiftsButton"))
    )
    expandButton = driver.find_element(By.CSS_SELECTOR, "#ExpandAllShiftsButton")
    expandButton.click()

    WebDriverWait(driver, TIMEOUT).until(
        expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "span.ui-button-icon-primary.ui-icon.ui-icon-circle-minus"))
    )

    soup = BeautifulSoup(driver.page_source, "lxml")
    for day in soup.find_all("div", class_="marginAllHalf"):
        current_date = datetime.now().strftime("%Y-%m-%d")
        if day.table["data-date"] == current_date:
            shift_time = None
            shift_type = None
            for cell in day.table.tbody.find_all("tr"):
                #print(cell["class"])
                if "shiftRow" in cell["class"]:
                    shift_type_text = cell.find("td", "activityNameColumn").a.text
                    if shift_type_text.endswith("Dispatcher"):
                        print(shift_type_text)
                    else:
                        pass
                    #print(shift_type_html.a.text)
                print("shiftRow" in cell["class"])
            return 0
        #print(day.prettify())
    #print(soup.prettify())
    #time.sleep(100000)
    return 1

service = Service(ChromeDriverManager().install())
op = webdriver.ChromeOptions()
op.add_argument("--headless=new")
driver = webdriver.Chrome(options = op, service = service)
driver.maximize_window()
login(driver)
if getVolunteers(driver) == 0:
    pass
else:
    pass
time.sleep(10)
