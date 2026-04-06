import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags, ChannelType } from "discord.js";
import { prisma } from "../../../services/db.js"
import { getShiftCredits } from "../../../services/shifts.js";
import { buildCreditsComponent } from "../../embeds/shfit_credits.js";

export const data = new SlashCommandBuilder().setName("shift-credits").setDescription("Get the current number of shift credits you have.");

export const execute = async (interaction) => {
    let user
    if (interaction instanceof ChatInputCommandInteraction) {
        user = interaction.user;
    } else {
        user = interaction.author;
    }
    const messageReply = {
        content: ""
    };
    try {
        const discord_user = await prisma.user.findUnique({
            where: { discord_id: user.id }
        });

        if (!discord_user) {
            messageReply.content = "You have not yet linked your email."
            messageReply.flags = MessageFlags.Ephemeral
            await interaction.reply(messageReply);
            return;
        }

        const shift_credits = await getShiftCredits(discord_user.email);

        if (shift_credits.length === 0) {
            messageReply.content = "The email you have provided is not linked to a Safewalk account."
            messageReply.flags = MessageFlags.Ephemeral
            await interaction.reply(messageReply);
            return;
        }
        const shift_credits_component = await buildCreditsComponent(shift_credits);

        if (interaction.channel.type === ChannelType.DM) {
            await interaction.reply({
                components: [shift_credits_component],
                flags: MessageFlags.IsComponentsV2
            });
            return;
        }
        await user.send({
            components: [shift_credits_component],
            flags: MessageFlags.IsComponentsV2
        });
        messageReply.content = "I have sent the shift credits into your DMs."
        messageReply.flags = MessageFlags.Ephemeral
        await interaction.reply(messageReply)
    } catch (exception) {
        console.log(exception);
        messageReply.content = "Something went wrong. Please try again.";
        await interaction.reply(messageReply);
    }
}