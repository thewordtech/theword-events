const axios = require("axios");

module.exports = async (req, res) => {

  // Allow Squarespace to access this API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {

    const response = await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/events",
      {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      }
    );

    const events = response.data.data.map(event => ({
      id: event.id,
      title: event.attributes.name,
      description: event.attributes.description
    }));

    return res.status(200).json(events);

  } catch (error) {

    return res.status(500).json({
      error: error.message
    });

  }
};
