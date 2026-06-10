import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  InputAdornment,
  IconButton,
  alpha,
  LinearProgress,
  Collapse,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Refresh,
  Add,
  History,
  PhoneAndroid,
  CheckCircle,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import ResponsiveTablePagination from "../components/ResponsiveTablePagination";
import { getWalletBalance, getWalletTransactions, initiateDeposit, getDepositStatus } from "../api";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 120000;

const TYPE_META = {
  deposit: { label: "Deposit", color: "success" },
  entry_fee: { label: "Entry fee", color: "warning" },
  entry_fee_refund: { label: "Refund", color: "info" },
  prize_win: { label: "Prize", color: "secondary" },
  withdrawal: { label: "Withdrawal", color: "error" },
};

const cardSx = {
  borderRadius: 3,
  bgcolor: "rgba(12,12,20,0.85)",
  border: "1px solid rgba(255,255,255,0.08)",
};

function formatMoney(value) {
  return `KSh ${parseFloat(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function isCredit(type) {
  return ["deposit", "prize_win", "entry_fee_refund"].includes(type);
}

function TransactionRow({ tx }) {
  const meta = TYPE_META[tx.type] || { label: tx.type, color: "default" };
  const credit = isCredit(tx.type);
  return (
    <TableRow hover>
      <TableCell>
        <Chip label={meta.label} size="small" color={meta.color} variant="outlined" />
      </TableCell>
      <TableCell sx={{ maxWidth: 200 }}>
        <Typography variant="body2" noWrap title={tx.description}>
          {tx.description || "—"}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography fontWeight={700} color={credit ? "#10F0A0" : "#FF4D6A"}>
          {credit ? "+" : "−"}
          {formatMoney(tx.amount)}
        </Typography>
      </TableCell>
      <TableCell>
        <Chip
          label={tx.status}
          size="small"
          sx={{
            textTransform: "capitalize",
            bgcolor: alpha(tx.status === "completed" ? "#10F0A0" : "#F5C518", 0.12),
            color: tx.status === "completed" ? "#10F0A0" : "#F5C518",
          }}
        />
      </TableCell>
      <TableCell sx={{ whiteSpace: "nowrap", color: "text.secondary", fontSize: "0.85rem" }}>
        {formatDate(tx.createdAt)}
      </TableCell>
    </TableRow>
  );
}

function TransactionCard({ tx }) {
  const meta = TYPE_META[tx.type] || { label: tx.type };
  const credit = isCredit(tx.type);
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Chip label={meta.label} size="small" variant="outlined" />
            <Chip
              label={tx.status}
              size="small"
              sx={{
                textTransform: "capitalize",
                height: 22,
                fontSize: "0.7rem",
                bgcolor: alpha(tx.status === "completed" ? "#10F0A0" : "#F5C518", 0.12),
                color: tx.status === "completed" ? "#10F0A0" : "#F5C518",
              }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
            {tx.description || "—"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(tx.createdAt)}
          </Typography>
        </Box>
        <Typography fontWeight={800} color={credit ? "#10F0A0" : "#FF4D6A"} sx={{ flexShrink: 0 }}>
          {credit ? "+" : "−"}
          {formatMoney(tx.amount)}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [balance, setBalance] = useState(parseFloat(user?.walletBalance || 0));
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [txRefreshing, setTxRefreshing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingDeposit, setPendingDeposit] = useState(null);
  const [balancePulse, setBalancePulse] = useState(false);
  const pollTimeoutRef = useRef(null);
  const hasLoadedOnce = useRef(false);

  const loadBalance = useCallback(async () => {
    const res = await getWalletBalance();
    setBalance(parseFloat(res.data.balance || 0));
    await refreshUser();
  }, [refreshUser]);

  const loadTransactions = useCallback(
    async ({ silent = false } = {}) => {
      const background = silent || hasLoadedOnce.current;
      if (background) {
        setTxRefreshing(true);
      } else {
        setTxLoading(true);
      }
      try {
        const res = await getWalletTransactions({
          limit: rowsPerPage,
          offset: page * rowsPerPage,
        });
        setTransactions(res.data.transactions || []);
        setTotal(res.data.total || 0);
        hasLoadedOnce.current = true;
      } finally {
        setTxLoading(false);
        setTxRefreshing(false);
      }
    },
    [page, rowsPerPage]
  );

  const loadAll = useCallback(
    async ({ silent = false } = {}) => {
      const background = silent || hasLoadedOnce.current;
      if (!background) {
        setLoading(true);
        setError("");
      }
      try {
        await Promise.all([loadBalance(), loadTransactions({ silent: background || silent })]);
      } catch (err) {
        setError(err.message || "Failed to load wallet");
      } finally {
        setLoading(false);
      }
    },
    [loadBalance, loadTransactions]
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refreshSilently = useCallback(async () => {
    try {
      await loadAll({ silent: true });
    } catch {
      /* ignore background refresh errors */
    }
  }, [loadAll]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshSilently();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshSilently]);

  useEffect(() => {
    if (!pendingDeposit?.callbackId) return undefined;

    const poll = async () => {
      try {
        const res = await getDepositStatus(pendingDeposit.callbackId);
        const { status, balance, amount, resultDescription, mpesaReceiptNumber } = res.data;

        if (status === "success") {
          setPendingDeposit(null);
          setBalance(parseFloat(balance || 0));
          setBalancePulse(true);
          setTimeout(() => setBalancePulse(false), 2000);
          await refreshUser();
          await loadTransactions({ silent: true });
          const credited = parseFloat(amount || pendingDeposit.amount);
          setSuccess(
            mpesaReceiptNumber
              ? `KSh ${credited.toLocaleString("en-KE")} added! M-Pesa receipt: ${mpesaReceiptNumber}`
              : `KSh ${credited.toLocaleString("en-KE")} has been added to your wallet.`
          );
        } else if (status === "failed") {
          setPendingDeposit(null);
          setError(resultDescription || "M-Pesa payment failed or was cancelled.");
        }
      } catch {
        /* keep polling until timeout */
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    pollTimeoutRef.current = setTimeout(() => {
      setPendingDeposit(null);
      setError("Payment confirmation timed out. If you paid, tap refresh — it may take a moment.");
    }, POLL_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, [pendingDeposit?.callbackId, refreshUser, loadTransactions]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const parsed = parseFloat(depositAmount);
    if (!parsed || parsed < 10) {
      setError("Minimum deposit is KSh 10");
      return;
    }
    setDepositLoading(true);
    try {
      const res = await initiateDeposit(parsed);
      const callbackId = res.data?.callbackId;

      if (res.data?.simulated) {
        setSuccess(res.message || "Deposit simulated — configure M-Pesa for live STK push.");
        setDepositAmount("");
        return;
      }

      setDepositAmount("");
      setSuccess(null);
      if (callbackId) {
        setPendingDeposit({ callbackId, amount: parsed });
      } else {
        setSuccess(res.message || "STK push sent to your phone.");
      }
    } catch (err) {
      setError(err.message || "Deposit failed");
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
              My Wallet
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Balance, M-Pesa deposits & transaction history
            </Typography>
          </Box>
          <IconButton
            onClick={() => loadAll({ silent: true })}
            disabled={loading || txRefreshing}
            aria-label="Refresh wallet"
            sx={{
              border: "1px solid rgba(255,255,255,0.08)",
              bgcolor: "rgba(255,255,255,0.03)",
              alignSelf: { xs: "flex-end", sm: "auto" },
              "&:hover": { bgcolor: "rgba(245,197,24,0.08)", borderColor: "rgba(245,197,24,0.3)" },
            }}
          >
            {loading || txRefreshing ? (
              <CircularProgress size={20} sx={{ color: "#F5C518" }} />
            ) : (
              <Refresh />
            )}
          </IconButton>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && !pendingDeposit && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")} icon={<CheckCircle />}>
            {success}
          </Alert>
        )}

        <Collapse in={Boolean(pendingDeposit)}>
          <Alert
            severity="info"
            icon={<PhoneAndroid />}
            sx={{
              mb: 2,
              border: "1px solid rgba(245,197,24,0.35)",
              bgcolor: "rgba(245,197,24,0.08)",
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Stack spacing={1}>
              <Typography fontWeight={700}>
                Complete payment on your phone
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Waiting for M-Pesa to confirm KSh {pendingDeposit?.amount?.toLocaleString("en-KE")}…
                Your wallet will update automatically.
              </Typography>
              <LinearProgress
                sx={{
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.08)",
                  "& .MuiLinearProgress-bar": { bgcolor: "#F5C518" },
                }}
              />
            </Stack>
          </Alert>
        </Collapse>

        <Stack spacing={{ xs: 2, sm: 2.5 }} sx={{ mb: 2.5 }}>
          <Card
            sx={{
              ...cardSx,
              width: "100%",
              background: balancePulse
                ? "linear-gradient(145deg, rgba(16,240,160,0.22) 0%, rgba(245,197,24,0.12) 100%)"
                : "linear-gradient(145deg, rgba(245,197,24,0.16) 0%, rgba(16,240,160,0.08) 100%)",
              border: balancePulse
                ? "1px solid rgba(16,240,160,0.45)"
                : "1px solid rgba(245,197,24,0.28)",
              transition: "background 0.6s ease, border-color 0.6s ease, box-shadow 0.6s ease",
              boxShadow: balancePulse ? "0 0 32px rgba(16,240,160,0.25)" : "none",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={{ xs: 3, md: 4 }}
                alignItems={{ md: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "16px",
                      bgcolor: "rgba(245,197,24,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <AccountBalanceWallet sx={{ color: "#F5C518", fontSize: 30 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing="0.08em">
                      AVAILABLE BALANCE
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: "2rem", sm: "2.35rem" },
                        color: "#F5C518",
                        lineHeight: 1.1,
                      }}
                    >
                      {loading ? "..." : formatMoney(balance)}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ width: { xs: "100%", md: 360 }, flexShrink: 0 }}>
                  <Typography fontWeight={700} sx={{ mb: 1.5 }}>
                    Deposit via M-Pesa
                  </Typography>
                  <Box component="form" onSubmit={handleDeposit}>
                    <Stack spacing={1.5}>
                      <TextField
                        label="Amount"
                        type="number"
                        size="small"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        inputProps={{ min: 10, step: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography color="text.secondary" fontWeight={600} fontSize="0.9rem">
                                KSh
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={depositLoading || Boolean(pendingDeposit)}
                        fullWidth
                        startIcon={depositLoading ? <CircularProgress size={18} color="inherit" /> : <Add />}
                        sx={{
                          bgcolor: "#F5C518",
                          color: "#050508",
                          fontWeight: 800,
                          py: 1.25,
                          "&:hover": { bgcolor: "#FFE566" },
                        }}
                      >
                        {depositLoading
                          ? "Sending STK..."
                          : pendingDeposit
                            ? "Waiting for M-Pesa..."
                            : "Deposit with M-Pesa"}
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ ...cardSx, width: "100%", position: "relative" }}>
            {txRefreshing && (
              <LinearProgress
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  borderRadius: "12px 12px 0 0",
                  height: 2,
                  zIndex: 1,
                  "& .MuiLinearProgress-bar": { bgcolor: "#F5C518" },
                }}
              />
            )}
            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: "0 !important" }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <History sx={{ color: "#F5C518", fontSize: 22 }} />
                  <Typography fontWeight={700}>Recent activity</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {total} transaction{total === 1 ? "" : "s"} total
                </Typography>

                <Stack spacing={1.25} sx={{ display: { xs: "flex", md: "none" } }}>
                  {txLoading && transactions.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <CircularProgress size={24} sx={{ color: "#F5C518" }} />
                    </Box>
                  ) : transactions.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                      No transactions yet. Make your first deposit.
                    </Typography>
                  ) : (
                    transactions.map((tx) => <TransactionCard key={tx.id} tx={tx} />)
                  )}
                </Stack>

                <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {txLoading && transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <CircularProgress size={24} sx={{ color: "#F5C518" }} />
                          </TableCell>
                        </TableRow>
                      ) : transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                            No transactions yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <ResponsiveTablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 20]}
                  sx={{ borderTop: "1px solid rgba(255,255,255,0.06)", mt: 1 }}
                />
              </CardContent>
          </Card>
        </Stack>
      </motion.div>
    </PageShell>
  );
}
