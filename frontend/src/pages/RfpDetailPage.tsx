import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Autocomplete,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  Compare as CompareIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRfp, useAttachVendors, useSendRfpEmails } from '@/api/rfpApi';
import { useVendors } from '@/api/vendorApi';
import { useProposals, useCompareProposals, useCreateProposalFromEmail } from '@/api/proposalApi';
import type { Vendor, CompareProposalsResponse } from '@/types/models';

const RfpDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 🔁 NEW: matches backend comparison response shape
  const [comparison, setComparison] = useState<CompareProposalsResponse | null>(null);

  // Email simulation form
  const [emailForm, setEmailForm] = useState({
    vendorEmail: '',
    subject: '',
    body: '',
  });

  const { data: rfp, isLoading: rfpLoading, error: rfpError } = useRfp(id!);
  const { data: vendors } = useVendors();
  const { data: proposals, isLoading: proposalsLoading, refetch: refetchProposals } = useProposals(id!);
  const { refetch: fetchComparison, isFetching: isComparing } = useCompareProposals(id!);

  const { mutate: attachVendors, isPending: isAttaching } = useAttachVendors(id!);
  const { mutate: sendEmails, isPending: isSending } = useSendRfpEmails(id!);
  const { mutate: createProposal, isPending: isCreatingProposal } = useCreateProposalFromEmail(id!);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAttachVendors = () => {
    if (selectedVendorIds.length === 0) return;
    attachVendors(
      { vendorIds: selectedVendorIds },
      {
        onSuccess: () => {
          showSnackbar('Vendors attached successfully!', 'success');
          setSelectedVendorIds([]);
        },
        onError: (error) => {
          showSnackbar(error instanceof Error ? error.message : 'Failed to attach vendors', 'error');
        },
      }
    );
  };

  const handleSendEmails = () => {
    sendEmails(undefined, {
      onSuccess: (data) => {
        showSnackbar(`Emails sent to ${data.sent.length} vendor(s)!`, 'success');
      },
      onError: (error) => {
        showSnackbar(error instanceof Error ? error.message : 'Failed to send emails', 'error');
      },
    });
  };

  // 🔁 UPDATED: handleCompare for new response shape
  const handleCompare = async () => {
    const result = await fetchComparison();
    // assuming useCompareProposals returns CompareProposalsResponse directly
    if (result.data) {
      setComparison(result.data as CompareProposalsResponse);
    }
  };

  const handleCreateProposalFromEmail = () => {
    if (!emailForm.vendorEmail || !emailForm.subject || !emailForm.body) return;
    createProposal(emailForm, {
      onSuccess: () => {
        showSnackbar('Proposal created from email!', 'success');
        setEmailForm({ vendorEmail: '', subject: '', body: '' });
      },
      onError: (error) => {
        showSnackbar(error instanceof Error ? error.message : 'Failed to create proposal', 'error');
      },
    });
  };

  if (rfpLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (rfpError || !rfp) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load RFP: {rfpError instanceof Error ? rfpError.message : 'Unknown error'}
      </Alert>
    );
  }

  // Get attached vendor objects
  const attachedVendors: Vendor[] =
    rfp.vendors?.filter((v): v is Vendor => typeof v === 'object' && v !== null) || [];

  // Available vendors to attach (not already attached)
  const attachedVendorIds = attachedVendors.map((v) => v._id);
  const availableVendors = vendors?.filter((v) => !attachedVendorIds.includes(v._id)) || [];

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/rfps')} sx={{ mb: 2 }}>
        Back to RFPs
      </Button>

      {/* RFP Overview */}
      <Card sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {rfp.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {rfp.descriptionRaw}
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
            {rfp.budget && (
              <Chip label={`Budget: ${rfp.currency || '$'}${rfp.budget.toLocaleString()}`} color="success" />
            )}
            {rfp.deliveryDeadlineDays && (
              <Chip label={`Delivery: ${rfp.deliveryDeadlineDays} days`} color="warning" />
            )}
            {rfp.paymentTerms && <Chip label={`Payment: ${rfp.paymentTerms}`} />}
            {rfp.warrantyTerms && <Chip label={`Warranty: ${rfp.warrantyTerms}`} />}
          </Stack>

          {rfp.requirements?.items?.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Requirements
              </Typography>
              <Stack spacing={1}>
                {rfp.requirements.items.map((item, index) => (
                  <Paper key={item._id || index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                      <strong>{item.quantity}x</strong> {item.name}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      {/* Vendor Selection */}
      <Accordion defaultExpanded sx={{ borderRadius: 3, mb: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            Vendor Selection ({attachedVendors.length} attached)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {attachedVendors.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attached Vendors:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {attachedVendors.map((vendor) => (
                  <Chip key={vendor._id} label={vendor.name} color="primary" />
                ))}
              </Stack>
            </Box>
          )}

          <Typography variant="subtitle2" gutterBottom>
            Add More Vendors:
          </Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Autocomplete
              multiple
              options={availableVendors}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={availableVendors.filter((v) => selectedVendorIds.includes(v._id))}
              onChange={(_, newValue) => setSelectedVendorIds(newValue.map((v) => v._id))}
              renderInput={(params) => (
                <TextField {...params} label="Select vendors" placeholder="Choose vendors..." />
              )}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleAttachVendors}
              disabled={selectedVendorIds.length === 0 || isAttaching}
              startIcon={isAttaching ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Attach
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Send RFP Emails */}
      <Accordion sx={{ borderRadius: 3, mb: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            Send RFP Emails
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send the RFP to all attached vendors via email.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={isSending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            onClick={handleSendEmails}
            disabled={attachedVendors.length === 0 || isSending}
          >
            {isSending ? 'Sending...' : `Send to ${attachedVendors.length} Vendor(s)`}
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Proposals Section */}
      <Accordion sx={{ borderRadius: 3, mb: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            Proposals ({proposals?.length || 0})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            <Box>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refetchProposals()}
                disabled={proposalsLoading}
              >
                Refresh Proposals
              </Button>
            </Box>

            {proposals && proposals.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vendor</TableCell>
                      <TableCell>Total Price</TableCell>
                      <TableCell>Delivery Days</TableCell>
                      <TableCell>Warranty</TableCell>
                      <TableCell>Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {proposals.map((proposal) => {
                      const vendorName =
                        typeof proposal.vendor === 'object' ? proposal.vendor.name : 'Unknown';
                      return (
                        <TableRow key={proposal._id}>
                          <TableCell>{vendorName}</TableCell>
                          <TableCell>
                            {proposal.parsedData?.totalPrice
                              ? `${proposal.parsedData.currency || '$'}${proposal.parsedData.totalPrice.toLocaleString()}`
                              : '—'}
                          </TableCell>
                          <TableCell>{proposal.parsedData?.deliveryDays || '—'}</TableCell>
                          <TableCell>
                            {proposal.parsedData?.warrantyYears
                              ? `${proposal.parsedData.warrantyYears} year(s)`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {proposal.score !== undefined ? (
                              <Chip
                                label={proposal.score}
                                size="small"
                                color={
                                  proposal.score >= 80
                                    ? 'success'
                                    : proposal.score >= 60
                                    ? 'warning'
                                    : 'default'
                                }
                              />
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No proposals received yet.</Alert>
            )}

            {/* Simulate Email Input */}
            <Divider />
            <Typography variant="subtitle2" fontWeight={600}>
              <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Simulate Inbound Email (for testing)
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Vendor Email"
                size="small"
                value={emailForm.vendorEmail}
                onChange={(e) => setEmailForm({ ...emailForm, vendorEmail: e.target.value })}
              />
              <TextField
                label="Subject"
                size="small"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                placeholder={`Re: RFP [RFP-ID:${id}]`}
              />
              <TextField
                label="Email Body"
                multiline
                rows={4}
                value={emailForm.body}
                onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                placeholder="Enter the vendor's proposal email content..."
              />
              <Button
                variant="outlined"
                onClick={handleCreateProposalFromEmail}
                disabled={
                  !emailForm.vendorEmail || !emailForm.subject || !emailForm.body || isCreatingProposal
                }
                startIcon={isCreatingProposal ? <CircularProgress size={16} /> : <EmailIcon />}
              >
                Create Proposal from Email
              </Button>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* 🔁 AI Comparison (updated for new response shape) */}
      <Accordion sx={{ borderRadius: 3, mb: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" fontWeight={600}>
            AI Comparison
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            variant="contained"
            color="secondary"
            startIcon={isComparing ? <CircularProgress size={16} color="inherit" /> : <CompareIcon />}
            onClick={handleCompare}
            disabled={!proposals || proposals.length === 0 || isComparing}
            sx={{ mb: 3 }}
          >
            {isComparing ? 'Analyzing...' : 'Run AI Comparison'}
          </Button>

          {comparison && (
            <Stack spacing={3}>
              {/* Summary + fallback indicator */}
              <Alert
                severity={comparison.usingFallback ? 'warning' : 'info'}
                icon={comparison.usingFallback ? <RefreshIcon /> : <StarIcon />}
                sx={{ borderRadius: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {comparison.usingFallback
                    ? 'Heuristic Comparison (Fallback)'
                    : 'AI Comparison'}
                </Typography>
                <Typography variant="body2">{comparison.summary}</Typography>
              </Alert>

              {/* Recommended vendor (if any) */}
              {comparison.recommendation && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <StarIcon color="warning" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Recommended Vendor: {comparison.recommendation.vendorName}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {comparison.recommendation.reason}
                  </Typography>
                </Paper>
              )}

              {/* Scores table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>Vendor</TableCell>
                      <TableCell align="right">Price Score</TableCell>
                      <TableCell align="right">Delivery Score</TableCell>
                      <TableCell align="right">Warranty Score</TableCell>
                      <TableCell align="right">Overall Score</TableCell>
                      <TableCell>Highlights</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {comparison.scores.map((item) => (
                      <TableRow
                        key={item.proposalId}
                        sx={{
                          bgcolor:
                            comparison.recommendation &&
                            item.proposalId === comparison.recommendation.proposalId
                              ? 'success.light'
                              : 'inherit',
                        }}
                      >
                        <TableCell>
                          {item.vendorName}
                          {comparison.recommendation &&
                            item.proposalId === comparison.recommendation.proposalId && (
                              <CheckCircleIcon
                                color="success"
                                sx={{ ml: 1, verticalAlign: 'middle', fontSize: 18 }}
                              />
                            )}
                        </TableCell>
                        <TableCell align="right">{item.priceScore.toFixed(1)}</TableCell>
                        <TableCell align="right">{item.deliveryScore.toFixed(1)}</TableCell>
                        <TableCell align="right">{item.warrantyScore.toFixed(1)}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={item.overallScore.toFixed(1)}
                            size="small"
                            color={
                              item.overallScore >= 8
                                ? 'success'
                                : item.overallScore >= 6
                                ? 'warning'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>{item.highlights}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RfpDetailPage;
