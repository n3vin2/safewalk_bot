import { Client, Collection, GatewayIntentBits, MessageFlags, Partials } from 'discord.js';
import { fileURLToPath } from 'node:url';
import { getCurrentTimeZone } from '../services/time/timezone.js';
import fs from "node:fs";
import path from 'node:path';
import { prisma } from '../services/db.js';
import { buildPingComponent } from './embeds/shifts.js';
import { getShift, groupShiftByTime } from '../services/shifts.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.token;
// Create a new client instance
const client = new Client(
	{
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.DirectMessages,
			GatewayIntentBits.MessageContent
		],
		partials: [
			Partials.Channel,
			Partials.Message
		]
	}
);
client.config = {
	prefix: "sw!"
};
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
/* client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
}); */

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();

async function importCommands() {
	const foldersPath = path.join(__dirname, "commands");
	const commandFolders = fs.readdirSync(foldersPath);
	for (const folder of commandFolders) {
		const commandPath = path.join(foldersPath, folder);
		const commandFiles = fs.readdirSync(commandPath).filter((file) => file.endsWith(".js"));
		for (const file of commandFiles) {
			const filePath = path.join(commandPath, file);
			const command = await import(filePath);
			if ("data" in command && "execute" in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	}
}

async function importEvents() {
	const eventsPath = path.join(__dirname, 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = await import(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, client));
		} else {
			client.on(event.name, (...args) => event.execute(...args, client));
		}
	}
}

async function importButtons() {
	const foldersPath = path.join(__dirname, 'buttons');
	const buttonFolders = fs.readdirSync(foldersPath);
	for (const folder of buttonFolders) {
		const buttonsPath = path.join(foldersPath, folder);
		const buttonFiles = fs.readdirSync(buttonsPath).filter((file) => file.endsWith('.js'));
		for (const file of buttonFiles) {
			const filePath = path.join(buttonsPath, file);
			const button = await import(filePath);
			if ("customId" in button && "execute" in button) {
				client.buttons.set(button.customId, button);
			}
		}
	}
}

async function importModals() {
	const foldersPath = path.join(__dirname, 'modals');
	const modalFolders = fs.readdirSync(foldersPath);
	for (const folder of modalFolders) {
		const modalsPath = path.join(foldersPath, folder);
		const modalFiles = fs.readdirSync(modalsPath).filter((file) => file.endsWith('.js'));
		for (const file of modalFiles) {
			const filePath = path.join(modalsPath, file);
			const modal = await import(filePath);
			if ("customId" in modal && "execute" in modal) {
				client.modals.set(modal.customId, modal);
			}
		}
	}
}

export const discordSetup = async () => {
	// Log in to Discord with your client's token
	await client.login(token);

	await importCommands();
	await importEvents();
	await importButtons();
	await importModals();

	setInterval(async () => {
		const now = getCurrentTimeZone(new Date());
		if (now.getHours() < 12) {
			return;
		}

		const registered_channels = await prisma.channel.findMany();
		registered_channels.forEach(async (channel_entry) => {
			const guild = await client.guilds.fetch(channel_entry.guild_id);
			const roles = await guild.roles.fetch();
			const role = roles.find(r => r.name === "Patroller");
			const channel = await client.channels.fetch(channel_entry.channel_id);
			const shifts = await getShift();

			if (shifts.length === 0) {
				console.log("shift length is 0")
				return;
			}
			const pingComponent = await buildPingComponent(role.id, await groupShiftByTime(shifts));
			if (channel_entry.message_id === null) {
				const newMessage = await channel.send({ components: [pingComponent], flags: MessageFlags.IsComponentsV2 });
				await prisma.channel.update(
					{
						where: channel_entry,
						data: {
							...channel_entry,
							message_id: newMessage.id
						}
					}
				);
			} else {
				const message = await channel.messages.fetch(channel_entry.message_id);
				const postDate = getCurrentTimeZone(new Date(message.createdTimestamp));
				if (postDate.getDay() !== now.getDay()) {
					const newMessage = await channel.send({ components: [pingComponent], flags: MessageFlags.IsComponentsV2 });
					await prisma.channel.update(
						{
							where: channel_entry,
							data: {
								...channel_entry,
								message_id: newMessage.id
							}
						}
					);
				} else {
					const stat = await message.edit({ components: [pingComponent], flags: MessageFlags.IsComponentsV2 });
				}
			}
		});
	}, 1000 * 60 * 5);
}