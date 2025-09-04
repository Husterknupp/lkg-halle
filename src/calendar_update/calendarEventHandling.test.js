const { updateGoogleCalendar } = require("./calendarEventHandling");

describe("Google Calendar Event Logic", () => {
  test("Gottesdienst event description and location", async () => {
    const event = {
      name: "Gottesdienst",
      dateTime: "2025-07-06T10:00:00",
      lengthInHours: 1.5,
      preaching: "J. Hensen",
      moderator: "M. Schwibs",
    };
    const googleClient = {
      events: {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
        insert: jest.fn().mockResolvedValue({
          data: { id: "123", htmlLink: "http://example.com" },
        }),
      },
    };
    process.env.GOOGLE_CALENDAR_ID = "test-calendar-id";

    await updateGoogleCalendar([event], googleClient);

    expect(googleClient.events.list).toHaveBeenCalled();
    expect(googleClient.events.insert).toHaveBeenCalledWith({
      calendarId: "test-calendar-id",
      resource: {
        summary: "Gottesdienst",
        description: "Predigt: J. Hensen • Moderation: M. Schwibs",
        location:
          "Landeskirchliche Gemeinschaft (LKG) Halle e.V., Ludwig-Stur-Straße 5, 06108 Halle (Saale)",
        start: {
          dateTime: "2025-07-06T10:00:00+02:00",
          timeZone: "Europe/Berlin",
        },
        end: {
          dateTime: "2025-07-06T11:30:00+02:00",
          timeZone: "Europe/Berlin",
        },
      },
    });
  });

  test("Bibelgespräch event description and location", async () => {
    const event = {
      name: "Bibelgespräch",
      dateTime: "2025-07-10T15:45:00",
      lengthInHours: 1.0,
      preaching: "M. Genz",
      moderator: "0",
    };
    const googleClient = {
      events: {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
        insert: jest.fn().mockResolvedValue({
          data: { id: "123", htmlLink: "http://example.com" },
        }),
      },
    };
    process.env.GOOGLE_CALENDAR_ID = "test-calendar-id";

    await updateGoogleCalendar([event], googleClient);

    expect(googleClient.events.list).toHaveBeenCalled();
    expect(googleClient.events.insert).toHaveBeenCalledWith({
      calendarId: "test-calendar-id",
      resource: {
        summary: "Bibelgespräch",
        description: "Leitung: M. Genz",
        location:
          "Landeskirchliche Gemeinschaft (LKG) Halle e.V., Ludwig-Stur-Straße 5, 06108 Halle (Saale)",
        start: {
          dateTime: "2025-07-10T15:45:00+02:00",
          timeZone: "Europe/Berlin",
        },
        end: {
          dateTime: "2025-07-10T16:45:00+02:00",
          timeZone: "Europe/Berlin",
        },
      },
    });
  });

  test("EC - Hauskreis event description and location", async () => {
    const event = {
      name: "EC - Hauskreis",
      dateTime: "2025-07-02T18:30:00",
      lengthInHours: 2.0,
      preaching: "Team",
      moderator: "0",
    };
    const googleClient = {
      events: {
        list: jest.fn().mockResolvedValue({ data: { items: [] } }),
        insert: jest.fn().mockResolvedValue({
          data: { id: "123", htmlLink: "http://example.com" },
        }),
      },
    };
    process.env.GOOGLE_CALENDAR_ID = "test-calendar-id";

    await updateGoogleCalendar([event], googleClient);

    expect(googleClient.events.list).toHaveBeenCalled();
    expect(googleClient.events.insert).toHaveBeenCalledWith({
      calendarId: "test-calendar-id",
      resource: {
        summary: "EC - Hauskreis",
        description: "",
        location:
          "Landeskirchliche Gemeinschaft (LKG) Halle e.V., Ludwig-Stur-Straße 5, 06108 Halle (Saale)",
        start: {
          dateTime: "2025-07-02T18:30:00+02:00",
          timeZone: "Europe/Berlin",
        },
        end: {
          dateTime: "2025-07-02T20:30:00+02:00",
          timeZone: "Europe/Berlin",
        },
      },
    });
  });

  test("Event with same name/summary doesn't get added again", async () => {
    const event = {
      name: "Stammtisch",
      dateTime: "2025-07-15T18:00:00",
      lengthInHours: 2.0,
      preaching: "Team",
      moderator: "0",
    };
    const googleClient = {
      events: {
        list: jest.fn().mockResolvedValue({
          data: {
            items: [
              {
                summary: "Stammtisch",
                start: { dateTime: "2025-07-15T18:00:00+02:00" },
                end: { dateTime: "2025-07-15T20:00:00+02:00" },
              },
            ],
          },
        }),
        insert: jest.fn(),
      },
    };
    process.env.GOOGLE_CALENDAR_ID = "test-calendar-id";

    await updateGoogleCalendar([event], googleClient);

    expect(googleClient.events.list).toHaveBeenCalledWith({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMax: "2025-07-15T20:00:00+02:00",
      timeMin: "2025-07-15T18:00:00+02:00",
      timezone: "Europe/Berlin",
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });
    expect(googleClient.events.insert).not.toHaveBeenCalled();
  });
});
