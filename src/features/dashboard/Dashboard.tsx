import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import { materialsAPI, buildingTypesAPI, projectsAPI } from '../../services/api';

export default function Dashboard() {
  const { data: materials, isLoading: loadingMaterials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialsAPI.getAll(),
  });

  const { data: buildingTypes, isLoading: loadingBuildingTypes } = useQuery({
    queryKey: ['buildingTypes'],
    queryFn: () => buildingTypesAPI.getAll(),
  });

  const { data: projects, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll(),
  });

  if (loadingMaterials || loadingBuildingTypes || loadingProjects) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const stats = [
    {
      title: 'Total Materials',
      value: materials?.data?.length || 0,
      description: 'Available construction materials',
    },
    {
      title: 'Building Types',
      value: buildingTypes?.data?.length || 0,
      description: 'Different types of buildings',
    },
    {
      title: 'Active Projects',
      value: projects?.data?.length || 0,
      description: 'Ongoing estimation projects',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ mb: 2, color: 'primary.main' }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}