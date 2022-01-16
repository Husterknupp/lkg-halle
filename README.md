# lkg-halle

Helper scripts

## Run Script

`$ USERNAME_WP_ADMIN=<USERNAME> PASSWORD_WP_ADMIN=<PASSWORD> npm run update-slider`

## Event Overwrite

Find manual event descriptions in the log output of the GitHub Action runs.

## Google Calendar

Calendar is source of truth because it's easiest to create/edit dates.

A service account needs access to a shared calendar in order to read events. Sharing through the calendar website didn't make the events visible to the service account for me. I added it programmatically via `google.calendar.calendarList.insert` (the service account email address).

## Codecept

Initialize Codecept with `npx codecept .` + `npx codecept init`

## GitHub Action

Slider gets updated via scheduled action.
