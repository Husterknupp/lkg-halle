const google = require("googleapis").google;

async function createAuthClient() {
  // const private_key = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
  const private_key =
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCe2rrryni9pJkN\nUF1x7OuHsHfvEEiqi2PuIE1d7DOTv2y3Y770zvRaGYJh8vbc08dzxbCtk74Uiqex\nc5bjoGd+BRaB9HFp5Yb7Go95uX0M4pGUPMTyql6/pBW58FxKlME8GjZR7NLDXzvW\nNRfs6NUKKW43ziAsibgrYyjUtwlE8X3ZI5XDfUR2HV4W84+NPhLd5Qc+MkcxS5Oo\nVYZFxgsixFC1IO3MDsB1HkRfpHjQpIExHo2JjY6TDSsOBqbaQivff9VeUWSCVKDr\nDsGUGDEtINmaafezwb1TOPWxsgDcN8fkaXebrs6Omhbiih93WCYl3av2bD0t0u8r\nGMAIKSmnAgMBAAECggEACm7NcZicbGwSfIwyJD4jS908SzrzuCEBIPhbIcIrswDn\n8sq+Farqjmj4JgGvJ9qlfJuCWoFbragGPRfH1E71F72IIw8lobGoN0v2b0/41Vn4\npgEwYsrrVRpsLjLfL4DB3iDPP3srw8FjQdK+gwSESq9k5I0I55PrQLeO93Ab+jyS\numUs4UsZaF3PBy2GhjzROnfbnHiqfZRp8m+RubKj1xQLwysvgg8OIJbZ2QOs2SB1\nQf7+xwkLo83+TsoZY7qhUMLzV82+PIjJw1Wqr+sBxphPTXjppGIAk3atXKTiFqk/\nrqlDtGyzlylMx6vMXGktfqsWv2VLBJsxC+Mevld6cQKBgQDdUYZzU1OosJ1JV4WS\nENjxRif2vZwhG3WI/jn4uqJBLS7OmuUPzE3ETbtR7PGDvetygpQaNf+FG29Mh9Gl\nAtyjJ274M3PDb8dA42JZXusDU4jiJCgup5TCeZxtHjyt0LCaDxHpHJcewbBkjUnT\nHXDK6AdYatw+ZuCePyzgaeuhFwKBgQC3v2ElL5TVgZB+Pcu5Zgf2TlkwAXKDpfH8\nBa6KlWC9rJemIgdJ5+3wTy2W/W2qIjfjuN1qNvJngnuxX8U9IW9JImU3XpDw2D5F\nw3KDuxFr43tI7dK8CMHQcd46Adz9RCuDmtv2AV+Dt1RDdY/+8GOH29BQcX/F4hrz\nJqe5gWF18QKBgGioF6tLeSEpO4emIpy66MvXgCh263Dgekko5yMOppGpmxvKNY2t\n8AxnMbCBGohQ9Bj3VK+8XzODkLMg+utMGifxCtHGCvUdU50EqcpXT00IYI+Hx5Sg\nXIFGXsle5hTPveNsQuz4PyIlN5OlGIcDwgXBiU+vYK0FmyxZ9Y+9ptZLAoGAQQve\nt+tAJNTY8deuZtNXvjm+GOBqSXBVWYIpZ6W5uWt/w7AIJIGWGZvt56WPTMsQPe0T\ndKY+6aWnZAMjL6DGZH1ol1FCvf/PC6NExp1SbX76BbcrAqWW9tNYd/Bw6rdXMB+B\n/nQ9+8LKcZcMgpNWqKGH/PIw6TxBjhIBDgpfFgECgYAcQQ6FVBjce3SWx71PDVZO\nNwtMz2+exytUB/fufAehA3gDb7eMsXE+ToSauonIhd5e95/t20Gohd/4ydfpjx+N\nlruaLFrPEi5IiW3F/OkIxSeBeuCbS3nCg9qpZR3GQ9TB/vBRFAklO/xEw5mqC73u\nc4QRMOuQ+5hulcFwxXqhyg==\n-----END PRIVATE KEY-----\n";
  // const client_email = process.env.SERVICE_ACCOUNT_EMAIL;
  const client_email =
    "lkg-halle-scripts@calendar-2021-04-25.iam.gserviceaccount.com";

  const jwtClient = new google.auth.JWT(client_email, null, private_key, [
    // 'https://www.googleapis.com/auth/calendar.readonly' , // lists the explicit invites with only that

    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.events.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
  ]);

  await jwtClient.authorize(function (err) {
    if (err) {
      throw err;
    }
  });

  return jwtClient;
}

async function getEvents() {
  const auth = await createAuthClient();

  const calendar = google.calendar("v3");
  try {
    const response = await calendar.events.list({
      // calendarId: process.env.GOOGLE_CALENDAR_ID,
      // calendarId: "technik@lkg-halle.de",
      calendarId:
        "jl41h96fmbdc9vs6iu3t3rg1sc@group.calendar.google.com",
      auth,
    });
    console.log(`found ${(response.data.items || []).length} items`);
    return response.data.items;
  } catch (err) {
    console.error("The API returned an error: " + err);
    throw err;
  }
}

module.exports = { getEvents };
