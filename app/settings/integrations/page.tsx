import Link from "next/link";

export default function Integrations() {
  return (
    <div>
      <h1>Integrations</h1>
      <p>Manage your integrations here.</p>
      <ul>
        <li><Link href="/settings/meta-conversions">Meta Conversions API</Link></li>
        {/* Add more */}
      </ul>
    </div>
  );
} 