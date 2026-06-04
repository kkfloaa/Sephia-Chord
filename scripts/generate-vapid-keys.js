const crypto = require("crypto");

const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
  namedCurve: "prime256v1"
});
const jwkPrivate = privateKey.export({ format: "jwk" });
const jwkPublic = publicKey.export({ format: "jwk" });
const publicBytes = Buffer.concat([
  Buffer.from([0x04]),
  Buffer.from(jwkPublic.x, "base64url"),
  Buffer.from(jwkPublic.y, "base64url")
]);

console.log(`VAPID_PUBLIC_KEY=${publicBytes.toString("base64url")}`);
console.log(`VAPID_PRIVATE_KEY=${jwkPrivate.d}`);
console.log("VAPID_SUBJECT=mailto:you@example.com");
console.log(`CRON_SECRET=${crypto.randomBytes(24).toString("base64url")}`);
