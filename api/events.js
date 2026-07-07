const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    let url =
      "https://api.planningcenteronline.com/calendar/v2/events?include=tags";

    let allEvents = [];

    while(url){

      const response = await axios.get(url, {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      });

      allEvents = allEvents.concat(response.data.data);

      url = response.data.links.next || null;
    }

    res.status(200).json(
      allEvents.map(event => ({
        title: event.attributes.name,
        updated: event.attributes.updated_at
      }))
    );

  } catch(error) {

    res.status(500).json({
      error: error.message
    });

  }

};
