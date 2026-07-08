const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    // Featured events
    let url =
      "https://api.planningcenteronline.com/calendar/v2/events";

    let allEvents = [];

    while(url){

      const response =
        await axios.get(url,{ auth });

      allEvents =
        allEvents.concat(response.data.data);

      url =
        response.data.links.next || null;

    }

    // Future instances only
    const instancesResponse =
      await axios.get(
        "https://api.planningcenteronline.com/calendar/v2/event_instances?order=-starts_at&per_page=500",
        { auth }
      );

    const futureEventIds =
      new Set(
        instancesResponse.data.data.map(
          i => i.relationships.event.data.id
        )
      );

    const events =
      allEvents

      .filter(event =>
        event.attributes.featured === true
      )

      .filter(event =>
        futureEventIds.has(event.id)
      )

      .map(event => ({
        id: event.id,
        title: event.attributes.name,
        summary: event.attributes.summary,
        image: event.attributes.image_url
          ? event.attributes.image_url.replace(/&amp;/g,"&")
          : null,
        url: event.links.html
      }));

    res.status(200).json(events);

  } catch(error){

    res.status(500).json({
      error:error.message
    });

  }

};
