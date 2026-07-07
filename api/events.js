const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const response = await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/event_instances?order=starts_at",
      {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      }
    );

    const now = new Date();

    const events = response.data.data
      .filter(event =>
        new Date(event.attributes.starts_at) >= now
      )
      .map(event => ({

        id: event.id,

        title: event.attributes.name,

        date: event.attributes.starts_at,

        location: event.attributes.location,

        url: event.attributes.church_center_url

      }))
      .slice(0, 25);

    res.status(200).json(events);

  } catch(error) {

    res.status(500).json({
      error: error.message
    });

  }

};
