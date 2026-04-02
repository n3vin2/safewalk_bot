import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv
import os
import mysql.connector
import time
from datetime import datetime
from zoneinfo import ZoneInfo

load_dotenv()
SHEETS_ID = os.getenv("SHEETS_ID")
timezone = os.getenv("time_zone")

def get_connection():
    return mysql.connector.connect(
        host = os.getenv("DATABASE_HOST"),
        user = os.getenv("DATABASE_USER"),
        password = os.getenv("DATABASE_PASSWORD"),
        database = os.getenv("DATABASE_NAME")
    )

def upsert_shift_credit(email, weeks, credits):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)


    for i, credit in enumerate(credits):
        cursor.execute("INSERT INTO Shift_Credit (user_email, week, credits) \
                        VALUES (%s, %s, %s) \
                        ON DUPLICATE KEY UPDATE credits = VALUES(credits)", (email, weeks[i], credit))
    conn.commit()

    cursor.close()
    conn.close()

def get_weeks(worksheet):
    weeks = []
    for week in worksheet.range(f"F{1}:{chr(ord('F') + num_weeks - 1)}{1}"):
        week_start_str = week.value.split(' - ')[0]
        week_start = datetime.strptime(week_start_str, "%b %d").replace(year=datetime.now(ZoneInfo(timezone)).year)
        weeks.append(week_start)
    return weeks

def get_credits_data(sheet):
    params = {'includeGridData': True, 'ranges': f"F1:{chr(ord('F') + num_weeks - 1)}{sheet.sheet1.row_count + 1}"}
    data = sheet.fetch_sheet_metadata(params)
    return data["sheets"][0]["data"][0]["rowData"]

def format_weekly_credits(raw_weekly_credits):
    res = []
    for i, week in enumerate(raw_weekly_credits):
        if "userEnteredValue" in week:
            res.append(float(week["userEnteredValue"]["numberValue"]))
        elif week["effectiveFormat"]["backgroundColor"]:
            res.append(0.0)
        else:
            res.append(None)
    return res


scopes =[
    "https://www.googleapis.com/auth/spreadsheets"
]
creds = Credentials.from_service_account_file("credentials.json", scopes=scopes)
client = gspread.authorize(creds)

sheet_id = SHEETS_ID

num_weeks = 15

while True:
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.sheet1

    weeks = get_weeks(worksheet)
    credits = get_credits_data(sheet)
    emails = worksheet.range(f"AP1:AP{worksheet.row_count + 1}")

    for i, email in enumerate(emails):
        if email.value and "@" in email.value:
            formatted_credits = format_weekly_credits(credits[i]["values"])
            print(formatted_credits)
            upsert_shift_credit(email.value, weeks, formatted_credits)
    print("done")
    time.sleep(5000)