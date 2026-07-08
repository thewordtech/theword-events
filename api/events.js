const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    let url =
      "https://api.planningcenteronline.com/calendar/v2/events";

    let allEvents = [];

    while (url) {

      const response = await axios.get(url, {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      });

      allEvents = allEvents.concat(response.data.data);

      url = response.data.links.next || null;

    }

    const events = allEvents

      .filter(event =>
        event.attributes.featured === true
      )

      .sort((a, b) =>
        new Date(b.attributes.updated_at) -
        new Date(a.attributes.updated_at)
      )

      .slice(0, 15)

      .map(event => ({
        id: event.id,
        title: event.attributes.name,
        summary: event.attributes.summary,
        image: event.attributes.image_url
          ? event.attributes.image_url.replace(/&amp;/g, "&")
          : null,
        url: event.links.html
      }));

    res.status(200).json(events);

  } catch(error) {

    res.status(500).json({
      error: error.message
    });

  }

};
