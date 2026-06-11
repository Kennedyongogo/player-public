import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Alert,
  CircularProgress,
  TextField,
  alpha,
} from "@mui/material";
import { SportsEsports, Groups, AccountBalanceWallet, Lock, Link as LinkIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { getMe, getWalletBalance, joinPublicMatch, createPrivateMatch } from "../api";
import { useAuth } from "../context/AuthContext";
import { parseInviteCode } from "../utils/invite";

const ENTRY_FEES = [
  { value: "10", label: "KSh 10", desc: "Quick casual match" },
  { value: "20", label: "KSh 20", desc: "Standard competition" },
  { value: "50", label: "KSh 50", desc: "High stakes room" },
];

const cardSx = {
  borderRadius: 3,
  bgcolor: "rgba(12,12,20,0.85)",
  border: "1px solid rgba(255,255,255,0.08)",
};

function formatMoney(value) {
  return `KSh ${parseFloat(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

export default function PlayPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [creating, setCreating] = useState(null);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [meRes, balRes] = await Promise.all([getMe(), getWalletBalance()]);
        if (cancelled) return;

        const active = meRes.data?.activeMatch;
        if (active?.matchId) {
          navigate(`/play/${active.matchId}`, { replace: true });
          return;
        }

        setBalance(balRes.data?.balance ?? 0);
      } catch {
        if (!cancelled) setError("Could not load your account. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleJoin = async (entryFee) => {
    setError("");
    setJoining(entryFee);

    try {
      const res = await joinPublicMatch(entryFee);
      const matchId = res.data?.match?.id;
      if (!matchId) throw new Error("Invalid server response");
      navigate(`/play/${matchId}`, { replace: true });
    } catch (err) {
      if (err.status === 402) {
        setError("Insufficient balance. Deposit funds to your wallet first.");
      } else if (err.status === 409) {
        try {
          const meRes = await getMe();
          const matchId = meRes.data?.activeMatch?.matchId;
          if (matchId) {
            navigate(`/play/${matchId}`, { replace: true });
            return;
          }
        } catch {
          /* fall through */
        }
        setError(err.message || "You are already in a match.");
      } else {
        setError(err.message || "Could not join match.");
      }
    } finally {
      setJoining(null);
    }
  };

  const handleCreate = async (entryFee) => {
    setError("");
    setCreating(entryFee);

    try {
      const res = await createPrivateMatch(entryFee);
      const matchId = res.data?.match?.id;
      if (!matchId) throw new Error("Invalid server response");
      navigate(`/play/${matchId}`, { replace: true });
    } catch (err) {
      if (err.status === 402) {
        setError("Insufficient balance. Deposit funds to your wallet first.");
      } else if (err.status === 409) {
        try {
          const meRes = await getMe();
          const matchId = meRes.data?.activeMatch?.matchId;
          if (matchId) {
            navigate(`/play/${matchId}`, { replace: true });
            return;
          }
        } catch {
          /* fall through */
        }
        setError(err.message || "You are already in a match.");
      } else {
        setError(err.message || "Could not create challenge.");
      }
    } finally {
      setCreating(null);
    }
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    const code = parseInviteCode(inviteCodeInput);
    if (!code) return;
    navigate(`/join/${code}`);
  };

  if (loading) {
    return (
      <PageShell>
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: "#F5C518" }} />
        </Box>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <SportsEsports sx={{ color: "#F5C518", fontSize: 28 }} />
              <Typography variant="h5" fontWeight={800}>
                Play
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              Join the public queue or challenge friends with a private invite link. When the room is
              full, the quiz starts automatically.
            </Typography>
          </Box>

          <Card sx={{ ...cardSx, borderColor: alpha("#F5C518", 0.2) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccountBalanceWallet sx={{ color: "#10F0A0" }} />
                  <Typography fontWeight={700}>Wallet balance</Typography>
                </Stack>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#10F0A0" }}>
                  {formatMoney(balance)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {error && (
            <Alert
              severity="error"
              action={
                error.includes("balance") ? (
                  <Button color="inherit" size="small" component={RouterLink} to="/wallet">
                    Deposit
                  </Button>
                ) : null
              }
            >
              {error}
            </Alert>
          )}

          <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
            Public queue
          </Typography>

          <Stack spacing={1.5}>
            {ENTRY_FEES.map((fee) => {
              const amount = parseFloat(fee.value);
              const canAfford = balance != null && balance >= amount;
              const isJoining = joining === fee.value;
              const busy = !!joining || !!creating;

              return (
                <Card
                  key={`public-${fee.value}`}
                  sx={{
                    ...cardSx,
                    transition: "border-color 0.2s",
                    "&:hover": canAfford ? { borderColor: alpha("#F5C518", 0.35) } : {},
                  }}
                >
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          {fee.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {fee.desc}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                          <Groups sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            Same-fee players only · 5 questions · 60s
                          </Typography>
                        </Stack>
                      </Box>
                      <Button
                        variant="contained"
                        disabled={!canAfford || busy}
                        onClick={() => handleJoin(fee.value)}
                        sx={{
                          minWidth: { sm: 140 },
                          bgcolor: "#F5C518",
                          color: "#050508",
                          "&:hover": { bgcolor: "#FFE566" },
                          "&.Mui-disabled": { opacity: 0.5 },
                        }}
                      >
                        {isJoining ? <CircularProgress size={22} sx={{ color: "#050508" }} /> : "Join queue"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ pt: 1 }}>
            Challenge friends
          </Typography>

          <Stack spacing={1.5}>
            {ENTRY_FEES.map((fee) => {
              const amount = parseFloat(fee.value);
              const canAfford = balance != null && balance >= amount;
              const isCreating = creating === fee.value;
              const busy = !!joining || !!creating;

              return (
                <Card
                  key={`private-${fee.value}`}
                  sx={{
                    ...cardSx,
                    borderColor: alpha("#25D366", 0.15),
                    transition: "border-color 0.2s",
                    "&:hover": canAfford ? { borderColor: alpha("#25D366", 0.35) } : {},
                  }}
                >
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                          <Lock sx={{ fontSize: 18, color: "#25D366" }} />
                          <Typography variant="h6" fontWeight={800}>
                            {fee.label} challenge
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Create a private room and share the link on WhatsApp
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        disabled={!canAfford || busy}
                        onClick={() => handleCreate(fee.value)}
                        sx={{
                          minWidth: { sm: 160 },
                          bgcolor: "#25D366",
                          color: "#fff",
                          fontWeight: 700,
                          "&:hover": { bgcolor: "#1EBE5A" },
                          "&.Mui-disabled": { opacity: 0.5 },
                        }}
                      >
                        {isCreating ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Create challenge"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          <Card sx={{ ...cardSx, borderColor: alpha("#8B5CF6", 0.2) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <LinkIcon sx={{ color: "#C4B5FD", fontSize: 20 }} />
                <Typography fontWeight={700}>Have an invite code?</Typography>
              </Stack>
              <Box component="form" onSubmit={handleJoinByCode}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Paste link or code (e.g. A1B2C3D4)"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    inputProps={{ style: { fontFamily: "monospace", letterSpacing: 1 } }}
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    disabled={!inviteCodeInput.trim() || !!joining || !!creating}
                    sx={{ minWidth: { sm: 120 }, whiteSpace: "nowrap" }}
                  >
                    Join
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ bgcolor: alpha("#F5C518", 0.06), color: "text.secondary" }}>
            <Typography variant="body2">
              <strong>Testing tip:</strong> Ask your admin to set &quot;Players per match&quot; to 2 in
              Settings so you can start a match with fewer people.
            </Typography>
          </Alert>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            Logged in as {user?.nickname || "player"}
          </Typography>
        </Stack>
      </motion.div>
    </PageShell>
  );
}
