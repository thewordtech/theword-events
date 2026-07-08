const axios = require("axios");

module.exports = async (req, res) => {

  const auth = {
    username: process.env.PCO_CLIENT_ID,
    password: process.env.PCO_SECRET
  };

  try {

    const response = await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/events",
      { auth }
    );

    const featured = response.data.data
      .filter(e => e.attributes.featured);

    res.status(200).json(
      featured.slice(0, 5).map(e => ({
        id: e.id,
        title: e.attributes.name
      }))
    );

  } catch(error){

    res.status(500).json({
      error: error.message
    });

  }

};
``
