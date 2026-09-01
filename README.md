# safewalk_bot
This is Discord a bot used for various functionalities related to the University of Alberta's Safewalk volunteering program. So far, it includes the following features:
- `/register`: Set shift pings on a given channel on Discord using
    - To unset the channel, use `/unregister`
    - This command requires the user to be an admin in the given Discord server to be used
- `/shift-credits`: Allow a volunteer to display their current shift credits throughout an academic term
    - **Volunteers link their Discord account with a Safewalk email in order to use this** 
- `/authenticate`: Allows a user to manage the email account to which their Discord account is linked

If slash functions are unavailable to volunteers, they may use the bot prefix `sw!` in order to execute the bot commands (ie. `sw!register`, `sw!shift-credits`, `sw!authenticate`)

The bot was made using Discord.js with a Prisma ORM. Furthermore, it pairs with two Python scripts.
- One of the scripts obtains data from a spreadsheet tracking volunteer's shift credits
- The other script scrapes shift data on BetterImpact using Selenium

The bot uses a SQLite database (a single local file, managed by Prisma in this repository) to store the data from the Python scripts. The bot and both Python scripts point at the same database file via `DATABASE_URL` in `.env`:

```
DATABASE_URL="file:./safewalk.db?connection_limit=1"
```

A relative path is resolved against the `prisma/` directory (Prisma's convention for SQLite URLs — the Python scripts mirror it), so the default above puts the database at `prisma/safewalk.db`. An absolute path also works. The database uses WAL mode with a busy timeout, and `connection_limit=1` keeps Prisma on a single connection, so the three processes can safely share the file.

The bot also utilizes AWS SES to send emails, so configure an AWS SES service, and own a domain to start the bot.

## Setting up the bot
To start off, clone the repository using 
```shell
git clone https://github.com/safewalkdevteam/safewalk_bot
```

Install dependencies using
```shell
npm i
```
\
Set `DATABASE_URL` in `.env`, then create the database and apply the migrations:

```bash
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

(For development, `npx prisma migrate dev` does all three in one step.)

Once the database migrations are applied, you can start the bot using the following command:

```shell
npm run start
```