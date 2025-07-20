import { ChatBadge } from "./components/chat/chat";
import * as accounts from "./db/accounts";
import Link from "next/link";

export default async function Home() {
  const items = await accounts.getAccounts();
  return (
    <div style={{ padding: "96px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
              }}
            >
              ID
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
              }}
            >
              Account Name
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
              }}
            >
              Value Based Priority
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
              }}
            >
              Product Recommendation
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
              }}
            >
              Addon Recommendation
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
              }}
            >
              Triggers
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
              }}
            >
              Private Notes
            </th>
            <th
              style={{
                border: "1px solid black",
                padding: "8px",
              }}
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                }}
              >
                <Link href={`/account/${i.id}`}>{i.id}</Link>
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                }}
              >
                <Link href={`/account/${i.id}`}>
                  {i.account_name}
                </Link>
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                }}
              >
                {i.product_classification}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                }}
              >
                {i.product_recommendation1}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                }}
              >
                {i.product_recommendation2}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                }}
              >
                {i.trigger_count}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                }}
              >
                {i.private_note_count}
              </td>
              <td
                style={{
                  border: "1px solid black",
                  padding: "8px",
                }}
              >
                {i.next_best_action_status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ChatBadge />
    </div>
  );
}
