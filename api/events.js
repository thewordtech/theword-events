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

    while (eventsUrl) {

      const response =
        await axios.get(eventsUrl,{auth});

      allEvents =
        allEvents.concat(response.data.data);

      eventsUrl =
        response.data.links.next || null;

    }

    // Load all event instances
    let instanceUrl =
      "https://api.planningcenteronline.com/calendar/v2/event_instances";

    let allInstances = [];

    while (instanceUrl) {

      const response =
        await axios.get(instanceUrl,{auth});

      allInstances =
        allInstances.concat(response.data.data);

      instanceUrl =
        response.data.links.next || null;

    }

    const now = new 
