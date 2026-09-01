import os
import json
import sqlite3
import uuid

# aliased because the module-level `timezone` variable below shadows the name
from datetime import datetime, timezone as dt_timezone
from zoneinfo import ZoneInfo
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

load_dotenv()
timezone = os.getenv("time_zone")
DB_PATH = os.getenv("DATABASE_URL", "").removeprefix("file:")

def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=5000")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def to_db_datetime(dt):
    # Prisma stores DateTime as ISO-8601 UTC text (e.g. 2026-08-31T04:05:06.123+00:00);
    # comparisons in the bot rely on every row using this exact format
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=dt_timezone.utc)
    return dt.astimezone(dt_timezone.utc).isoformat(timespec="milliseconds")

def get_role_id_mapping():
    conn = get_connection()
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT id, name FROM Shift_Type")

        res = set([row["name"] for row in cursor.fetchall()])

        cursor.close()
    finally:
        conn.close()
    return res

def wipe_database(conn, cursor):
    cursor.execute("DELETE FROM Shift")
    cursor.execute("DELETE FROM Dispatcher")
    conn.commit()

def write_database(conn, cursor, shift_data):
    shift_date = to_db_datetime(shift_data["Time"])

    for dispatcher in shift_data["Dispatchers"]:
        cursor.execute("INSERT INTO Dispatcher (id, name, shift_date) \
                       VALUES (?, ?, ?)", (str(uuid.uuid4()), dispatcher, shift_date))
    conn.commit()

    for shift in shift_data["Available_Shifts"]:
        cursor.execute("INSERT INTO Shift (id, shift_type_name, shift_start_hour, signed_up, capacity, shift_date) \
                       VALUES (?, ?, ?, ?, ?, ?)", (str(uuid.uuid4()), shift["shift_type_name"], shift["shift_start_hour"], shift["signed_up"], shift["capacity"], shift_date))
    conn.commit()

def login(driver):
    username = os.getenv("username")
    password = os.getenv("password")

    url = "https://app.betterimpact.com/Login/admin"
    driver.get(url)

    # logging in
    try:
        WebDriverWait(driver, TIMEOUT).until(
            expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "#UserName"))
        )
    except:
        return -1
    user_element = driver.find_element(By.CSS_SELECTOR, "#UserName")
    password_element = driver.find_element(By.CSS_SELECTOR, "#Password")

    user_element.send_keys(username)
    password_element.send_keys(password)

    login_button = driver.find_element(By.CSS_SELECTOR, "#SubmitLoginForm")
    login_button.click()
    pass

def getVolunteers(driver):
    shift_data = {
        "Dispatchers": [],
        "Available_Shifts": [],
        "Time": datetime.now(ZoneInfo(timezone))
    }
    try:
        WebDriverWait(driver, TIMEOUT).until(
            expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "a.favouriteLink"))
        )
        favLink = driver.find_element(By.CSS_SELECTOR, "a.favouriteLink")
        favLink.click()

        WebDriverWait(driver, TIMEOUT).until(
            expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "#ScheduleDetailsHolder"))
        )
        scheduleDetails = driver.find_element(By.CSS_SELECTOR, "#ScheduleDetailsHolder")

        WebDriverWait(scheduleDetails, TIMEOUT).until(
            expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "#ExpandAllShiftsButton"))
        )
        expandButton = driver.find_element(By.CSS_SELECTOR, "#ExpandAllShiftsButton")
        expandButton.click()

        WebDriverWait(driver, TIMEOUT).until(
            expected_conditions.presence_of_element_located((By.CSS_SELECTOR, "span.ui-button-icon-primary.ui-icon.ui-icon-circle-minus"))
        )
        soup = BeautifulSoup(driver.page_source, "lxml")
    except:
        return shift_data

    for day in soup.find_all("div", class_="marginAllHalf"):
        current_date = datetime.now(ZoneInfo(timezone)).strftime("%Y-%m-%d")
        if day.table["data-date"] != current_date:
            continue
        shift_type = None
        for cell in day.table.tbody.find_all("tr"):
            if "shiftRow" in cell["class"]:
                shift_type_text = cell.find("td", class_="activityNameColumn").a.text
                if shift_type_text.endswith("Dispatcher"):
                    shift_type = "d"
                else:
                    shift_time_element = cell.select_one("td.timeColumn.startTime").text
                    shift_type = shift_type_text.split(" ")[3]

                    if shift_type in role_id_mapping:
                        numCapacity = cell.select_one('td.numberColumn:has(span[title="Maximum Volunteers"])').span.text
                        num_signedUp = cell.select_one("td.numberColumn.shiftConfirmedTd").span.text

                        shift_data["Available_Shifts"].append({
                            "shift_type_name": shift_type,
                            "shift_start_hour": shift_time_element,
                            "signed_up": int(num_signedUp),
                            "capacity": int(numCapacity)
                        })
            if shift_type == "d" and "volunteerRow" in cell["class"]:
                dispatcherName = cell.find("td", class_="firstName").text.strip()
                shift_data["Dispatchers"].append(dispatcherName)
    return shift_data

role_id_mapping = get_role_id_mapping()
service = Service(ChromeDriverManager().install())
op = webdriver.ChromeOptions()
op.add_argument("--headless=new")
op.add_argument("--no-sandbox")

while True:
    conn = None
    driver = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        wipe_database(conn, cursor)
        driver = webdriver.Chrome(options = op, service = service)
        driver.maximize_window()
        login(driver)

        shift_data = getVolunteers(driver)
        write_database(conn, cursor, shift_data)

        cursor.close()

        print(f"[{str(datetime.now(ZoneInfo(timezone)))}] loop done")
    except Exception as e:
        print(e)
    finally:
        if conn is not None:
            conn.close()
        if driver is not None:
            driver.quit()
    time.sleep(60 * 5)
