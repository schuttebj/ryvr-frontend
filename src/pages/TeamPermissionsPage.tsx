import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { collaborationApi } from '../services/collaborationApi';
import { format } from 'date-fns';

const TeamPermissionsPage = () => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: '',
    permissions: {
      view: true,
      edit: false,
      approve: false,
      publish: false,
    },
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await collaborationApi.getTeamMembers();
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      await collaborationApi.inviteTeamMember(
        newInvite.email,
        newInvite.role,
        newInvite.permissions
      );
      setShowInviteDialog(false);
      setNewInvite({
        email: '',
        role: '',
        permissions: { view: true, edit: false, approve: false, publish: false },
      });
      loadTeamMembers();
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedMember) return;
    try {
      await collaborationApi.updatePermissions(
        selectedMember.id,
        selectedMember.permissions
      );
      setShowEditDialog(false);
      setSelectedMember(null);
      loadTeamMembers();
    } catch (error) {
      console.error('Failed to update permissions:', error);
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await collaborationApi.removeTeamMember(id);
      loadTeamMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const roleColors: Record<string, string> = {
    'Content Manager': '#5f5eff',
    'Social Media Manager': '#ff6b9d',
    'Email Specialist': '#ffa726',
    'PPC Specialist': '#42a5f5',
    'Intern': '#9e9e9e',
  };

  return (
    <AdminLayout
      title="Team Permissions"
      subtitle="Manage team members, roles, and access control"
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowInviteDialog(true)}
        >
          Invite Team Member
        </Button>
      }
    >
      <Box>
        {/* Summary Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Members
                </Typography>
                <Typography variant="h4">{teamMembers.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Active
                </Typography>
                <Typography variant="h4" color="success.main">
                  {teamMembers.filter(m => m.status === 'active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Pending Invitations
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {teamMembers.filter(m => m.status === 'invited').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Team Members Table */}
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Permissions</TableCell>
                    <TableCell>Businesses</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No team members yet. Invite your first team member to get started.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 40, height: 40 }}>
                              {member.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {member.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.role}
                            size="small"
                            sx={{
                              backgroundColor: roleColors[member.role] || '#9e9e9e',
                              color: '#fff',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {member.permissions.view && (
                              <Chip label="View" size="small" variant="outlined" />
                            )}
                            {member.permissions.edit && (
                              <Chip label="Edit" size="small" variant="outlined" />
                            )}
                            {member.permissions.approve && (
                              <Chip label="Approve" size="small" variant="outlined" />
                            )}
                            {member.permissions.publish && (
                              <Chip label="Publish" size="small" variant="outlined" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {member.businesses.slice(0, 2).join(', ')}
                            {member.businesses.length > 2 && ` +${member.businesses.length - 2} more`}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {member.status === 'active' ? (
                              <>
                                <ActiveIcon fontSize="small" color="success" />
                                <Typography variant="caption" color="success.main">
                                  Active
                                </Typography>
                              </>
                            ) : (
                              <>
                                <PendingIcon fontSize="small" color="warning" />
                                <Typography variant="caption" color="warning.main">
                                  Invited
                                </Typography>
                              </>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(member.lastActive), 'MMM d, yyyy')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowEditDialog(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onClose={() => setShowInviteDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={newInvite.email}
                onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
              />

              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newInvite.role}
                  onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="Content Manager">Content Manager</MenuItem>
                  <MenuItem value="Social Media Manager">Social Media Manager</MenuItem>
                  <MenuItem value="Email Specialist">Email Specialist</MenuItem>
                  <MenuItem value="PPC Specialist">PPC Specialist</MenuItem>
                  <MenuItem value="Intern">Intern</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Permissions
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newInvite.permissions.view}
                        onChange={(e) =>
                          setNewInvite({
                            ...newInvite,
                            permissions: { ...newInvite.permissions, view: e.target.checked },
                          })
                        }
                      />
                    }
                    label="View content"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newInvite.permissions.edit}
                        onChange={(e) =>
                          setNewInvite({
                            ...newInvite,
                            permissions: { ...newInvite.permissions, edit: e.target.checked },
                          })
                        }
                      />
                    }
                    label="Edit content"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newInvite.permissions.approve}
                        onChange={(e) =>
                          setNewInvite({
                            ...newInvite,
                            permissions: { ...newInvite.permissions, approve: e.target.checked },
                          })
                        }
                      />
                    }
                    label="Approve content"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={newInvite.permissions.publish}
                        onChange={(e) =>
                          setNewInvite({
                            ...newInvite,
                            permissions: { ...newInvite.permissions, publish: e.target.checked },
                          })
                        }
                      />
                    }
                    label="Publish content"
                  />
                </FormGroup>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowInviteDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleInvite}
              disabled={!newInvite.email || !newInvite.role}
            >
              Send Invitation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Permissions Dialog */}
        <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Permissions</DialogTitle>
          <DialogContent>
            {selectedMember && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {selectedMember.name} - {selectedMember.role}
                </Typography>
                <FormGroup sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedMember.permissions.view}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            permissions: { ...selectedMember.permissions, view: e.target.checked },
                          })
                        }
                      />
                    }
                    label="View content"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedMember.permissions.edit}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            permissions: { ...selectedMember.permissions, edit: e.target.checked },
                          })
                        }
                      />
                    }
                    label="Edit content"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedMember.permissions.approve}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            permissions: { ...selectedMember.permissions, approve: e.target.checked },
                          })
                        }
                      />
                    }
                    label="Approve content"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedMember.permissions.publish}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            permissions: { ...selectedMember.permissions, publish: e.target.checked },
                          })
                        }
                      />
                    }
                    label="Publish content"
                  />
                </FormGroup>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdatePermissions}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default TeamPermissionsPage;

