import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import StatusBadge from "../components/common/StatusBadge";
import { useInvoiceTotals } from "../features/invoices/hooks/useInvoiceTotals";

export default function DashboardPage() {
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);

    // Load backend totals
    const { totals, loading: totalsLoading, error: totalsError } = useInvoiceTotals();

    useEffect(() => {
        async function loadData() {
            setLoading(true);

            // Get the current user
            const {data: {user}} = await supabaseClient.auth.getUser();
            if (!user) {
                setRecentInvoices([]);
                setLoading(false);
                return;
            }

            // Fetch invoices for this user
            const {data, error} = await supabaseClient
                .from("invoices")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", {ascending: false})
                .limit(5);

            if (error) {
                console.error(error);
                setRecentInvoices([]);
            } else {
                setRecentInvoices(data);
            }

            // Fetch all clients for this user
            const {data: clientData, error: clientError} = await supabaseClient
                .from("clients")
                .select("*")
                .eq("user_id", user.id);

            if(clientError) {
                console.error(clientError);
            } else {
                setClients(clientData);
            }

            setLoading(false);
        }

        loadData();

    }, []);
    
    // Lookup map
    const clientLookup = clients.reduce((acc, client) => {
        acc[client.id] = client.name;
        return acc;
    }, {});

    return (
        <div>
            <h1>Dashboard</h1>
            
            <section className="mt-6">
                <div className="flex gap-4">

                    {/* Backend totals */}
                    <div className="p-4 border rounded">
                        <p>Total Invoices</p>
                        <p>{totalsLoading ? "-" : totals?.total_invoices}</p>
                    </div>

                    <div className="p-4 border rounded">
                        <p>Total Clients</p>
                        <p>{clients.length}</p>
                    </div>

                    <div className="p-4 border rounded">
                        <p>Outstanding</p>
                        <p>{totalsLoading ? "-" : totals?.total_outstanding}</p>
                    </div>

                    <div className="p-4 border rounded">
                        <p>Paid</p>
                        <p>{totalsLoading ? "-" : totals?.total_paid}</p>
                    </div>
                </div>
            </section>

            <section className="mt-8">
                {/* Recent invoices list/tables */}
                <h2 className="text-lg font-semibold mb-4">Recent Invoices</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="border-b">
                            <tr>
                                <th className="py-2">Invoice</th>
                                <th className="py-2">Client</th>
                                <th className="py-2">Amount</th>
                                <th className="py-2">Status</th>
                                <th className="py-2">Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={5}>Loading</td>
                                </tr>
                            )}

                            {!loading && recentInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={5}>No invoices yet</td>
                                </tr>
                            )}

                            {!loading && recentInvoices.length > 0 && recentInvoices.map((inv) => {
                                const date = new Date(inv.invoice_date);
                                
                                const day = String(date.getDate()).padStart(2, '0');
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const year = date.getFullYear();

                                const formattedDateString = `${day}/${month}/${year}`;

                                const formattedAmount = new Intl.NumberFormat("en-GB", {
                                    style: "currency",
                                    currency: "GBP"
                                }).format(inv.amount);

                                return (
                                    <tr key={inv.id}>
                                        <td className="py-2">{inv.id}</td>
                                        <td className="py-2">{clientLookup[inv.client_id] || "Unknown"}</td>
                                        <td className="py-2">{formattedAmount}</td>
                                        <td className="py-2"><StatusBadge status={inv.status} /></td>
                                        <td className="py-2">{formattedDateString}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                {/* Quick actions/buttons */}
            </section>
        </div>
    );
}