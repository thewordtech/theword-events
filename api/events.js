const axios = require("axios");

module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");

  try {

    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    // Featured Events
    let eventsUrl =
      "https://api.planningcenteronline.com/calendar/v2/events";

    let featuredEvents = [];

    while(eventsUrl){

      const response =
        await axios.get(eventsUrl,{auth});

      featuredEvents =
        featuredEvents.concat(

          response.data.data.filter(
            event => event.attributes.featured
          )

        );

      eventsUrl =
        response.data.links.next || null;

    }

    // Only newest future instances
    const instancesResponse =
      await axios.get(
        "https://api.planningcenteronline.com/calendar/v2/event_instances?order=-starts_at&per_page=100",
        { auth }
      );

    const instances =
      instancesResponse.data.data;

    const futureFeatured = [];

    featuredEvents.forEach(event => {

      const match =
        instances.find(instance =>

          instance.relationships &&
          instance.relationships.event &&
          instance.relationships.event.data &&
          instance.relationships.event.data.id === event.id

        );

      if(match){

        futureFeatured.push({

          id:
            event.id,

          title:
            event.attributes.name,

          summary:
            event.attributes.summary,

          image:
            event.attributes.image_url
              ? event.attributes.image_url.replace(/&amp;/g,"&")
              : null,

          date:
            match.attributes.starts_at,

          location:
            match.attributes.location,

          url:
            match.attributes.church_center_url

        });

      }

    });

    futureFeatured.sort(
      (a,b) =>
        new Date(a.date) -
        new Date(b.date)
    );

    res.status(200).json(
      futureFeatured
    );

  }
  catch(error){

    res.status(500).json({
      error:error.message
    });

  }

};
