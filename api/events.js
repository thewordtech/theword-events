const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    // Load all events
    let eventsUrl =
      "https://api.planningcenteronline.com/calendar/v2/events";

    let allEvents = [];

    while(eventsUrl){

      const response =
        await axios.get(eventsUrl,{auth});

      allEvents =
        allEvents.concat(response.data.data);

      eventsUrl =
        response.data.links.next || null;

    }

    // Load event instances
    let instancesUrl =
      "https://api.planningcenteronline.com/calendar/v2/event_instances";

    let allInstances = [];

    while(instancesUrl){

      const response =
        await axios.get(instancesUrl,{auth});

      allInstances =
        allInstances.concat(response.data.data);

      instancesUrl =
        response.data.links.next || null;

    }

    const now = new Date();

    const futureFeaturedEvents =
      allEvents

      .filter(event =>
        event.attributes.featured === true
      )

      .map(event => {

        const futureInstances =
          allInstances.filter(instance => {

            return (
              instance.relationships.event &&
              instance.relationships.event.data &&
              instance.relationships.event.data.id === event.id &&
              new Date(
                instance.attributes.starts_at
              ) > now
            );

          });

        if(!futureInstances.length)
          return null;

        futureInstances.sort(
          (a,b) =>
            new Date(a.attributes.starts_at) -
            new Date(b.attributes.starts_at)
        );

        const nextDate =
          futureInstances[0];

        return {

          id:
            event.id,

          title:
 
