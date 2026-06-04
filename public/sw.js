self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "Sephia Chord";
  const options = {
    body: payload.body || "You have something starting soon.",
    tag: payload.tag || "sephia-reminder",
    renotify: false,
    icon: "/assets/sephia-chord-logo.png",
    badge: "/assets/sephia-chord-logo.png",
    data: payload.data || {}
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const appClient = clients.find((client) => client.url.startsWith(self.location.origin));
        if (appClient) return appClient.focus();
        return self.clients.openWindow("/");
      })
  );
});
