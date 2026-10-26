import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Building,
  ShieldCheck,
  TrendingUp,
  Receipt,
  FileCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Calendar,
  Layers,
  PieChart as PieChartIcon,
  BarChart2,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { SummaryCard } from '../components/common/SummaryCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Button } from '../components/common/Button';
import { DataTable } from '../components/common/DataTable';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardService } from '../services/dashboardService';
import { transactionsService } from '../services/transactionsService';
import { USER_ROLES } from '../services/apiContract';
import { formatINR, formatDate, getStatusConfig } from '../utils/formatters';

const CHART_COLORS = ['#1E3A8A', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DC2626'];

export function DashboardPage() {
  const { user, role, _setDevUser } = useAuth();
  const { addToast } = useToast();

  const [period, setPeriod] = useState('current_month');
  const [summaryData, setSummaryData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [summaryRes, chartsRes, txRes] = await Promise.all([
        dashboardService.getSummary(period),
        dashboardService.getCharts(period),
        transactionsService.getTransactions({ limit: 5, sortKey: 'date', sortOrder: 'desc' }),
      ]);

      setSummaryData(summaryRes.data);
      setChartsData(chartsRes.data);
      setRecentTransactions(txRes.data || []);
      setIsLiveBackend(summaryRes.isLiveBackend && chartsRes.isLiveBackend);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Role booleans
  const isResident = role === USER_ROLES.RESIDENT;
  const isAuditor = role === USER_ROLES.AUDITOR;
  const isTreasurer = role === USER_ROLES.TREASURER;
  const isCommittee = role === USER_ROLES.COMMITTEE_MEMBER;
  const isAdmin = role === USER_ROLES.ADMIN || !role;

  // Recent transactions table columns
  const transactionColumns = [
    {
      key: 'reference',
      header: 'Voucher Ref',
      width: '130px',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-900">{row.reference}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      width: '110px',
      render: (row) => <span className="text-xs text-slate-500">{formatDate(row.date)}</span>,
    },
    {
      key: 'description',
      header: 'Particulars & Fund',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-800 text-xs">{row.description}</div>
          <div className="text-[11px] text-slate-400">{row.fund}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      width: '130px',
      render: (row) => (
        <span
          className={`font-mono text-xs font-semibold ${
            row.type === 'INCOME' ? 'text-emerald-700' : 'text-slate-800'
          }`}
        >
          {row.type === 'INCOME' ? '+ ' : '- '}
          {formatINR(row.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Audit Status',
      align: 'right',
      width: '140px',
      render: (row) => {
        const config = getStatusConfig(row.status);
        return <StatusBadge variant={config.variant} size="sm">{config.label}</StatusBadge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header: Title, Period Selector & Backend Status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Financial Transparency Dashboard
            </h1>
            <StatusBadge variant={isLiveBackend ? 'success' : 'neutral'} size="sm" dot={true}>
              {isLiveBackend ? 'Connected to Backend API' : 'Awaiting Core Backend Deployment'}
            </StatusBadge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Greenwood Heights RWA • Role Perspective:{' '}
            <strong className="text-slate-800">{role || 'Resident'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1 text-xs shadow-2xs">
            <Calendar size={14} className="text-slate-400 ml-1.5 mr-1" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none pr-2 py-0.5"
            >
              <option value="current_month">Current Month (Oct 2026)</option>
              <option value="last_quarter">Last Quarter (Q2 FY26)</option>
              <option value="financial_year">Full Year (FY 2026-27)</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={fetchDashboardData}
            isLoading={isLoading}
            title="Refresh Ledger Aggregation"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Role Switcher Toolbar for Reviewing Different Permissions */}
      {_setDevUser && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Active Identity:</span>
            <span>{user?.name || 'Authorized Member'} ({user?.email})</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">Unit: {user?.apartmentNumber || 'A-402'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Preview UI as Role:</span>
            <select
              value={role || USER_ROLES.ADMIN}
              onChange={(e) => {
                const newRole = e.target.value;
                _setDevUser((prev) => ({
                  ...(prev || { name: 'Dev User', email: 'user@society.org' }),
                  role: newRole,
                }));
                addToast({
                  title: 'Role Perspective Updated',
                  message: `Switched dashboard perspective to ${newRole}. Cards & charts filtered.`,
                  type: 'info',
                });
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
            >
              {Object.values(USER_ROLES).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-12">
          <LoadingState
            message="Aggregating official financial balances..."
            description="Calculating fund totals, verified cash flows, and governance status from backend ledger."
          />
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <ErrorState
          title="Could not load dashboard aggregation"
          message="Failed to retrieve financial metrics. Please ensure backend service is running."
          onRetry={fetchDashboardData}
        />
      )}

      {/* Main Dashboard Content */}
      {!isLoading && !hasError && summaryData && (
        <>
          {/* Section 1: Role-Aware Potential Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Available Funds (All Roles) */}
            <SummaryCard
              title="Total Available Funds"
              value={formatINR(summaryData.totalAvailableFunds)}
              icon={Wallet}
              subtitle="All verified bank balances combined"
              trend={{ value: '+3.8%', isPositive: true, label: 'monthly growth' }}
            />

            {/* Card 2: Corpus Fund (Admin, Treasurer, Committee, Auditor) OR Maintenance Dues (Resident) */}
            {isResident ? (
              <SummaryCard
                title="Maintenance Account"
                value={formatINR(summaryData.maintenanceFundBalance)}
                icon={Building}
                subtitle="Operational liquidity"
                badge={<StatusBadge variant="success" size="sm">Paid (Oct 26)</StatusBadge>}
              />
            ) : (
              <SummaryCard
                title="Corpus Fund Balance"
                value={formatINR(summaryData.corpusFundBalance)}
                icon={Building}
                subtitle="Permanent fixed deposit reserve"
                trend={{ value: 'Secured', isPositive: true, label: 'HDFC / SBI FDs' }}
              />
            )}

            {/* Card 3: Income / Expense / Compliance depending on role */}
            {isResident ? (
              <SummaryCard
                title="Verified Month Expenses"
                value={formatINR(summaryData.totalExpenseMonth)}
                icon={Receipt}
                subtitle="Common utilities, security & lifts"
                badge={<StatusBadge variant="info" size="sm">Oct 26</StatusBadge>}
              />
            ) : isAuditor ? (
              <SummaryCard
                title="Open Audit Observations"
                value={summaryData.openAuditObservationsCount}
                icon={AlertTriangle}
                subtitle="Pending committee clarification"
                badge={
                  <StatusBadge
                    variant={summaryData.openAuditObservationsCount > 0 ? 'warning' : 'success'}
                    size="sm"
                  >
                    {summaryData.openAuditObservationsCount > 0 ? 'Action Needed' : 'Clean'}
                  </StatusBadge>
                }
              />
            ) : (
              <SummaryCard
                title="Total Income (Month)"
                value={formatINR(summaryData.totalIncomeMonth)}
                icon={TrendingUp}
                subtitle="Collections & deposit interest"
                trend={{ value: '98% collected', isPositive: true, label: 'on time' }}
              />
            )}

            {/* Card 4: Approvals / Reconciliations / Statutory Audit */}
            {isAuditor ? (
              <SummaryCard
                title="Pending Reconciliations"
                value={summaryData.pendingReconciliationsCount}
                icon={Clock}
                subtitle="Bank statement mismatches"
                badge={<StatusBadge variant="warning" size="sm">2 Vouchers</StatusBadge>}
              />
            ) : isResident ? (
              <SummaryCard
                title="Statutory Compliance"
                value="100 %"
                icon={ShieldCheck}
                subtitle="Karnataka Societies Reg. Act"
                badge={<StatusBadge variant="success" size="sm">Audited FY25-26</StatusBadge>}
              />
            ) : (
              <SummaryCard
                title="Pending Expense Approvals"
                value={summaryData.pendingApprovalsCount}
                icon={Clock}
                subtitle="Vouchers awaiting signoff"
                badge={
                  <StatusBadge
                    variant={summaryData.pendingApprovalsCount > 0 ? 'warning' : 'success'}
                    size="sm"
                  >
                    {summaryData.pendingApprovalsCount} Vouchers
                  </StatusBadge>
                }
              />
            )}
          </div>

          {/* Section 2: Recharts Visualizations */}
          {chartsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Monthly Income vs. Expenditure */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <BarChart2 size={16} className="text-blue-600" />
                      Monthly Income versus Expenditure
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Operational cash flow trends over past 6 months (in INR)
                    </p>
                  </div>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartsData.monthlyCashflow}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickFormatter={(v) => `₹${v / 100000}L`}
                      />
                      <Tooltip
                        formatter={(val) => [formatINR(val), '']}
                        labelStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="income" name="Income" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenditure" name="Expenditure" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Fund-wise Balance Distribution */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <PieChartIcon size={16} className="text-blue-600" />
                      Fund-wise Balance Distribution
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Total reserves divided across ring-fenced bank accounts
                    </p>
                  </div>
                  <Link to="/funds" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    Manage Funds <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="h-72 w-full pt-2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartsData.fundDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartsData.fundDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [formatINR(val), 'Balance']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Expenditure by Category */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Layers size={16} className="text-blue-600" />
                      Expenditure by Category
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Where society funds were disbursed this cycle
                    </p>
                  </div>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={chartsData.categoryBreakdown}
                      margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickFormatter={(v) => `₹${v / 1000}k`}
                      />
                      <YAxis
                        type="category"
                        dataKey="category"
                        tick={{ fontSize: 10, fill: '#334155' }}
                        width={130}
                      />
                      <Tooltip
                        formatter={(val) => [formatINR(val), 'Expense']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="amount" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Event Budget vs. Actual Expenditure */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <CalendarDays size={16} className="text-blue-600" />
                      Event Budget versus Actual Expenditure
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Governance tracking of community event allocations
                    </p>
                  </div>
                  <Link to="/events" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    View Events <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartsData.eventBudgetVsActual}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="event" tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickFormatter={(v) => `₹${v / 1000}k`}
                      />
                      <Tooltip
                        formatter={(val) => [formatINR(val), '']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="allocatedBudget" name="Allocated Budget" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="actualExpense" name="Actual Expenditure" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Recent Verified Transactions Feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Receipt size={16} className="text-blue-600" />
                  Recent Audited Transactions
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Latest voucher settlements and verified maintenance inflows
                </p>
              </div>

              <Link to="/transactions">
                <Button variant="outline" size="sm" icon={ExternalLink}>
                  View General Ledger
                </Button>
              </Link>
            </div>

            <DataTable
              columns={transactionColumns}
              data={recentTransactions}
              emptyTitle="No recent transactions recorded"
              emptyDescription="Transactions recorded by the treasurer will appear here once submitted."
            />
          </div>
        </>
      )}
    </div>
  );
}
