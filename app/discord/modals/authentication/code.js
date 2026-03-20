import { MessageFlags } from "discord.js";
import { prisma } from "../../../services/db.js";
import crypto from "node:crypto";

export const customId = "codeModal";

export const execute = async (interaction) => {
    await interaction.deferReply();
    const code = interaction.fields.getTextInputValue("codeInput");

    const auth_entry = await prisma.authcode.findUnique(
        {
            where: {
                discord_id: interaction.user.id,
                code_hash: crypto.createHash("sha256").update(code).digest("hex")
            }
        }
    );

    if (!auth_entry) {
        await interaction.editReply(
            {
                content: "The code you entered is incorrect.",
                flags: MessageFlags.Ephemeral
            }
        );
        return;
    }

    await prisma.user.create(
        {
            data: {
                discord_id: interaction.user.id,
                email: auth_entry.email
            }
        }
    );

    await prisma.authcode.delete(
        {
            where: {
                discord_id: interaction.user.id
            }
        }
    );

    await interaction.editReply(
        {
            content: "Successfully linked your account to this email!",
            flags: MessageFlags.Ephemeral
        }
    );
}