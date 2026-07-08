const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    // Get all featured events
    let eventsUrl =
      "https://api.planningcenteronline.com/calendar/v2/events";

    let featuredEvents = [];

    while (eventsUrl) {

      const response =
        await axios.get(eventsUrl, { auth });

      featuredEvents =
        featuredEvents.concat(

          response.data.data.filter(
            event => event.attributes.featured === true
          )

        );

      eventsUrl =
        response.data.links.next || null;

    }

    // Build lookup
    const
