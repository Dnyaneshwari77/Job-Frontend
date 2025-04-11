// src/components/AddJob.js
import React, { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddJob = () => {
  const [form, setForm] = useState({
    company: "",
    position: "",
    status: "pending",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/job",
        form,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Job added successfully!");
      setForm({ company: "", position: "", status: "pending" });
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add job");
      if (err.response?.status === 401) navigate("/login");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>
        Add New Job
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          name="company"
          label="Company"
          fullWidth
          value={form.company}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          name="position"
          label="Position"
          fullWidth
          value={form.position}
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          name="status"
          label="Status"
          fullWidth
          select
          SelectProps={{ native: true }}
          value={form.status}
          onChange={handleChange}
          margin="normal"
        >
          <option value="pending">Pending</option>
          <option value="interview">Interview</option>
          <option value="declined">Declined</option>
        </TextField>
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Add Job
        </Button>
      </form>
    </Box>
  );
};

export default AddJob;
