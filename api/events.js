const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

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

    res.status(200).json(response.data.data[0]);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};
