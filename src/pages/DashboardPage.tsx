import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function DashboardPage() {
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInvoices() {
            setLoading(true);

            // Get the current user
            const {data: {user}} = await supabase.auth.getUser();
            if (!user) {
                setRecentInvoices([]);
                setLoading(false);
                return;
            }

            // Fetch invoices for this user
            const {data, error} = await supabase
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

            setLoading(false);
        }

        loadInvoices();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            
            <section className="mt-6">
                <div className="flex gap-4">
                    <div className="p-4 border rounded">
                        <p>Total Invoices</p>
                        <p>-</p>
                    </div>

                    <div className="p-4 border rounded">
                        <p>Total CLients</p>
                        <p>-</p>
                    </div>

                    <div className="p-4 border rounded">
                        <p>Outstanding</p>
                        <p>-</p>
                    </div>

                    <div className="p-4 border rounded">
                        <p>Paid</p>
                        <p>-</p>
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
                            {/* Placeholder rows */}
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

                            {!loading && recentInvoices.length> 0 && recentInvoices.map((inv) => (
                                <tr>
                                    <td className="py-2">-</td>
                                    <td className="py-2">-</td>
                                    <td className="py-2">-</td>
                                    <td className="py-2">-</td>
                                    <td className="py-2">-</td>
                                </tr>
                            ))}
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