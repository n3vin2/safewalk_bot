import { SlashCommandBuilder, PermissionsBitField, MessageFlags, ChatInputCommandInteraction } from "discord.js";
import { prisma } from "../../../services/db.js";

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
            const channel_object = {
                guild_id: guildId,
                channel_id: channelId
            }

            const channel = await prisma.channel.findUnique({
                where: { guild_id_channel_id: channel_object }
            });

            if (channel) {
                await prisma.channel.delete({
                    where: { guild_id_channel_id: channel_object }
                });
                messagReply.content = "This channel will no longer be set for pings.";
                await interaction.reply(messagReply);
                return;
            }

            messagReply.content = "This channel was not set for pings.";
            await interaction.reply(messagReply);
            return;
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