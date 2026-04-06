import { MessageFlags } from "discord.js";
import { prisma } from "../../../services/db.js";

export const customId = "unlinkModal";

export const execute = async (interaction) => {
    await interaction.deferReply();

    const discord_user = await prisma.user.findUnique({
        where: { discord_id: interaction.user.id }
    });

    if (!discord_user) {
        await interaction.editReply({
            content: "You have not linked your Discord account to an email.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    await prisma.user.delete({
        where: { discord_id: interaction.user.id }
    });

    await interaction.editReply({
        content: "Successfully unlinked your account from this email!",
        flags: MessageFlags.Ephemeral
    });
}