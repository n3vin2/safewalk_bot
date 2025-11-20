import os
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

    soup = BeautifulSoup(driver.page_source)
    print(soup)
    time.sleep(100000)
    pass

service = Service(ChromeDriverManager().install())
op = webdriver.ChromeOptions()
#op.add_argument("--headless=new")
driver = webdriver.Chrome(options = op, service = service)
driver.maximize_window()
login(driver)
getVolunteers(driver)
time.sleep(10)
