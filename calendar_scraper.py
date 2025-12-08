import os
import json
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

TIMEOUT = 60

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

def login(driver):
    load_dotenv()
    username = os.getenv("username")
    password = os.getenv("password")

    url = "https://app.betterimpact.com/Login/admin"
    driver.get(url)

    # logging in
    username_input_loaded = False
    while not username_input_loaded:
        try:
            WebDriverWait(driver, TIMEOUT).until(
                expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "#UserName"))
            )
            username_input_loaded = True
        except:
            driver.refresh()
    user_element = driver.find_element(By.CSS_SELECTOR, "#UserName")
    password_element = driver.find_element(By.CSS_SELECTOR, "#Password")

    user_element.send_keys(username)
    password_element.send_keys(password)

    login_button = driver.find_element(By.CSS_SELECTOR, "#SubmitLoginForm")
    login_button.click()
    pass

def getVolunteers(driver):
    fav_link_loaded = False
    while not fav_link_loaded:
        try:
            WebDriverWait(driver, TIMEOUT).until(
                expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "a.favouriteLink"))
            )
            fav_link_loaded = True
        except:
            driver.refresh()
    favLink = driver.find_element(By.CSS_SELECTOR, "a.favouriteLink")
    favLink.click()

    fully_loaded = False
    while not fully_loaded:
        expand_button_loaded = False
        try:
            WebDriverWait(driver, TIMEOUT).until(
                expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "#ScheduleDetailsHolder"))
            )
            scheduleDetails = driver.find_element(By.CSS_SELECTOR, "#ScheduleDetailsHolder")

            WebDriverWait(scheduleDetails, TIMEOUT).until(
                expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "#ExpandAllShiftsButton"))
            )
            expandButton = driver.find_element(By.CSS_SELECTOR, "#ExpandAllShiftsButton")
            expand_button_loaded = True
            expandButton.click()

            WebDriverWait(driver, TIMEOUT).until(
                expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "span.ui-button-icon-primary.ui-icon.ui-icon-circle-minus"))
            )
            fully_loaded = True
        except:
            if not expand_button_loaded:
                try:
                    WebDriverWait(scheduleDetails, TIMEOUT).until(
                        expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "div.notice"))
                    )
                    return -1
                except:
                    driver.refresh()
            else:
                driver.refresh()


    soup = BeautifulSoup(driver.page_source, "lxml")
    for day in soup.find_all("div", class_="marginAllHalf"):
        current_date = datetime.now().strftime("%Y-%m-%d")
        if day.table["data-date"] == current_date:
            shift_type = None
            for cell in day.table.tbody.find_all("tr"):
                if "shiftRow" in cell["class"]:
                    shift_type_text = cell.find("td", class_="activityNameColumn").a.text
                    if shift_type_text.endswith("Dispatcher"):
                        shift_type = "d"
                    else:
                        shift_time_element = cell.select_one("td.timeColumn.startTime").text
                        shift_type = shift_type_text.split(" ")[-2]

                        shift_type = role_index_mapping[shift_type]
                        shift_time = time_index_mapping[shift_time_element]

                        database["Available_Shifts"][shift_type] = 1
                        numCapacity = cell.select_one('td.numberColumn:has(span[title="Maximum Volunteers"])').span.text
                        num_signedUp = cell.select_one("td.numberColumn.shiftConfirmedTd").span.text
                        grid[shift_time][shift_type] = num_signedUp + "/" + numCapacity
                if shift_type == "d" and "volunteerRow" in cell["class"]:
                    dispatcherName = cell.find("td", class_="firstName").text.strip()
                    database["Dispatchers"].append(dispatcherName)
            return 0
    return -1

service = Service(ChromeDriverManager().install())
op = webdriver.ChromeOptions()
op.add_argument("--headless=new")
driver = webdriver.Chrome(options = op, service = service)
driver.maximize_window()
login(driver)

while True:
    database = {
        "Active": False,
        "Available_Shifts": [],
        "Dispatchers": [],
        "Volunteers": []
    }
    database["Available_Shifts"] = [0] * role_cnt
    grid = database["Volunteers"]
    for i in range(shift_cnt):
        if i < shift_cnt - 1:
            grid.append([0] * role_cnt)
        else:
            grid.append([0] * (role_cnt - 2))
    if getVolunteers(driver) == 0:
        database["Active"] = True
        with open("volunteer_schedule.json", "w", encoding="utf-8") as file:
            file.write(json.dumps(database))
    else:
        database["Active"] = False
        with open("volunteer_schedule.json", "w", encoding="utf-8") as file:
            file.write(json.dumps(database))
    print(f"[{str(datetime.now())}] loop done")
    time.sleep(60 * 5)
