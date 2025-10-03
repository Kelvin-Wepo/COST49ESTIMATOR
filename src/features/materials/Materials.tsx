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
import { materialsAPI } from '../../services/api';

interface Material {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  description: string;
}

interface MaterialFormData {
  name: string;
  unit: string;
  pricePerUnit: number;
  description: string;
}

export default function Materials() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    unit: '',
    pricePerUnit: 0,
    description: '',
  });

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: async () => {
      const response = await materialsAPI.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: materialsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MaterialFormData }) =>
      materialsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: materialsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const handleOpen = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        unit: material.unit,
        pricePerUnit: material.pricePerUnit,
        description: material.description,
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        name: '',
        unit: '',
        pricePerUnit: 0,
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMaterial(null);
    setFormData({
      name: '',
      unit: '',
      pricePerUnit: 0,
      description: '',
    });
  };

  const handleSubmit = () => {
    if (editingMaterial) {
      updateMutation.mutate({
        id: editingMaterial.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading materials...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Materials</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Material
        </Button>
      </Box>

      <Grid container spacing={3}>
        {materials.map((material: Material) => (
          <Grid item xs={12} sm={6} md={4} key={material.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {material.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {material.unit} - ${material.pricePerUnit}
                </Typography>
                <Typography variant="body2">{material.description}</Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpen(material)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(material.id)}
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
          {editingMaterial ? 'Edit Material' : 'Add New Material'}
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
            label="Unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Price per Unit"
            type="number"
            value={formData.pricePerUnit}
            onChange={(e) =>
              setFormData({ ...formData, pricePerUnit: Number(e.target.value) })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={3}
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