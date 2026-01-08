import { SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { readFile, writeFile } from "node:fs/promises";

export const data = new SlashCommandBuilder().setName("register").setDescription("Set daily shift pings for this server.");

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
                    messagReply.content = "This channel has already been set for pings."
                    await interaction.reply(messagReply);
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
            };
            data = [...data.filter(guild => guild.guildId !== guildObject.guildId), guildObject];
            await writeFile("registered_channels.json", JSON.stringify(data));
            messagReply.content = "This channel has been successfully set for pings!";
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