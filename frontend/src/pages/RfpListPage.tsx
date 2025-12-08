import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRfps } from '@/api/rfpApi';
import RfpCard from '@/components/RfpCard';

const RfpListPage = () => {
  const navigate = useNavigate();
  const { data: rfps, isLoading, error } = useRfps();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load RFPs: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            RFP Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your requests for proposals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/rfps/new')}
          size="large"
          sx={{ borderRadius: 2 }}
        >
          Create RFP
        </Button>
      </Box>

      {rfps && rfps.length > 0 ? (
        <Grid container spacing={3}>
          {rfps.map((rfp) => (
            <Grid key={rfp._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <RfpCard rfp={rfp} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            borderRadius: 3,
            bgcolor: 'grey.50',
          }}
        >
          <DescriptionIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No RFPs yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first RFP using natural language and let AI structure it for you.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/rfps/new')}
          >
            Create Your First RFP
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default RfpListPage;
