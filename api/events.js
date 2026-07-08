const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    // Get all events
    let url =
      "https://api.planningcenteronline.com/calendar/v2/events";

    let allEvents = [];

    while (url) {

      const response = await axios.get(url, {
        auth
      });

      allEvents = allEvents.concat(response.data.data);

      url = response.data.links.next || null;
    }

    // Get future instances
    const today =
      new Date().toISOString();

    const instanceResponse =
      await axios.get(
        `https://api.planningcenteronline.com/calendar/v2/event_instances?where[starts_at][gte]=${today}&per_page=100`,
        { auth }
      );

    const futureInstances =
      instanceResponse.data.data;

    const futureMap = {};

    futureInstances.forEach(instance => {

      const eventId =
        instance.relationships.event.data.id;

      const startsAt =
        instance.attributes.starts_at;

      if (
        !futureMap[eventId] ||
        new Date(startsAt) <
        new Date(futureMap[eventId].date)
      ) {

        futureMap[eventId] = {
          date: startsAt,
          location: instance.attributes.location,
          url: instance.attributes.church_center_url
        };
      }

    });

    const events = allEvents

      .filter(event =>
        event.attributes.featured === true
      )

      .filter(event =>
        futureMap[event.id]
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
          futureMap[event.id].date,

        location:
          futureMap[event.id].location,

        url:
          futureMap[event.id].url

      }))

      .sort(
        (a,b) =>
          new Date(a.date) -
          new Date(b.date)
      );

    res.status(200).json(events);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};
