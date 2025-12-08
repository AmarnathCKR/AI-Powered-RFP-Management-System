import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useCreateRfpFromText } from '@/api/rfpApi';
import type { Rfp } from '@/types/models';

const RfpCreatePage = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [createdRfp, setCreatedRfp] = useState<Rfp | null>(null);
  
  const { mutate: createRfp, isPending, error, reset } = useCreateRfpFromText();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    createRfp(
      { text: text.trim() },
      {
        onSuccess: (rfp) => {
          setCreatedRfp(rfp);
        },
      }
    );
  };

  const handleReset = () => {
    setText('');
    setCreatedRfp(null);
    reset();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        Create New RFP
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Describe your procurement needs in natural language and let AI generate a structured RFP.
      </Typography>

      {!createdRfp ? (
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Describe your RFP requirements"
              placeholder="Example: I need to procure 50 laptops for our development team. Requirements include Intel i7 or AMD Ryzen 7 processor, 16GB RAM minimum, 512GB SSD, and 3-year warranty. Budget is around $75,000 and we need delivery within 30 days."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isPending}
              sx={{ mb: 3 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error instanceof Error ? error.message : 'Failed to create RFP'}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!text.trim() || isPending}
              startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
              sx={{ borderRadius: 2 }}
            >
              {isPending ? 'Generating RFP...' : 'Generate RFP with AI'}
            </Button>
          </form>
        </Paper>
      ) : (
        <Box>
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            RFP created successfully!
          </Alert>

          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {createdRfp.title}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {createdRfp.descriptionRaw}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {createdRfp.budget && (
                    <Chip 
                      label={`Budget: ${createdRfp.currency || '$'}${createdRfp.budget.toLocaleString()}`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {createdRfp.deliveryDeadlineDays && (
                    <Chip 
                      label={`Delivery: ${createdRfp.deliveryDeadlineDays} days`}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  {createdRfp.paymentTerms && (
                    <Chip 
                      label={`Payment: ${createdRfp.paymentTerms}`}
                      variant="outlined"
                    />
                  )}
                  {createdRfp.warrantyTerms && (
                    <Chip 
                      label={`Warranty: ${createdRfp.warrantyTerms}`}
                      variant="outlined"
                    />
                  )}
                </Box>

                {createdRfp.requirements?.items?.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Requirements:
                    </Typography>
                    <Stack spacing={1}>
                      {createdRfp.requirements.items.map((item, index) => (
                        <Paper 
                          key={item._id || index} 
                          variant="outlined" 
                          sx={{ p: 1.5, borderRadius: 2 }}
                        >
                          <Typography variant="body2">
                            <strong>{item.quantity}x</strong> {item.name}
                          </Typography>
                          {item.specs && Object.keys(item.specs).length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Specs: {JSON.stringify(item.specs)}
                            </Typography>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(`/rfps/${createdRfp._id}`)}
              sx={{ borderRadius: 2 }}
            >
              Go to RFP
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{ borderRadius: 2 }}
            >
              Create Another
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default RfpCreatePage;
