const axios = require("axios");

module.exports = async (req, res) => {

  try {

    const response = await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/event_instances?order=-starts_at&per_page=20",
      {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      }
    );

    res.status(200).json(
      response.data.data.map(i => ({
        name: i.attributes.name,
        eventId: i.relationships.event.data.id,
        date: i.attributes.starts_at
      }))
    );

  } catch(error){

    res.status(500).json({
      error: error.message
    });

  }

};
