import { ModalBuilder, MessageFlags } from "discord.js";
import { prisma } from "../../../services/db.js";

export const customId = "unlink";

export const execute = async (interaction) => {
   const discord_user = await prisma.user.findUnique({
        where: { discord_id: interaction.user.id }
    });

    if (!discord_user) {
        await interaction.reply({
            content: "You have not linked your Discord account to an email.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const modal = new ModalBuilder().setCustomId("unlinkModal").setTitle("Unauthenticate Confirmation");

    modal.addTextDisplayComponents(textDisplay =>
        textDisplay.setContent(`Are you sure you would like to unlink your Discord account from the Safewalk email ${discord_user.email}?`)
    );
    
    await interaction.showModal(modal);
}