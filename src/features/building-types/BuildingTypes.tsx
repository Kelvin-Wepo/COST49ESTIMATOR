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
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildingTypesAPI } from '../../services/api';

interface BuildingType {
  id: string;
  name: string;
  description: string;
  estimationFormula: string;
}

interface BuildingTypeFormData {
  name: string;
  description: string;
  estimationFormula: string;
}

export default function BuildingTypes() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingBuildingType, setEditingBuildingType] = useState<BuildingType | null>(null);
  const [formData, setFormData] = useState<BuildingTypeFormData>({
    name: '',
    description: '',
    estimationFormula: '',
  });

  const { data: buildingTypes = [], isLoading } = useQuery({
    queryKey: ['buildingTypes'],
    queryFn: async () => {
      const response = await buildingTypesAPI.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: buildingTypesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingTypes'] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BuildingTypeFormData }) =>
      buildingTypesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingTypes'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: buildingTypesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildingTypes'] });
    },
  });

  const handleOpen = (buildingType?: BuildingType) => {
    if (buildingType) {
      setEditingBuildingType(buildingType);
      setFormData({
        name: buildingType.name,
        description: buildingType.description,
        estimationFormula: buildingType.estimationFormula,
      });
    } else {
      setEditingBuildingType(null);
      setFormData({
        name: '',
        description: '',
        estimationFormula: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingBuildingType(null);
    setFormData({
      name: '',
      description: '',
      estimationFormula: '',
    });
  };

  const handleSubmit = () => {
    if (editingBuildingType) {
      updateMutation.mutate({
        id: editingBuildingType.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this building type?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading building types...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Building Types</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Building Type
        </Button>
      </Box>

      <Grid container spacing={3}>
        {buildingTypes.map((buildingType: BuildingType) => (
          <Grid item xs={12} sm={6} md={4} key={buildingType.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {buildingType.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {buildingType.description}
                </Typography>
                <Typography variant="caption" display="block">
                  Formula: {buildingType.estimationFormula}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpen(buildingType)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(buildingType.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBuildingType ? 'Edit Building Type' : 'Add New Building Type'}
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
            fullWidth
            label="Estimation Formula"
            value={formData.estimationFormula}
            onChange={(e) => setFormData({ ...formData, estimationFormula: e.target.value })}
            margin="normal"
            helperText="Enter the formula used for cost estimation"
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