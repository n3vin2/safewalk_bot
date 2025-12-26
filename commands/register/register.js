import { SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction } from "discord.js";
import { readFile, writeFile } from "node:fs/promises";

export const data = new SlashCommandBuilder().setName("register").setDescription("Set daily shift pings for this server.");

export const execute = async (interaction) => {
    const channelId = interaction.channelId;
    const guildId = interaction.guildId;
    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
    let userId;
    if (interaction instanceof ChatInputCommandInteraction) {
        userId = interaction.user.id;
    } else {
        userId = interaction.author.id;
    }
    try {
        if (userId === process.env.dev_id || isAdmin) {
            const rawData = await readFile("registered_channels.json", "utf-8");
            let data = JSON.parse(rawData);

            let guildObject = null;
            data.forEach(guild => {
                if (guildId === guild.guildId) {
                    guildObject = guild;
                }
            });
            if (guildObject) {
                let channelExist = false;
                guildObject.channels.forEach(channel => {
                    if (channelId === channel.channelId) {
                        channelExist = true;
                    }
                });
                if (channelExist) {
                    await interaction.reply("This channel has already been set for pings.");
                    return;
                }
            } else {
                guildObject = {
                    guildId: guildId,
                    channels: []
                };
            }
            guildObject = {
                ...guildObject,
                channels: [
                    ...guildObject.channels,
                    {
                        channelId: channelId,
                        messageId: null,
                    }
                ]
            }
            data = [...data.filter(guild => guild.guildId !== guildObject.guildId), guildObject];
            await writeFile("registered_channels.json", JSON.stringify(data));
            await interaction.reply("This channel has been successfully set for pings!");

        } else {
            await interaction.reply("Insufficient permissions to run this command.");
        }
    } catch (exception) {
        console.log(exception);
        await interaction.reply("Something went wrong. Please try again.");
    }
}