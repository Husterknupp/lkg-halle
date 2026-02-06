const { getNextSunday } = require("./get_next_sunday");

// Mock the google-calendar module
jest.mock("../google-calendar", () => ({
  createCalendarClient: jest.fn(),
}));

const { createCalendarClient } = require("../google-calendar");

// Store original Date constructor
const RealDate = Date;

describe("getNextSunday", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log to avoid cluttering test output
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    jest.restoreAllMocks();
  });

  test("should select Gottesdienst event when multiple events exist on the same Sunday", async () => {
    // Setup: Mock Google Calendar API response with multiple events
    const mockCalendarClient = {
      events: {
        list: jest.fn().mockResolvedValue({
          data: {
            items: [
              {
                summary: "Mitarbeitergemeinschaft",
                start: {
                  dateTime: "2026-02-08T13:00:00+01:00",
                },
              },
              {
                summary: "Gottesdienst (anschließend gemeinsames Mittagessen)",
                start: {
                  dateTime: "2026-02-08T10:00:00+01:00",
                },
              },
              {
                summary: "Gottesdienst Ukrainische Gemeinde",
                start: {
                  dateTime: "2026-02-08T13:00:00+01:00",
                },
              },
            ],
          },
        }),
      },
    };

    createCalendarClient.mockResolvedValue(mockCalendarClient);

    // Mock process.env
    const originalEnv = process.env.GOOGLE_CALENDAR_ID;
    process.env.GOOGLE_CALENDAR_ID = "test-calendar-id";

    // Mock date to be Feb 6, 2026 (Friday) so next Sunday is Feb 8, 2026
    const mockDate = new RealDate("2026-02-06T12:00:00Z");
    jest.spyOn(global, "Date").mockImplementation((...args) => {
      if (args.length === 0) {
        return mockDate;
      }
      return new RealDate(...args);
    });

    try {
      const [title, description] = await getNextSunday();

      // Assertions
      expect(mockCalendarClient.events.list).toHaveBeenCalledWith({
        calendarId: "test-calendar-id",
        timeMin: expect.any(String),
      });

      // Should select the Gottesdienst event at 10:00, not the Mitarbeitergemeinschaft at 13:00
      expect(title).toContain("Gottesdienst");
      expect(title).toContain("10");
      expect(description).toContain("8. Februar");
    } finally {
      process.env.GOOGLE_CALENDAR_ID = originalEnv;
    }
  });

  test("should handle full-day events by ignoring them", async () => {
    const mockCalendarClient = {
      events: {
        list: jest.fn().mockResolvedValue({
          data: {
            items: [
              {
                summary: "Some Full Day Event",
                start: {
                  date: "2026-02-08",
                },
              },
              {
                summary: "Gottesdienst",
                start: {
                  dateTime: "2026-02-08T10:00:00+01:00",
                },
              },
            ],
          },
        }),
      },
    };

    createCalendarClient.mockResolvedValue(mockCalendarClient);

    const originalEnv = process.env.GOOGLE_CALENDAR_ID;
    process.env.GOOGLE_CALENDAR_ID = "test-calendar-id";

    const mockDate = new RealDate("2026-02-06T12:00:00Z");
    jest.spyOn(global, "Date").mockImplementation((...args) => {
      if (args.length === 0) {
        return mockDate;
      }
      return new RealDate(...args);
    });

    try {
      const [title] = await getNextSunday();
      expect(title).toContain("Gottesdienst");
    } finally {
      process.env.GOOGLE_CALENDAR_ID = originalEnv;
    }
  });

  test("should throw error when no events found for the target date", async () => {
    const mockCalendarClient = {
      events: {
        list: jest.fn().mockResolvedValue({
          data: {
            items: [
              {
                summary: "Some Other Event",
                start: {
                  dateTime: "2026-02-15T10:00:00+01:00",
                },
              },
            ],
          },
        }),
      },
    };

    createCalendarClient.mockResolvedValue(mockCalendarClient);

    const originalEnv = process.env.GOOGLE_CALENDAR_ID;
    process.env.GOOGLE_CALENDAR_ID = "test-calendar-id";

    const mockDate = new RealDate("2026-02-06T12:00:00Z");
    jest.spyOn(global, "Date").mockImplementation((...args) => {
      if (args.length === 0) {
        return mockDate;
      }
      return new RealDate(...args);
    });

    try {
      await expect(getNextSunday()).rejects.toThrow(
        "Found no church service in calendar for date 2026-02-08",
      );
    } finally {
      process.env.GOOGLE_CALENDAR_ID = originalEnv;
    }
  });

  test("should fall back to first event if no Gottesdienst event found", async () => {
    const mockCalendarClient = {
      events: {
        list: jest.fn().mockResolvedValue({
          data: {
            items: [
              {
                summary: "Mitarbeitergemeinschaft",
                start: {
                  dateTime: "2026-02-08T13:00:00+01:00",
                },
              },
              {
                summary: "Other Event",
                start: {
                  dateTime: "2026-02-08T15:00:00+01:00",
                },
              },
            ],
          },
        }),
      },
    };

    createCalendarClient.mockResolvedValue(mockCalendarClient);

    const originalEnv = process.env.GOOGLE_CALENDAR_ID;
    process.env.GOOGLE_CALENDAR_ID = "test-calendar-id";

    const mockDate = new RealDate("2026-02-06T12:00:00Z");
    jest.spyOn(global, "Date").mockImplementation((...args) => {
      if (args.length === 0) {
        return mockDate;
      }
      return new RealDate(...args);
    });

    try {
      const [title] = await getNextSunday();

      // Should select Mitarbeitergemeinschaft as it's the first event, since no Gottesdienst exists
      // The time should be 13 (from the 13:00 start time of Mitarbeitergemeinschaft)
      expect(title).toContain("13");
    } finally {
      process.env.GOOGLE_CALENDAR_ID = originalEnv;
    }
  });
});







