async function getEvents() {
  const calendar = await createCalendarClient();

  const response = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    timeMin: new Date().toISOString(),
  });

  console.log(`found ${(response.data.items || []).length} items`);
  return response.data.items;
}

module.exports = { getEvents };
