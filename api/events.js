const axios = require("axios");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Cache-Control",
    "s-maxage=1800, stale-while-revalidate=3600"
  );

  try {
    const auth = {
      username: process.env.PCO_CLIENT_ID,
      password: process.env.PCO_SECRET
    };

    // Fetch featured events (sparse fieldset — only what we use)
    let eventsUrl =
      "https://api.planningcenteronline.com/calendar/v2/events?where[featured]=true&include=tags&fields[Event]=name,image_url";
    let featuredEvents = [];
    while (eventsUrl) {
      const response = await axios.get(eventsUrl, { auth });
      featuredEvents = featuredEvents.concat(response.data.data);
      eventsUrl = response.data.links.next || null;
    }

    const featuredMap = {};
    featuredEvents.forEach(event => {
      const tagIds =
        event.relationships?.tags?.data?.map(tag => tag.id) || [];
      const campuses = [];
      if (tagIds.includes("245632")) campuses.push("Lakeside");
      if (tagIds.includes("245633")) campuses.push("Springtown");
      if (tagIds.includes("343409")) campuses.push("Aledo");

      featuredMap[event.id] = {
        id: event.id,
        title: event.attributes.name,
        campuses,
        image: event.attributes.image_url
          ? event.attributes.image_url.replace(/&amp;/g, "&")
          : null,
        date: null,
        endDate: null,
        sessions: [],
        location: null,
        url: null
      };
    });

    // Fetch event instances — first page, then remaining pages in parallel
    const today = new Date().toISOString();
    const perPage = 100;
    const baseInstancesUrl =
      `https://api.planningcenteronline.com/calendar/v2/event_instances?where[starts_at][gte]=${today}&per_page=${perPage}&fields[EventInstance]=starts_at,ends_at,location,church_center_url`;

    const first = await axios.get(baseInstancesUrl, { auth });
    let allInstances = [...first.data.data];
    const totalCount = first.data.meta?.total_count || allInstances.length;
    const totalPages = Math.ceil(totalCount / perPage);

    if (totalPages > 1) {
      const pagePromises = [];
      for (let i = 2; i <= totalPages; i++) {
        pagePromises.push(
          axios.get(`${baseInstancesUrl}&offset=${(i - 1) * perPage}`, { auth })
        );
      }
      const results = await Promise.all(pagePromises);
      results.forEach(r => {
        allInstances = allInstances.concat(r.data.data);
      });
    }

    allInstances.forEach(instance => {
      const eventId = instance.relationships.event.data.id;
      const event = featuredMap[eventId];
      if (!event) return;

      event.sessions.push({
        start: instance.attributes.starts_at,
        end: instance.attributes.ends_at
      });

      if (!event.date) {
        event.date = instance.attributes.starts_at;
        event.endDate = instance.attributes.ends_at;
        event.location = instance.attributes.location;
        event.url = instance.attributes.church_center_url;
      }
    });

    Object.values(featuredMap).forEach(event => {
      event.sessions.sort((a, b) => new Date(a.start) - new Date(b.start));
    });

    const events = Object.values(featuredMap)
      .filter(event => event.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 12);

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
