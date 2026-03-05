import { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder } from "discord.js";

export const customId = "code";

export const execute = async (interaction) => {
    const modal = new ModalBuilder().setCustomId("codeModal").setTitle("Enter Verification Code");

    const codeInput = new TextInputBuilder()
            .setCustomId("codeInput")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("XXXXXX");

    const codeInputLabel = new LabelBuilder()
            .setLabel("Enter the code")
            .setDescription(`Enter the code which was sent from ${process.env.app_username}`)
            .setTextInputComponent(codeInput);

    modal.addLabelComponents(codeInputLabel);

    await interaction.showModal(modal);
}