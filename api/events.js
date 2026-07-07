const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const response =*await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/events",
      {
        auth: *
          username: process.env.P*O_CLIENT_ID,
          password: p*ocess.env.PCO_SECRET
        }
   *  }
    );

    const events = res*onse.data.data
      .filter(event*=> event.attributes.visible_in_chu*ch_center)
      .map(event => ({
*       id: event.id,
        title* event.attributes.name,
        de*cription: event.attributes.descrip*ion
      }));

    res.status(200*.json(events);

  } catch (error) *

    res.status(500).json({
     *error: error.message
    });

  }
*};
