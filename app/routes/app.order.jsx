import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";
import db from "../db.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const ordersId = await db.order.findMany();

  const ids = ordersId
    .map((order) => {
      if (!order.id) return null;
      return `gid://shopify/Order/${order.id}`;
    })
    .filter(Boolean);

  if (ids.length === 0) {
    return { ordersId, ordersDetails: [] };
  }

  const response = await admin.graphql(
    `
    query OrdersByIds($ids: [ID!]!) {
      nodes(ids: $ids) {
        id
        ... on Order {
          name
          totalPriceSet {
            presentmentMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 10) {
            nodes {
              id
              name
            }
          }
        }
      }
    }
    `,
    { variables: { ids } }
  );

  const json = await response.json();
  const ordersDetails = json.data?.nodes || [];

  return { ordersId, ordersDetails };
}

export default function AdditionalPage() {
  const { ordersId, ordersDetails } = useLoaderData();

  return (
    <div style={{ padding: "16px" }}>
      <h2> Order Summary</h2>

      <div style={{ border: "1px solid #ddd", padding: "12px" }}>
        <table width="100%" cellPadding="8">
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th>#</th>
              <th>Order</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {ordersDetails.map((order, index) => (
              <tr key={order.id}>
                <td>{index + 1}</td>
                <td>{order.name}</td>
                <td>{order.lineItems.nodes.length}</td>
                <td>
                  {order.totalPriceSet.presentmentMoney.amount}{" "}
                  {order.totalPriceSet.presentmentMoney.currencyCode}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ordersDetails.length === 0 && (
          <p style={{ marginTop: "10px" }}>No orders found</p>
        )}
      </div>
    </div>
  );
}
