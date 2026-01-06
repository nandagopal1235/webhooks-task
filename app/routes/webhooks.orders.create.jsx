import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, payload } = await authenticate.webhook(request);
  
  let orderId = payload.id.toString();
  const x = await db.order.findUnique({ where: { id: orderId } });
  if (!x) {
    await db.order.create({ data: { id: orderId } });
  }
};
