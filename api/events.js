const axios = require("axios");

module.exports = async (req, res) => {

  try {

    const response = await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/events?where[featured]=true&per_page=1",
      {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      }
    );

    res.status(200).json(
      response.data.data[0]
    );

  } catch(error){

    res.status(500).json({
      error: error.message
    });

  }

};
