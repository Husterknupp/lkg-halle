# lkg-halle

Helper scripts

## Create Shared Calendar Entries

`$ npm run create-calendar-entries <PATH_TO_.CSV>`

Calendar entries will be used for website slider update.

## Create YouTube Broadcasts

`$ npm run create-youtube-broadcasts <PATH_TO_.CSV>`

## Update Slider on lkg-halle.de

`$ USERNAME_WP_ADMIN=<USERNAME> PASSWORD_WP_ADMIN=<PASSWORD> npm run update-slider`

Initialize Codecept with `npx codecept .` + `npx codecept init`

Slider automatically gets updated via GitHub action.

Google Calendar is source of truth because it's easiest to create/edit dates.

A service account needs access to a shared calendar in order to read events. Sharing through the calendar website didn't make the events visible to the service account for me. I added it programmatically via `google.calendar.calendarList.insert` (the service account email address).
