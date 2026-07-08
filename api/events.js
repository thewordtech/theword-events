const axios = require("axios");

module.exports = async (req, res) => {

  try {

    const response = await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/event_instances?where[starts_at][gte]=2026-07-07T00:00:00Z&per_page=25",
      {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      }
    );

    res.status(200).json({
      count: response.data.data.length,
      first: response.data.data[0]
    });

  } catch(error){

    res.status(500).json({
      error:error.message
    });

  }

};
