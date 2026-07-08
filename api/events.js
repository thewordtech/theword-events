const axios = require("axios");

module.exports = async (req, res) => {

  try {

    let url =
      "https://api.planningcenteronline.com/calendar/v2/events";

    let featuredCount = 0;
    let totalCount = 0;

    while(url){

      const response = await axios.get(url,{
        auth:{
          username:process.env.PCO_CLIENT_ID,
          password:process.env.PCO_SECRET
        }
      });

      totalCount += response.data.data.length;

      featuredCount += response.data.data.filter(
        e => e.attributes.featured === true
      ).length;

      url = response.data.links.next || null;
    }

    res.status(200).json({
      totalCount,
      featuredCount
    });

  } catch(error){

    res.status(500).json({
      error:error.message
    });

  }

};
