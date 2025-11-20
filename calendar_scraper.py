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
import time

def login(driver):
    pass

service = Service(ChromeDriverManager().install())
op = webdriver.ChromeOptions()
op.add_argument("--headless=new")
driver = webdriver.Chrome(options = op, service = service)
url = "https://app.betterimpact.com/Login/admin"
driver.get(url)
print(driver.page_source)
time.sleep(10)
