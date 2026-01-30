import { Events, MessageFlags } from "discord.js";

export const name = Events.InteractionCreate;
export const once = false;
export const execute = async function(interaction) {
	if (interaction.isModalSubmit()) {
		const modal = interaction.client.modals.get(interaction.customId);
		if (!modal) {
			console.error(`No modal matching the ID ${interaction.customId} was found.`)
			return;
		}
		await modal.execute(interaction);
	} else if (interaction.isButton()) {
		const button = interaction.client.buttons.get(interaction.customId);
		if (!button) {
			console.error(`No button matching the ID ${interaction.customId} was found.`)
			return;
		}
		await button.execute(interaction);
	} else if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'There was an error while executing this command!',
					flags: MessageFlags.Ephemeral,
				});
			}
		}	
	}
};