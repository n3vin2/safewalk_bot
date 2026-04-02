import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, ButtonBuilder, ActionRowBuilder, MessageFlags, ButtonStyle } from "discord.js";

export const data = new SlashCommandBuilder().setName("authenticate").setDescription("Authenticates discord user by linking them to their Better Impact email")

const instructions = "### To link your Discord account to your BetterImpact E-mail, follow these instructions:\n\
1. Click on the \"Enter E-mail\" button\n\
2. Input the E-mail you used to sign up using BetterImpact\n\
3. A code will be sent to that E-mail, copy that code\n\
4. Click the \"Enter code\" button\n\
5. Paste the code";

export const execute = async (interaction) => {
    let user
    if (interaction instanceof ChatInputCommandInteraction) {
        user = interaction.user;
    } else {
        user = interaction.author;
    }
    try {
        const container = new ContainerBuilder()
            .setAccentColor(0xffff00)
            .addTextDisplayComponents((textDisplay) => 
                textDisplay.setContent("## Linking your Discord account to your BetterImpact E-mail")
            )
            .addTextDisplayComponents((textDisplay) => 
                textDisplay.setContent(instructions)
            )
            .addActionRowComponents((actionRow) => 
                actionRow.setComponents(
                    new ButtonBuilder().setCustomId("email").setLabel("Enter E-mail").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("code").setLabel("Enter code").setStyle(ButtonStyle.Secondary)
                )
            );
        await user.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
        await interaction.reply({
            content: "I have sent the instructions in your DMs",
            flags: MessageFlags.Ephemeral
        });
    } catch (exception) {
        console.log(exception);
        await interaction.reply({
            content: "Something went wrong. Please try again.",
            flags: MessageFlags.Ephemeral
        });
    }
}