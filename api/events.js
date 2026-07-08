const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Cache-Control",
    "s-maxage=900, stale-while-revalidate=3600"
  );

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    let eventsUrl =
      "https://api.planningcenteronline.com/calendar/v2/events?where[featured]=true&include=tags";

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

    const featuredMap = {};

    featuredEvents.forEach(event => {

      const tagIds =
        event.relationships?.tags?.data?.map(
          tag => tag.id
        ) || [];

      const campuses = [];

      if (tagIds.includes("245632")) {
        campuses.push("Lakeside");
      }

      if (tagIds.includes("245633")) {
        campuses.push("Springtown");
      }

      if (tagIds.includes("343409")) {
        campuses.push("Aledo");
      }

      featuredMap[event.id] = {

        id: event.id,

        title:
          event.attributes.name,

        campuses,

        image:
          event.attributes.image_url
            ? event.attributes.image_url.replace(/&amp;/g, "&")
            : null,

        date: null,

        endDate: null,

        sessions: [],

        location: null,

        url: null

      };

    });

    const today =
      new Date().toISOString();

    let instancesUrl =
      `https://api.planningcenteronline.com/calendar/v2/event_instances?where[starts_at][gte]=${today}&per_page=100`;

    while (instancesUrl) {

      const response =
        await axios.get(
          instancesUrl,
          { auth }
        );

      response.data.data.forEach(instance => {

        const eventId =
          instance.relationships.event.data.id;

        const event =
          featuredMap[eventId];

        if (!event) return;

        if (
          event.sessions.length < 10
        ) {

          event.sessions.push({

            start:
              instance.attributes.starts_at,

            end:
              instance.attributes.ends_at

          });

        }

        if (!event.date) {

          event.date =
            instance.attributes.starts_at;

          event.endDate =
            instance.attributes.ends_at;

          event.location =
            instance.attributes.location;

          event.url =
            instance.attributes.church_center_url;

        }

      });

      instancesUrl =
        response.data.links.next || null;

    }

    Object.values(featuredMap)
      .forEach(event => {

        event.sessions.sort(
          (a, b) =>
            new Date(a.start) -
            new Date(b.start)
        );

      });

    const events =
      Object.values(featuredMap)

        .filter(event => event.date)

        .sort(
          (a, b) =>
            new Date(a.date) -
            new Date(b.date)
        )

        .slice(0, 12);

    res.status(200).json(events);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};
