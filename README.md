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

The bot uses a MySQL database to store the data from the Python scripts. Currently, the database is in another repository due to the several projects potentially requiring the data. \
**Do not run `prisma migrate dev` / `prisma migrate deploy`
anymore.**

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
To pick up a database schema change (after a new migration is applied), run the following command:

```bash
npx prisma db pull
npx prisma generate
```

Note `db pull` will also pull in tables owned by other apps (`team`,
`team_ping`) — that's harmless.

Once the database migrations are applied, you can start the bot using the following command:

```shell
npm run start
```