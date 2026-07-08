const axios = require("axios");

module.exports = async (req, res) => {

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    const today = new Date().toISOString();

    const response = await axios.get(
      `https://api.planningcenteronline.com/calendar/v2/event_instances?where[starts_at][gte]=${today}&per_page=1&include=*`,
      { auth }
    );

    res.status(200).json(response.data);

  } catch(error){

    res.status(500).json({
      error: error.message
    });

  }

};
``
