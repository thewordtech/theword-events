const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    // Get featured events
    let url =
      "https://api.planningcenteronline.com/calendar/v2/events";

    let featuredEvents = [];

    while (url) {

      const response = await axios.get(url, { auth });

      featuredEvents = featuredEvents.concat(
        response.data.data.filter(
          event => event.attributes.featured === true
        )
      );

      url = response.data.links.next || null;
    }

    // Future instances only
    const today =
      new Date().toISOString();

    const instanceResponse =
      await axios.get(
        `https://api.planningcenteronline.com/calendar/v2/event_instances?where[starts_at][gte]=${today}&per_page=100`,
        { auth }
      );

    const futureInstances =
      instanceResponse.data.data;

    const eventMap = {};

    futureInstances.forEach(instance => {

      const eventId =
        instance.relationships.event.data.id;

      if (
        !eventMap[eventId] ||
        new Date(instance.attributes.starts_at) <
        new Date(eventMap[eventId].date)
      ) {

        eventMap[eventId] = {
          date: instance.attributes.starts_at,
          location: instance.attributes.location,
          url: instance.attributes.church_center_url
        };

      }

    });

    const events = featuredEvents

      .filter(event =>
        eventMap[event.id]
      )

      .map(event => ({

        id: event.id,

        title:
          event.attributes.name,

        summary:
          event.attributes.summary,

        image:
          event.attributes.image_url
            ? event.attributes.image_url.replace(/&amp;/g, "&")
            : null,

        date:
          eventMap[event.id].date,

        location:
          eventMap[event.id].location,

        url:
          eventMap[event.id].url

      }))

      .sort((a,b) =>
        new Date(a.date) -
        new Date(b.date)
      );

    res.status(200).json(events);

  } catch(error){

    res.status(500).json({
      error:error.message
    });

  }

};
