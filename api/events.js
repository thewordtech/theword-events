const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    // Get featured events only
    let eventsUrl =
      "https://api.planningcenteronline.com/calendar/v2/events?where[featured]=true";

    let featuredEvents = [];

    while (eventsUrl) {

      const response =
        await axios.get(eventsUrl, { auth });

      featuredEvents =
        featuredEvents.concat(
          response.data.data
        );

      eventsUrl =
        response.data.links.next || null;

    }

    // Build lookup
    const featuredMap = {};

    featuredEvents.forEach(event => {

      featuredMap[event.id] = {

        id: event.id,

        title:
          event.attributes.name,

        image:
          event.attributes.image_url
            ? event.attributes.image_url.replace(/&amp;/g, "&")
            : null,

        date: null,
        location: null,
        url: null

      };

    });

    const today =
      new Date().toISOString();

    let instancesUrl =
      `https://api.planningcenteronline.com/calendar/v2/event_instances?where[starts_at][gte]=${today}&per_page=100`;

    let foundCount = 0;

    while (
      instancesUrl &&
      foundCount < 20
    ) {

      const response =
        await axios.get(instancesUrl, { auth });

      response.data.data.forEach(instance => {

        const eventId =
          instance.relationships.event.data.id;

        if (
          featuredMap[eventId] &&
          !featuredMap[eventId].date
        ) {

          featuredMap[eventId].date =
            instance.attributes.starts_at;

          featuredMap[eventId].location =
            instance.attributes.location;

          featuredMap[eventId].url =
            instance.attributes.church_center_url;

          foundCount++;

        }

      });

      instancesUrl =
        response.data.links.next || null;

    }

    const events =
      Object.values(featuredMap)

        .filter(event => event.date)

        .sort(
          (a, b) =>
            new Date(a.date) -
            new Date(b.date)
        )

        .slice(0, 20);

    res.status(200).json(events);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};
