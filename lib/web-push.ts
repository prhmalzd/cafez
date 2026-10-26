import { createECDH, createPrivateKey, sign } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const decode = (value: string) => Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64");
const encode = (value: Buffer | string) => Buffer.from(value).toString("base64url");

function vapidAuthorization(endpoint: string) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@cafez.ir";
  if (!publicKey || !privateKey) return null;
  const publicBytes = decode(publicKey);
  const privateBytes = decode(privateKey);
  const ecdh = createECDH("prime256v1");
  ecdh.setPrivateKey(privateBytes);
  const derivedPublic = ecdh.getPublicKey(undefined, "uncompressed");
  const key = createPrivateKey({ key: { kty: "EC", crv: "P-256", d: encode(privateBytes), x: encode(derivedPublic.subarray(1, 33)), y: encode(derivedPublic.subarray(33, 65)) }, format: "jwk" });
  const header = encode(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, sub: subject }));
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), { key, dsaEncoding: "ieee-p1363" });
  return { authorization: `vapid t=${header}.${payload}.${encode(signature)}, k=${publicKey}`, publicKey };
}

async function sendEmptyPush(endpoint: string) {
  const vapid = vapidAuthorization(endpoint);
  if (!vapid) return false;
  const response = await fetch(endpoint, { method: "POST", headers: { Authorization: vapid.authorization, TTL: "120", Urgency: "high" } });
  if (!response.ok && response.status !== 201) throw Object.assign(new Error(`Push failed: ${response.status}`), { status: response.status });
  return true;
}

async function notify(filter: { cafe_id?: string; order_id?: string }) {
  const admin = getSupabaseAdmin();
  if (!admin || !process.env.VAPID_PRIVATE_KEY) return;
  let query = admin.from("push_subscriptions").select("id,endpoint");
  if (filter.cafe_id) query = query.eq("cafe_id", filter.cafe_id).eq("purpose", "staff");
  if (filter.order_id) query = query.eq("order_id", filter.order_id).eq("purpose", "customer");
  const { data } = await query;
  await Promise.all((data ?? []).map(async (subscription) => {
    try { await sendEmptyPush(subscription.endpoint); }
    catch (error) { if ((error as { status?: number }).status === 404 || (error as { status?: number }).status === 410) await admin.from("push_subscriptions").delete().eq("id", subscription.id); }
  }));
}

export const notifyCafeStaff = (cafeId: string) => notify({ cafe_id: cafeId });
export const notifyOrderCustomer = (orderId: string) => notify({ order_id: orderId });
