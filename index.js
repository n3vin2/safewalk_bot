import { Client, Collection, Events, GatewayIntentBits, MessageFlags, Partials } from 'discord.js';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
import fs from "node:fs";
import path from 'node:path';
import { channel } from 'node:diagnostics_channel';

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shiftTimes = ["7PM:", "8PM:", "9PM:"];
const shiftTypes = ["Patroller", "Study", "Trainee", "Trainer"];
const shiftTypesAbbreviated = ["P", "S", "Te", "Tr"];
const shiftSpacings = [4, 5, 6, 6];
const headerShiftSpacings = [14, 10, 9, 8];

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

function getMiddlePart(schedule) {
	let legend = "";
	let header = "";
	let i = 0;
	schedule.Available_Shifts.forEach((shift, index) => {
		if (shift) {
			legend += `${shiftTypesAbbreviated[index]} = ${shiftTypes[index]}\n`;
			header += `${" ".repeat(headerShiftSpacings[i])}${shiftTypesAbbreviated[index]}`;
			i++;
		}
	});
	return legend + "\n" + header;
}

function getMessage(schedule, roleId) {
	const today = new Date();

	const firstPart =  `
Hi <@&${roleId}>, happy ${days[today.getDay()]}!\n
Dispatcher: ${schedule.Dispatchers.join(", ")}\n
🟩 = Vacant
🟨 = Partially Filled
🟥 = Filled\n
${getMiddlePart(schedule)}
`;
	/*               P          S         Te        Tr */
	let secondPart = ""
	for (let i = 0; i < shiftTimes.length; i++) {
		secondPart += `${shiftTimes[i]}`;
		const volunteers = schedule.Volunteers[i];

		let first = true;
		volunteers.forEach((expression, index) => {
			if (schedule.Available_Shifts[index]) {
				if (first) {
					secondPart += " ".repeat(shiftSpacings[0]) + getColor(expression);
					first = !first;
				} else {
					secondPart += " ".repeat(shiftSpacings[index]) + getColor(expression);
				}
			}
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
			if (schedule.Active) {
				const rawData = await readFile("registered_channels.json", "utf-8");
				const data = JSON.parse(rawData);
				data.forEach(async (guildObject) => {
					const guild = await client.guilds.fetch(guildObject.guildId);
					const roles = await guild.roles.fetch();
					const role = roles.find(r => r.name === "Patroller");
					guildObject.channels.forEach(async (channelObject) => {
						const channel = await client.channels.fetch(channelObject.channelId)
						if (channelObject.messageId === null) {
							const newMessage = await channel.send(getMessage(schedule, role.id));
							const newMessageId = newMessage.id;
							channelObject.messageId = newMessageId;
							await writeFile("registered_channels.json", JSON.stringify(data));
						} else {
							const message = await channel.messages.fetch(channelObject.messageId);
							const postDate = new Date(message.createdTimestamp);
							if (postDate.getDay() !== now.getDay()) {
								const newMessage = await channel.send(getMessage(schedule, role.id));
								const newMessageId = newMessage.id;
								channelObject.messageId = newMessageId;
								await writeFile("registered_channels.json", JSON.stringify(data));
							} else {
								message.edit(getMessage(schedule, role.id));
							}
						}
					});
				});
			}
		}
	}, 1000 * 60 * 5);
}

clientSetup();
