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
        <div className="p-6 md:p-10 space-y-10">
            <h1>Dashboard</h1>
            
            {/* Polished totals section */}
            <section>
                <h2 className="text-lg font-semibold">Overview</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <p className="text-sm text-gray-600">Total Invoices</p>
                        <p className="text-2xl font-semibold">
                            {totalsLoading ? "-" : totals?.total_invoices}
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <p className="text-sm text-gray-600">Total Clients</p>
                        <p className="text-2xl font-semibold">{clients.length}</p>
                    </div>

                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <p className="text-sm text-gray-600">Outstanding</p>
                        <p className="text-2xl font-semibold">
                            {totalsLoading ? "-" : totals?.total_outstanding}
                        </p>
                    </div>

                    <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <p className="text-sm text-gray-600">Paid</p>
                        <p className="text-2xl font-semibold">
                            {totalsLoading ? "-" : totals?.total_paid}
                        </p>
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
                                    <td colSpan={5} className="py-6 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="text-4xl">📄</div>
                                            <p className="text-sm">No invoices yet</p>
                                            <p className="text-xs text-gray-400">Create your first invoice to get started</p>
                                        </div>
                                    </td>
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
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        className="p-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                        onClick={() => window.location.href = "/invoices/create"}
                    >
                        Create Invoice
                    </button>

                    <button
                        className="p-4 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition"
                        onClick={() => window.location.href = "/invoices"}
                    >
                        View All Invoices
                    </button>

                    <button
                        className="p-4 rounded-lg bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition"
                        onClick={() => window.location.href = "/clients"}
                    >
                        Manage Clients
                    </button>
                </div>
            </section>
        </div>
    );
}