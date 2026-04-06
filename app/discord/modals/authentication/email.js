import { MessageFlags } from "discord.js";
import { sendEmail } from "../../../services/email/emailService.js";
import { prisma } from "../../../services/db.js"
import crypto from "node:crypto";

export const customId = "emailModal";

export const execute = async (interaction) => {
    await interaction.deferReply();

    const discord_user = await prisma.user.findUnique({
        where: { discord_id: interaction.user.id }
    });

    if (discord_user) {
        await interaction.editReply({
            content: "Your Discord account is already linked to an email. You must unlink first.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const code = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
    const email = interaction.fields.getTextInputValue("emailInput");

    const already_used = await prisma.user.findUnique({
        where: { email: email }
    });

    if (already_used) {
        await interaction.editReply({
            content: "This email is already in use with another Discord account.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    try {
        const subject = "Your Safewalk Authentication code";
        const body = `<h1>Your verification code from the Safewalk bot</h1>\
        The code to enter under the \"Enter code\" section of the Safewalk bot is ${code}. <strong>DO NOT SHARE THIS CODE WITH ANYONE!</strong>`;
        const res = await sendEmail(email, subject, body);
    } catch (exception) {
        await interaction.editReply({
            content: "The email you entered was invalid.",
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    const new_auth_obj = {
        discord_id: interaction.user.id,
        email: email,
        code_hash: crypto.createHash("sha256").update(code).digest("hex"),
        expiry: new Date(Date.now() + 10 * 60 * 1000)
    }

    await prisma.authcode.upsert({
        where: { discord_id: interaction.user.id },
        update: new_auth_obj,
        create: new_auth_obj
    });

    await interaction.editReply({
        content: "Successfully sent the code into your inbox!",
        flags: MessageFlags.Ephemeral
    });
}