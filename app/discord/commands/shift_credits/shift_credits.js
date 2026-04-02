import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
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
        const shift_credits_component = await buildCreditsComponent(shift_credits);
        await interaction.reply({
            components: [shift_credits_component],
            flags: MessageFlags.IsComponentsV2
        });
    } catch (exception) {
        console.log(exception);
        messageReply.content = "Something went wrong. Please try again.";
        await interaction.reply(messageReply);
    }
}