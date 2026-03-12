import { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, MessageFlags, InteractionCollector } from "discord.js";

export const customId = "codeModal";

export const execute = async (interaction) => {
    console.log("codeInput");
    console.log(interaction.fields.getTextInputValue())
    await interaction.editReply(
        {
            content: "some stuff",
            flags: MessageFlags.Ephemeral
        }
    );
}