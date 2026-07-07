const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    let url =
      "https://api.planningcenteronline.com/calendar/v2/events?include=tags";

    let allEvents = [];
    let included = [];

    while (url) {

      const response = await axios.get(url, {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      });

      allEvents = allEvents.concat(response.data.data);

      if (response.data.included) {
        included = included.concat(response.data.included);
      }

      url = response.data.links.next || null;
    }

    const prophesy = allEvents.filter(event =>
      event.attributes.name.toLowerCase().includes("prophes")
    );

    res.status(200).json({
      event: prophesy,
      tags: included
    });

  } catch(error) {

    res.status(500).json({
      error: error.message
    });

  }

};
