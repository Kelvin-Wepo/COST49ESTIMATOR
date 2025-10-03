import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, buildingTypesAPI } from '../../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  buildingTypeId: string;
  area: number;
  estimatedCost?: number;
  status: 'pending' | 'in_progress' | 'completed';
}

interface ProjectFormData {
  name: string;
  description: string;
  buildingTypeId: string;
  area: number;
}

export default function Projects() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    buildingTypeId: '',
    area: 0,
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.getAll();
      return response.data;
    },
  });

  const { data: buildingTypes = [], isLoading: loadingBuildingTypes } = useQuery({
    queryKey: ['buildingTypes'],
    queryFn: async () => {
      const response = await buildingTypesAPI.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectFormData }) =>
      projectsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const estimateMutation = useMutation({
    mutationFn: projectsAPI.estimate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleOpen = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        buildingTypeId: project.buildingTypeId,
        area: project.area,
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        description: '',
        buildingTypeId: '',
        area: 0,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      buildingTypeId: '',
      area: 0,
    });
  };

  const handleSubmit = () => {
    if (editingProject) {
      updateMutation.mutate({
        id: editingProject.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEstimate = (id: string) => {
    estimateMutation.mutate(id);
  };

  if (loadingProjects || loadingBuildingTypes) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading projects...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        {projects.map((project: Project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description}
                </Typography>
                <Typography variant="body2">
                  Area: {project.area} m²
                </Typography>
                {project.estimatedCost && (
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    Estimated Cost: ${project.estimatedCost.toLocaleString()}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    display: 'inline-block',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                    color: 'white',
                    mt: 1,
                  }}
                >
                  {project.status.replace('_', ' ').toUpperCase()}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpen(project)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(project.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
                <Button
                  size="small"
                  onClick={() => handleEstimate(project.id)}
                  disabled={estimateMutation.isPending}
                >
                  Calculate Estimate
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            select
            fullWidth
            label="Building Type"
            value={formData.buildingTypeId}
            onChange={(e) => setFormData({ ...formData, buildingTypeId: e.target.value })}
            margin="normal"
          >
            {buildingTypes.map((type: any) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Area (m²)"
            type="number"
            value={formData.area}
            onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}