import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  Groups as GroupsIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import type { Rfp } from '@/types/models';

interface RfpCardProps {
  rfp: Rfp;
}

const RfpCard = ({ rfp }: RfpCardProps) => {
  const navigate = useNavigate();
  const vendorCount = Array.isArray(rfp.vendors) ? rfp.vendors.length : 0;

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {rfp.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {rfp.descriptionRaw}
        </Typography>

        <Stack spacing={1}>
          {rfp.budget && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon fontSize="small" color="success" />
              <Typography variant="body2">
                Budget: {rfp.currency || '$'}{rfp.budget.toLocaleString()}
              </Typography>
            </Box>
          )}
          
          {rfp.deliveryDeadlineDays && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon fontSize="small" color="warning" />
              <Typography variant="body2">
                Delivery: {rfp.deliveryDeadlineDays} days
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupsIcon fontSize="small" color="info" />
            <Chip 
              label={`${vendorCount} vendor${vendorCount !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
              color={vendorCount > 0 ? 'primary' : 'default'}
            />
          </Box>
        </Stack>
      </CardContent>
      
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button
          variant="contained"
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/rfps/${rfp._id}`)}
          sx={{ borderRadius: 2 }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default RfpCard;
