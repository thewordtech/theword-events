const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const response = await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/events?per_page=100",
      {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      }
    );

    const events = response.data.data
      .filter(event =>
        event.attributes.name.toLowerCase().includes("prophesy")
      );

    res.status(200).json(events);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};
