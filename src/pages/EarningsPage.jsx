import { motion } from "framer-motion";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";

import { paymentAPI, userAPI } from "../services/api";
import { showToast } from "../components/ui/Toast";
import { formatCurrency } from "../lib/utils";

const EarningsPage = () => {
  const queryClient = useQueryClient();
  const [withdrawAmount, setWithdrawAmount] = useState("");

  /* --------------------------------------- */
  /* Fetch Earnings Stats                    */
  /* --------------------------------------- */

  const { data: statsData } = useQuery(
    "paymentStats",
    () => paymentAPI.getPaymentStats()
  );

  const { data: earningsData } = useQuery(
    "earningsChart",
    () => paymentAPI.getEarningsByMonth()
  );

  const { data: transactionsData } = useQuery(
    "myPayments",
    () => paymentAPI.getMyPayments()
  );

  const { data: walletData } = useQuery(
    "walletSummary",
    () => userAPI.getWalletSummary(),
    {
      retry: false
    }
  );

  const withdrawalMutation = useMutation(
    (amount) => userAPI.requestWalletWithdrawal({ amount }),
    {
      onSuccess: (response) => {
        showToast.success(response?.data?.message || "Withdrawal request submitted");
        setWithdrawAmount("");
        queryClient.invalidateQueries("walletSummary");
        queryClient.invalidateQueries("paymentStats");
      },
      onError: (error) => {
        showToast.error(error?.response?.data?.message || "Failed to request withdrawal");
      }
    }
  );

  const statsResponse = statsData?.data?.data || {};
  const transactions = transactionsData?.data?.data?.payments || [];
  const wallet = walletData?.data?.data?.wallet || {};
  const availableBalance = Number(wallet.availableBalance || 0);
  const pendingBalance = Number(wallet.pendingBalance || 0);

  const handleWithdraw = (event) => {
    event.preventDefault();

    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      showToast.error("Enter a valid withdrawal amount");
      return;
    }

    if (amount > availableBalance) {
      showToast.error("Withdrawal amount cannot exceed available balance");
      return;
    }

    withdrawalMutation.mutate(amount);
  };

  /* --------------------------------------- */
  /* Stats Cards                             */
  /* --------------------------------------- */

  const stats = [
    {
      label: "Total Earnings",
      value: formatCurrency(statsResponse.total || 0),
      change: `${statsResponse.successRate || 0}%`,
      icon: DollarSign,
      color: "bg-green-500",
      trend: "up"
    },
    {
      label: "Completed Payments",
      value: statsResponse.completed || 0,
      change: "+0%",
      icon: CheckCircle,
      color: "bg-purple-500",
      trend: "up"
    },
    {
      label: "Pending",
      value:
        transactions.filter((p) => p.status === "processing").length || 0,
      change: "0%",
      icon: Clock,
      color: "bg-yellow-500",
      trend: "neutral"
    },
    {
      label: "Transactions",
      value: transactions.length || 0,
      change: "+0%",
      icon: Calendar,
      color: "bg-blue-500",
      trend: "up"
    }
  ];

  /* --------------------------------------- */
  /* Render                                  */
  /* --------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50 py-8">

      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="w-8 h-8 text-primary-600" />
                Earnings
              </h1>

              <p className="text-gray-600">
                Track your income and manage withdrawals
              </p>
            </div>

            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Report
            </button>

          </div>
        </motion.div>

        {/* Stats */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {stats.map((stat, index) => {

            const Icon = stat.icon;

            return (

              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow"
              >

                <div className="flex justify-between mb-4">

                  <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <span className="flex items-center text-green-600 text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    {stat.change}
                  </span>

                </div>

                <h3 className="text-2xl font-bold">{stat.value}</h3>

                <p className="text-gray-600 text-sm">{stat.label}</p>

              </motion.div>

            );

          })}

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(availableBalance)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-1">Pending Withdrawal</p>
            <p className="text-3xl font-bold text-yellow-600">{formatCurrency(pendingBalance)}</p>
          </div>

          <form onSubmit={handleWithdraw} className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500 mb-3">Withdraw Funds</p>
            <div className="flex gap-3">
              <input
                type="number"
                min="0"
                step="0.01"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
                placeholder="Amount"
                className="w-full border rounded-lg px-3 py-2"
              />
              <button
                type="submit"
                disabled={withdrawalMutation.isLoading || availableBalance <= 0}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-60"
              >
                {withdrawalMutation.isLoading ? "Processing..." : "Withdraw"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Withdrawals require an active Stripe payout account.
            </p>
          </form>

        </div>

        {/* Earnings Chart Placeholder */}

        <div className="bg-white p-6 rounded-lg shadow mb-8">

          <h3 className="text-lg font-semibold mb-4">
            Earnings Overview
          </h3>

          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">

            <div className="text-center">

              <TrendingUp className="w-10 h-10 text-gray-400 mx-auto mb-3" />

              <p className="text-gray-500">
                Earnings chart will appear here
              </p>

            </div>

          </div>

        </div>

        {/* Transactions */}

        <div className="bg-white p-6 rounded-lg shadow">

          <h3 className="text-lg font-semibold mb-6">
            Recent Transactions
          </h3>

          {transactions.length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              No transactions yet
            </div>

          ) : (

            <div className="space-y-4">

              {transactions.map((tx) => (

                <div
                  key={tx._id}
                  className="flex justify-between border p-4 rounded-lg"
                >

                  <div>

                    <p className="font-medium">
                      {tx.type}
                    </p>

                    <p className="text-sm text-gray-500">
                      Contract: {tx.contract?.title}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="font-semibold">
                      ${tx.amount}
                    </p>

                    <span className="text-xs text-gray-500">
                      {tx.status}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );

};

export default EarningsPage;
