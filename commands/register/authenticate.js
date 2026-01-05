import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder().setName("authenticate").setDescription("Authenticates discord user by linking them to their Better Impact email")

export const execute = async (interaction) => {
    let userId
    if (interaction instanceof ChatInputCommandInteraction) {
        userId = interaction.user.id;
    } else {
        userId = interaction.author.id;
    }
    try {
        
    } catch (exception) {
        console.log(exception);
        await interaction.reply("Something went wrong. Please try again.");
    }
}