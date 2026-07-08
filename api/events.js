const axios = require("axios");

module.exports = async (req, res) => {

  try {

    const response = await axios.get(
      "https://api.planningcenteronline.com/calendar/v2/event_instances?order=-starts_at&per_page=100",
      {
        auth: {
          username: process.env.PCO_CLIENT_ID,
          password: process.env.PCO_SECRET
        }
      }
    );

    const futureEvents =
      response.data.data.filter(instance =>

        new Date(instance.attributes.starts_at)
        >
        new Date()

      );

    res.status(200).json({
      totalReturned:
        response.data.data.length,

      futureReturned:
        futureEvents.length,

      firstFuture:
        futureEvents[0]
    });

  } catch(error){

    res.status(500).json({
      error:error.message
    });

  }

};
