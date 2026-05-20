import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  MessageSquare,
} from "lucide-react";

import { contractAPI, milestoneAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
// Updated import to local directory
import MilestoneList from "../../components/contracts/MilestoneList";
import CreateMilestoneModal from "../../components/contracts/CreateMilestoneModal";

const ContractWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);

  /* ---------------- Contract ---------------- */

  const { data: contractData } = useQuery(["contract", id], () =>
    contractAPI.getContractById(id)
  );

  const contract = contractData?.data?.data?.contract;

  /* ---------------- Milestones ---------------- */

  const { data: milestoneData, refetch } = useQuery(["milestones", id], () =>
    milestoneAPI.getMilestones({ contractId: id })
  );

  const milestones = milestoneData?.data?.data?.milestones || [];
  const progress = milestoneData?.data?.data?.progress;

  /* ---------------- Render ---------------- */

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-primary-600" />
            Contract Workspace
          </h1>

          <p className="text-gray-600 mt-2">
            Manage milestones, work submissions and payments
          </p>
        </motion.div>

        {/* Contract Info */}

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                <DollarSign className="w-4 h-4" />$
                {contract?.budget?.amount || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold">{contract?.status}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Started</p>
              <p className="text-lg font-semibold">
                {contract?.startDate
                  ? new Date(contract.startDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-lg font-semibold">
                ${contract?.totalPaid || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Layout */}

        <div className="grid grid-cols-3 gap-8">
          {/* Milestones */}

          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Milestones</h2>

                {user?.role === "client" && contract?.status === "active" && (
                  <button
                    onClick={() => setShowCreateMilestone(true)}
                    className="px-4 py-2 bg-primary-600 text-white rounded"
                  >
                    + Create Milestone
                  </button>
                )}
              </div>

              {user?.role === "client" && contract?.status !== "active" && (
                <p className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  Milestones can be created after the contract becomes active.
                </p>
              )}

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress?.percentComplete || 0)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600"
                    style={{ width: `${Math.max(0, Math.min(100, progress?.percentComplete || 0))}%` }}
                  />
                </div>
              </div>

              <MilestoneList
                milestones={milestones}
                refresh={refetch}
                contractId={id}
                contractStatus={contract?.status}
              />
            </div>
          </div>

          {/* Activity Sidebar */}

          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Activity
              </h3>

              <ul className="space-y-3 text-sm text-gray-600">
                <li>Contract started</li>

                <li>Milestones created</li>

                <li>Waiting for work submission</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Quick Actions
              </h3>

              <button
                onClick={() => navigate(`/messages/direct/${contract?.freelancer?._id || contract?.freelancer}`)}
                className="w-full bg-primary-600 text-white py-2 rounded-lg mb-3"
              >
                Open Chat
              </button>

              <button className="w-full border py-2 rounded-lg">
                View Payments
              </button>
            </div>
          </div>
        </div>

        {showCreateMilestone && (
          <CreateMilestoneModal
            contractId={id}
            refresh={refetch}
            onClose={() => setShowCreateMilestone(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ContractWorkspace;