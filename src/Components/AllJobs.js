import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Card,
  CardContent,
  Grid,
  Modal,
  Backdrop,
  Fade,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

// ✅ Don't use dotenv in frontend React
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    company: "",
    position: "",
    status: "pending",
  });

  const fetchJobs = async () => {
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await axios.get(`${API_BASE_URL}/job`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });
      setJobs(res.data.jobs);
      setError("");
    } catch (err) {
      console.error("Failed to fetch jobs:", err.message);
      if (err.response?.status === 401) navigate("/login");
      setError(err.response?.data?.msg || "Failed to fetch jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, dateFilter]);

  const handleJobClick = async (jobId) => {
    setModalLoading(true);
    setModalOpen(true);
    setEditMode(false);
    try {
      const res = await axios.get(`${API_BASE_URL}/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const jobData = res.data.job || res.data.singleJob;
      if (!jobData) throw new Error("Job data not found");
      setSelectedJob(jobData);
      setEditForm({
        company: jobData.company,
        position: jobData.position,
        status: jobData.status,
      });
    } catch (err) {
      console.error(
        "Error fetching job details:",
        err.response?.data || err.message
      );
      if (err.response?.status === 401) navigate("/login");
      setSelectedJob(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedJob(null);
    setEditMode(false);
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.patch(`${API_BASE_URL}/job/${selectedJob._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleClose();
      fetchJobs();
    } catch (err) {
      console.error("Error updating job:", err.response?.data || err.message);
      if (err.response?.status === 401) navigate("/login");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/job/${selectedJob._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleClose();
      fetchJobs();
    } catch (err) {
      console.error("Error deleting job:", err.response?.data || err.message);
      if (err.response?.status === 401) navigate("/login");
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Job Listings
      </Typography>

      <Box display="flex" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="interview">Interview</MenuItem>
            <MenuItem value="declined">Declined</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Filter by Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </Box>

      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={2}>
        {jobs.length ? (
          jobs.map((job) => (
            <Grid item xs={12} md={6} key={job._id}>
              <Card
                onClick={() => handleJobClick(job._id)}
                sx={{ cursor: "pointer", p: 1 }}
              >
                <CardContent>
                  <Typography variant="h6">
                    {job.position} @ {job.company}
                  </Typography>
                  <Typography>Status: {job.status}</Typography>
                  <Typography>
                    Created: {new Date(job.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>No jobs found.</Typography>
        )}
      </Grid>

      <Modal
        open={modalOpen}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={modalOpen}>
          <Box sx={modalStyle}>
            {modalLoading ? (
              <CircularProgress />
            ) : selectedJob ? (
              <>
                {editMode ? (
                  <>
                    <TextField
                      label="Company"
                      name="company"
                      fullWidth
                      margin="normal"
                      value={editForm.company}
                      onChange={handleChange}
                    />
                    <TextField
                      label="Position"
                      name="position"
                      fullWidth
                      margin="normal"
                      value={editForm.position}
                      onChange={handleChange}
                    />
                    <TextField
                      label="Status"
                      name="status"
                      fullWidth
                      margin="normal"
                      value={editForm.status}
                      onChange={handleChange}
                    />
                    <Box mt={2} display="flex" justifyContent="space-between">
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                      <Button color="error" onClick={handleClose}>
                        Cancel
                      </Button>
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {selectedJob.position} @ {selectedJob.company}
                    </Typography>
                    <Typography>Status: {selectedJob.status}</Typography>
                    <Typography mt={1}>
                      Created:{" "}
                      {new Date(selectedJob.createdAt).toLocaleString()}
                    </Typography>
                   
                    <Box mt={2} display="flex" justifyContent="space-between">
                      <IconButton onClick={handleEdit} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={handleDelete} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <Typography color="error">Failed to load job details.</Typography>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default AllJobs;
