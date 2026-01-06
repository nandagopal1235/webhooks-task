import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  console.log("Order Create Webhook Received");
  const { shop, payload } = await authenticate.webhook(request);
  console.log("hellooo");
  console.log("new order");
  let orderId = payload.id.toString();
  const x = await db.order.findUnique({ where: { id: orderId } });
  if (!x) {
    await db.order.create({ data: { id: orderId } });
  }

  console.log("Order ID:", orderId);
};