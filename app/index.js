
import { databaseSetup } from "./database/index.js";
import { discordSetup } from "./discord/index.js"

const appSetUp = async () => {
    await databaseSetup();
    await discordSetup();
}

appSetUp();