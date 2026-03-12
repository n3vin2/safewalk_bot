import { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, MessageFlags, InteractionCollector } from "discord.js";

export const customId = "emailModal";

export const execute = async (interaction) => {
    console.log("emailInput");
    console.log(interaction.fields.getTextInputValue())
    await interaction.editReply(
        {
            content: "some stuff",
            flags: MessageFlags.Ephemeral
        }
    );
}