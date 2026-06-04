const { getDataSourceId, getNotionVersion, json } = require("./_lib");

module.exports = async function handler(req, res) {
  json(res, 200, {
    ok: true,
    env: {
      appPassword: Boolean(process.env.APP_PASSWORD),
      notionToken: Boolean(process.env.NOTION_TOKEN),
      notionDataSourceId: getDataSourceId(),
      vapidPublicKey: Boolean(process.env.VAPID_PUBLIC_KEY),
      vapidPrivateKey: Boolean(process.env.VAPID_PRIVATE_KEY),
      cronSecret: Boolean(process.env.CRON_SECRET)
    },
    notionVersion: getNotionVersion()
  });
};
