import { ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, ButtonBuilder, ActionRowBuilder, MessageFlags, ButtonStyle, LabelBuilder } from "discord.js";

export const customId = "email";

export const execute = async (interaction, client) => {
    const modal = new ModalBuilder().setCustomId("email-modal").setTitle("Sending Verification Code");

    const emailInput = new TextInputBuilder()
            .setCustomId("emailInput")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("XXXXXX@domain");

    const emailInputLabel = new LabelBuilder()
            .setLabel("Enter your email")
            .setDescription("Enter the email with which you signed up on BetterImpact.")
            .setTextInputComponent(emailInput);

    modal.addLabelComponents(emailInputLabel);

    await interaction.showModal(modal);
}