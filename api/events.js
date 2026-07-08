const axios = require("axios");

module.exports = async (req, res) => {

  const auth = {
    username: process.env.PCO_CLIENT_ID,
    password: process.env.PCO_SECRET
  };

  try {

    let pageCount = 0;
    let instanceCount = 0;

    let url =
      "https://api.planningcenteronline.com/calendar/v2/event_instances";

    while(url){

      pageCount++;

      const response =
        await axios.get(url,{auth});

      instanceCount +=
        response.data.data.length;

      url =
        response.data.links.next || null;

    }

    res.status(200).json({
      pages: pageCount,
      instances: instanceCount
    });

  } catch(error){

    res.status(500).json({
      error:error.message
    });

  }

};
