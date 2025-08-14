# LKG Halle Church Event Management System

LKG Halle is a Node.js-based church event management system with automated calendar synchronization, website updates, and YouTube broadcast creation. The project consists of automation scripts in the root directory and an Astro-based website in the `/website/` subfolder. The website is work in progress. Eventually it's meant to serve the html for lkg-halle.de

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Dependencies

- Install Node.js dependencies:
  - Root project: `npm ci` -- takes 2 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
  - Website: `cd website && npm ci` -- takes 34 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
- Install Playwright browsers: `npx playwright install --with-deps` -- takes 5-10 minutes. NEVER CANCEL. Set timeout to 15+ minutes.
  - Required for CodeceptJS automation tests
  - May fail due to network issues, but functionality will work without browsers installed

### Environment Setup for Working With Scripts

- Create `.env` file in root directory with required secrets:
  ```
  GOOGLE_CALENDAR_ID=your_calendar_id
  SERVICE_ACCOUNT_EMAIL=your_service_account@email.com
  SERVICE_ACCOUNT_PRIVATE_KEY=your_private_key
  PASSWORD_WP_ADMIN=wordpress_admin_password
  USERNAME_WP_ADMIN=wordpress_admin_username
  WP_SLIDER_URL=https://lkg-halle.de/wp-admin/admin.php?page=your-slider-page
  ```
- Without `.env` file, scripts will fail with authentication errors

### Build and Development (Astro site)

- Build website: `cd website && npm run build` -- takes 1.4 seconds. Set timeout to 1+ minute.
- Run website dev server: `cd website && npm run dev` -- starts immediately, runs on localhost:4321
- Preview built website: `cd website && npm run preview`

## Main Functionality

## Website

The website lkg-halle.de is a simple church/NGO website. Main users of the page are people that are interested in the church. It should be easy for them to know when the next church service will happen, to get some more details if they want and to get the feeling that the site is being maintained.

The site is structured as follows. It has a landing page that shows

- a hero image
- the main areas of work in the church
- an address section
- and a footer with some meta info

There are three other pages that explain the different sections of the church. These hold detailed information of the events this church offers. In addition to that, there is a page that's meant for internal use where members find links and content that is useful for working in the church.

Last but not least, there are legal pages that try to be as easily readable as possible and hold only necessary, and not so much boilerplate content.

### Event Management Scripts

Run from root directory:

- **Create calendar entries**: `npm run create-calendar-entries <PATH_TO_CSV>`
  - Reads CSV files from `/input-csvs/` directory
  - Creates Google Calendar events for church planning
  - Requires Google API credentials in .env
- **Update website slider**: `npm run update-slider`
  - Automates WordPress admin login and content updates
  - Uses CodeceptJS with Playwright for browser automation
  - Requires WordPress credentials and WP_SLIDER_URL in .env
  - Runs headless by default (HEADLESS=true)

- **Create YouTube broadcasts**: `npm run create-youtube-broadcasts <PATH_TO_CSV>`
  - Creates YouTube live broadcasts from CSV planning data
  - Requires YouTube API credentials
- **Get next Sunday date**: `npm run get-next-sunday`
  - Utility script for date calculation
  - Used by other automation scripts

### CodeceptJS Testing

- Run website automation tests: `npm run codeceptjs`
- Run headless tests: `npm run codeceptjs:headless`
- Configuration: `src/website_update/codecept.conf.js`
- Tests target WordPress admin interface at lkg-halle.de

## Validation (Astro site in `website/` dir)

### Before Making Changes

- **Test website build**: `cd website && npm run build`
- **Test website dev server**: `cd website && npm run dev`

### After Making Changes

- **Manual validation scenarios**:
  1. **Website functionality**: Start dev server, verify pages load at localhost:4321
  2. **Build process**: Ensure `npm run build` completes without errors
  3. **Formatting**: run formatting fix before committing `npx prettier --write .`

## CI/CD Integration

- GitHub Actions automatically run on schedule (Sundays 18:00 UTC) and execute scripts
- Actions require all secrets configured in repository settings
- Dependabot updates dependencies monthly with grouped minor/patch updates

## Project Structure

### Root Directory Scripts

- `/src/calendar_update/` - Google Calendar API integration
- `/src/website_update/` - WordPress automation with CodeceptJS
- `/src/youtube_update/` - YouTube API integration
- `/src/csv-parser/` - CSV file processing utilities
- `/input-csvs/` - Event planning CSV files

### Website Directory

- `/website/src/pages/` - Astro page components
- `/website/src/layouts/` - Astro layout components
- `/website/public/` - Static assets
- `/website/dist/` - Built website output (generated)

## Environment Considerations

- **Node version**: Specified in .nvmrc as 24.5, works with 20.19.4+
- **Playwright browsers**: Required for automation, install with `npx playwright install --with-deps`
- **Google API**: Service account required for calendar access
- **WordPress credentials**: Admin access required for slider updates

## Troubleshooting Common Issues

### Build Failures

- **Prettier formatting**: Run `npx prettier --write .` to fix formatting issues
- **Missing dependencies**: Run `npm ci` in both root and website directories
- **Node version**: Use Node 20.19.4+ or install version from .nvmrc

### Runtime Errors

- **Authentication errors**: Verify all required environment variables in .env file
- **Playwright errors**: Install browsers with `npx playwright install --with-deps`
- **CodeceptJS failures**: Check WordPress credentials and target URL

### Performance Notes

- Website builds are very fast (1.4 seconds)
- Dependency installation takes 2-3 minutes total
- Playwright browser installation can take 5-10 minutes
- **NEVER CANCEL long-running operations** - they will complete successfully
