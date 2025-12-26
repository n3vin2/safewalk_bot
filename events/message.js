import { Events } from "discord.js";

export const name = Events.MessageCreate;
export const once = false;
export const execute = async function(message, client) {
    if (!message.interaction) {
        if (message.content.startsWith(client.config.prefix)) {
            const args = message.content.split(/\s+/);
            const commandName = args[0].slice(client.config.prefix.length, args[0].length);
            const command = client.commands.get(commandName);
            if (command) {
                await message.reply("Running command...");
                await command.execute(message)
            } else {
                await message.reply("Sorry, I do not understand this command.");
            }
        }
    }
};