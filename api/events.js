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
        event.relationships.tags?.data?.map(
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

