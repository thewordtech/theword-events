const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    // Get all featured events
    let url =
      "https://api.planningcenteronline.com/calendar/v2/events";

    let featuredEvents = [];

    while (url) {

      const response =
        await axios.get(url, { auth });

      featuredEvents = featuredEvents.concat(
        response.data.data.filter(
          event => event.attributes.featured === true
        )
      );

      url =
        response.data.links.next || null;

    }

    // Get future event instances
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

      const startDate =
        instance.attributes.starts_at;

      if (
        !eventMap[eventId] ||
        new Date(startDate) <
        new Date(eventMap[eventId].date)
      ) {

        eventMap[eventId] = {
          date: startDate,
          location: instance.attributes.location,
          url: instance.attributes.church_center_url
        };

      }

    });

    const events = featuredEvents

      .filter(event => eventMap[event.id])

      .map(event => ({

        id: event.id,

        title:
 
