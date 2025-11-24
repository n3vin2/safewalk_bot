import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import fs from "node:fs";
import path from 'node:path';
import { channel } from 'node:diagnostics_channel';

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shiftTimes = ["7PM:", "8PM:", "9PM:"];
const spacings = [4, 5, 6, 6]

let currentDay = new Date();

//const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.token;
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
/* client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
}); */

client.commands = new Collection();

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
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}
	const command = interaction.client.commands.get(interaction.commandName);
	const channel = await client.channels.fetch(interaction.channelId);

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
});

function getColor(expression) {
	const val = eval(expression);
	if (val == 0) {
		return "🟩";
	} else if (val > 0 && val < 1) {
		return "🟨";
	} else {
		return "🟥";
	}
}

function getMessage(schedule) {
	const today = new Date();

	const firstPart =  `
Hi @Patroller, happy ${days[today.getDay()]}!\n
Dispatcher: ${schedule.Dispatchers.join(", ")}\n
🟩 = Vacant
🟨 = Partially Filled
🟥 = Filled\n
P = Patroller
S = Study
Te = Trainee 
Tr = Trainer\n
              P          S         Te        Tr
`;
	let secondPart = ""
	for (let i = 0; i < shiftTimes.length; i++) {
		secondPart += `${shiftTimes[i]}`;
		const volunteers = schedule.Volunteers[i];
		volunteers.forEach((expression, j) => {
			secondPart += " ".repeat(spacings[j]) + getColor(expression);
		});
		secondPart += "\n\n";
	}
	return firstPart + secondPart;
}

async function clientSetup() {
	// Log in to Discord with your client's token
	await client.login(token);

	await importCommands();
	await importEvents();

	setInterval(async () => {
		const now = new Date();
		if (now.getHours() >= 12) {
			const database = await readFile("volunteer_schedule.json", "utf-8");
			const schedule = JSON.parse(database);
			if (schedule !== null) {
				const rawData = await readFile("registered_channels.json", "utf-8");
				const data = JSON.parse(rawData);
				Object.keys(data).forEach(async (guildId) => {
					console.log(data, guildId);
					Object.keys(data[guildId]).forEach(async (channelId) => {
							const channel = await client.channels.fetch(channelId);
							const messageId = data[guildId][channelId]

							if (now.getDay() !== currentDay.getDay() || messageId === null) {
								const newMessage = await channel.send(getMessage(schedule));
								const newMessageId = newMessage.id;
								data[guildId][channelId] = newMessageId;
								await writeFile("registered_channels.json", JSON.stringify(data));
							} else {
								const message = await channel.messages.fetch(messageId);
								message.edit(getMessage(schedule));
							}
						}
					)
				});
			}
		}
	}, 3000 * 60 * 5);
}

clientSetup();
