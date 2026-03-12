import { SlashCommandBuilder, PermissionsBitField, MessageFlags, ChatInputCommandInteraction } from "discord.js";
import { readFile, writeFile } from "node:fs/promises";

export const data = new SlashCommandBuilder().setName("unregister").setDescription("Remove daily shift pings for this server.");

export const execute = async (interaction) => {
    const channelId = interaction.channelId;
    const guildId = interaction.guildId;
    const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);
    let userId;
    const messagReply = {
        content: "",
        flags: MessageFlags.Ephemeral
    }
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
                messagReply.content = "This channel was not set for pings.";
                await interaction.reply(messagReply);
                return;
            }
            
            newGuildObj = {
                ...newGuildObj,
                channels: newGuildObj.channels.filter(channel => channel.channelId !== channelId)
            }
            data = [...data.filter(guild => guild.guildId !== guildId), newGuildObj];
            await writeFile("registered_channels.json", JSON.stringify(data));
            messagReply.content = "This channel will no longer be set for pings.";
            await interaction.reply(messagReply);
        } else {
            messagReply.content = "Insufficient permissions to run this command.";
            await interaction.reply(messagReply);
        }
    } catch (exception) {
        console.log(exception);
        messagReply.content = "Something went wrong. Please try again.";
        await interaction.reply(messagReply);
    }
}