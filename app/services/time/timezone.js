export const getCurrentTimeZone = (date) => {
	return new Date(date.toLocaleString("en", {timeZone: process.env.time_zone}));
}