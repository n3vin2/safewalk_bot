import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import { readFile, writeFile } from "node:fs/promises";

export const data = new SlashCommandBuilder().setName("unregister").setDescription("Remove daily shift pings for this server.");

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

            let newGuildObj = null;
            data.forEach(guild => {
                if (guild.guildId === guildId) {
                    guild.channels.forEach(channel => {
                        if (channel.channelId === channelId) {
                            newGuildObj = guild;
                        }
                    });
                }
            });
            if (!newGuildObj) {
                await interaction.reply("This channel was not set for pings.");
                return;
            }
            
            newGuildObj = {
                ...newGuildObj,
                channels: newGuildObj.channels.filter(channel => channel.channelId !== channelId)
            }
            data = [...data.filter(guild => guild.guildId !== guildId), newGuildObj];
            await writeFile("registered_channels.json", JSON.stringify(data));
            await interaction.reply("This channel will no longer be set for pings.");
        } else {
            await interaction.reply("Insufficient permissions to run this command.");
        }
    } catch (exception) {
        console.log(exception);
        await interaction.reply("Something went wrong. Please try again.");
    }
}