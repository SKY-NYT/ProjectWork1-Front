import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  Container,
  Slide,
  useTheme,
  alpha,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { useThemeMode } from "../context/ThemeContext";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const AttendanceLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode } = useThemeMode();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session = params.get("session");
    if (session) {
      setSessionId(session);
    } else {
      setError("Attendance session ID missing in URL.");
    }
  }, [location.search]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }
    if (!sessionId) {
      setError("Attendance session ID missing.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = `${API_BASE_URL}/attendance/check?session=${sessionId}`;
      console.log("Checking attendance with URL:", url);
      const response = await axios.post(url, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Attendance check response:", response);
      const result = response.data;
      console.log("Attendance check result:", result);
      Cookies.set("attendanceSession", sessionId, { expires: 1 }); // Store session
      Swal.fire({
        icon: "success",
        title: "Attendance Recorded",
        text: `Welcome, ${result.username || formData.email}!`,
      });
      navigate(`/attendance-success?session=${sessionId}`);
    } catch (err) {
      const message =
        err.response?.data?.message || "Network error. Please try again.";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Attendance Failed",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background:
          mode === "light"
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: { xs: 1, sm: 2 },
        margin: 0,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 2,
        }}
      >
        <Slide
          direction="up"
          in={true}
          mountOnEnter
          unmountOnExit
          timeout={800}
        >
          <Card
            sx={{
              width: { xs: "90%", sm: 400, md: 420 },
              maxWidth: 420,
              borderRadius: 3,
              boxShadow:
                mode === "light"
                  ? "0 20px 60px rgba(0,0,0,0.12)"
                  : "0 20px 60px rgba(0,0,0,0.4)",
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                boxShadow:
                  mode === "light"
                    ? "0 25px 80px rgba(0,0,0,0.15)"
                    : "0 25px 80px rgba(0,0,0,0.5)",
                transform: "translateY(-2px)",
              },
            }}
            elevation={0}
          >
            <CardHeader
              title="Attendance Login"
              subheader={
                sessionId
                  ? `Session: ${sessionId}`
                  : "Attendance session not found"
              }
              titleTypographyProps={{ variant: "h5", fontWeight: "bold" }}
              sx={{ textAlign: "center", pb: 1 }}
            />
            <CardContent sx={{ px: 3, pb: 2 }}>
              <form onSubmit={handleSubmit}>
                <Box mb={2}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    value={formData.email}
                    onChange={handleChange("email")}
                    disabled={loading}
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box mb={2}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={formData.password}
                    onChange={handleChange("password")}
                    disabled={loading}
                    size="medium"
                    autoComplete="current-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            disabled={loading}
                            size="small"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            tabIndex={-1}
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={
                    loading && <CircularProgress size={20} color="inherit" />
                  }
                  sx={{
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: 2,
                    background:
                      mode === "light"
                        ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                        : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    "&:hover": {
                      background:
                        mode === "light"
                          ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`
                          : `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      transform: "translateY(-1px)",
                      boxShadow:
                        mode === "light"
                          ? "0 8px 25px rgba(37, 99, 235, 0.3)"
                          : "0 8px 25px rgba(59, 130, 246, 0.4)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  {loading ? "Logging In..." : "Login & Mark Attendance"}
                </Button>
              </form>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pt: 0, pb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Attendance is only for registered users.
              </Typography>
            </CardActions>
          </Card>
        </Slide>
      </Container>
    </Box>
  );
};

export default AttendanceLogin;
