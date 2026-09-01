import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv
import os
import sqlite3
import uuid
import time
# aliased because the module-level `timezone` variable below shadows the name
from datetime import datetime, timezone as dt_timezone
from zoneinfo import ZoneInfo

load_dotenv()
SHEETS_ID = os.getenv("SHEETS_ID")
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

def wipe_database():
    conn = get_connection()
    try:
        conn.execute("DELETE FROM Shift_Credit")
        conn.commit()
    finally:
        conn.close()

def upsert_shift_credit(email, weeks, credits):
    conn = get_connection()
    try:
        cursor = conn.cursor()

        for i, credit in enumerate(credits):
            cursor.execute("INSERT INTO Shift_Credit (id, user_email, week, credits) \
                            VALUES (?, ?, ?, ?) \
                            ON CONFLICT(user_email, week) DO UPDATE SET credits = excluded.credits",
                           (str(uuid.uuid4()), email, to_db_datetime(weeks[i]), credit))
        conn.commit()

        cursor.close()
    finally:
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
    wipe_database()
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
    print(f"[{str(datetime.now(ZoneInfo(timezone)))}] shift credit update done")
    time.sleep(60 * 60 * 12)