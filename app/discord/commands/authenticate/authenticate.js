import { SlashCommandBuilder, ChatInputCommandInteraction, ContainerBuilder, ButtonBuilder, ChannelType, MessageFlags, ButtonStyle } from "discord.js";

export const data = new SlashCommandBuilder().setName("authenticate").setDescription("Authenticates discord user by linking them to their Better Impact email")

const instructions = "### To link your Discord account to your Safewalk email, follow these instructions:\n\
1. Click on the \"Enter Email\" button\n\
2. Input the E-mail you used to sign up for Safewalk\n\
3. A code will be sent to that Email, copy that code\n\
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
            .addTextDisplayComponents(
                textDisplay => textDisplay.setContent("# Safewalk Email Linking Menu"),
                textDisplay => textDisplay.setContent("## Linking your Discord account to your Safewalk email")
            )
            .addTextDisplayComponents((textDisplay) => 
                textDisplay.setContent(instructions)
            )
            .addActionRowComponents((actionRow) => 
                actionRow.setComponents(
                    new ButtonBuilder().setCustomId("email").setLabel("Enter Email").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("code").setLabel("Enter Code").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("unlink").setLabel("Unlink Email").setStyle(ButtonStyle.Danger)
                )
            );

        if (interaction.channel.type === ChannelType.DM) {
            await interaction.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
            return;
        }
        await user.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
        await interaction.reply({
            content: "I have sent the menu in your DMs",
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