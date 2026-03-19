import { discordSetup } from "./discord/index.js"

const appSetUp = async () => {
    await discordSetup();
}

appSetUp();