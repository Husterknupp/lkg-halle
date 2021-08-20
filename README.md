# lkg-halle

Helper scripts

## Run Script

`$ USERNAME_WP_ADMIN=<USERNAME> PASSWORD_WP_ADMIN=<PASSWORD> npm run update-slider`

## Event Overwrite

_Feature not implemented yet_

If `overwrite.txt` contains a title and a description the script will always ignore the calendar data in favor of this checked in content.

Useful if the banner should contain multiple events at once or in the Ostermontag case.

## Google Calendar

Calendar is source of truth because it's easiest to create/edit dates.

A service accounts needs access to a shared calendar in order to read events. Sharing through the calendar website didn't work for me. I added it via `google.calendar.calendarList.insert` programmatically (the service account email address).

## Codecept

Initialize Codecept with `npx codecept .` + `npx codecept init`

## GitHub Action

Slider gets updated via scheduled action.
