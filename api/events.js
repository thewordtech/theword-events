const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const response = await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/event_instances?per_page=100",
      {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      }
    );

    const matches = response.data.data.filter(item =>
      item.attributes.name.toLowerCase().includes("prophes")
    );

    res.status(200).json(matches);

  } catch(error) {

    res.status(500).json({
      error: error.message
    });

  }

};
