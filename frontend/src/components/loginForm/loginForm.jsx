import React, { useState } from "react";
import "./loginform.css";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onSubmit, isAdmin, setIsAdmin, setUserName }) => {
  const [isLogin, setIsLogin] = useState(true); // Whether the user is in login or register mode
  const navigate = useNavigate(); // Initialize navigation
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [loading, setLoading] = useState(false); // Prevents multiple submissions

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setEmailError(value && !emailRegex.test(value) ? "Invalid email address." : "");
    }

    if (name === "password" && !isLogin && !isAdmin) {
      setPasswordError(value && !passwordRegex.test(value) ? "Weak password." : "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((emailError || passwordError) && !isLogin && !isAdmin) return;

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
    const endpoint = isLogin
      ? `${baseUrl}/login`  // Corrected to match the Express route for login
      : `${baseUrl}/users/register`;  // Corrected to match the Express route for user registration

    setLoading(true); // Set loading before making the request

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
 
      if (response.ok) {
        const data = await response.json(); // Parse JSON response
        localStorage.setItem("authToken", data.token); // Store token in localStorage
        localStorage.setItem("userId", data.user._id); // Store user ID in localStorage

        // Store user name in localStorage for onboarding (if new client)
        if (!isLogin && !isAdmin) {
          localStorage.setItem("userName", formData.name);
        }

        setSuccessMessage("Form submitted successfully! Redirecting...");
        setErrorMessage(null);

        setTimeout(() => {
          if (!isLogin && !isAdmin) {
            // Redirect to onboarding page for new clients.
            navigate("/onboarding");
          } else {
            // Redirect to either admin dashboard or client dashboard depending on user role
            data.role == "admin" ? navigate("/admin/dashboard") : navigate("/client/dashboard");
          }
        }, 2000); // Delay for UI feedback

      } else {
        setErrorMessage("Something went wrong. Please try again.");
        setSuccessMessage(null);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage("There was an error submitting the form.");
      setSuccessMessage(null);
    } finally {
      setLoading(false); // Stop loading when request is done
    }
  };

  return (
    <div className={`form-container ${isAdmin ? "admin-form-container" : "client-form-container"} ${!isAdmin ? "with-image" : ""}`}>
      <div className="form-content">
        <h2 className="form-title">{isAdmin ? "ADMIN LOGIN" : isLogin ? "CLIENT LOGIN" : "NEW CLIENT ACCOUNT"}</h2>

        {loading && <p className="loading-message">Processing... Please wait.</p>} {/* 🔹 Loading message */}

        {/* User type toggle (Admin/Client) */}
        <div className="user-type-toggle">
          <label>
            <input
              type="radio"
              name="userType"
              value="client"
              checked={!isAdmin}
              onChange={() => setIsAdmin(false)}
            />
            Client
          </label>
          <label>
            <input
              type="radio"
              name="userType"
              value="admin"
              checked={isAdmin}
              onChange={() => setIsAdmin(true)}
            />
            Admin
          </label>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && !isAdmin && (
            <div className="form-field form-input">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
          )}

          <div className="form-field form-input">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
            />
            {emailError && <div className="error-message">{emailError}</div>}
          </div>

          <div className="form-field form-input">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field"
            />
            {!isLogin && !isAdmin && passwordError && <div className="error-message">{passwordError}</div>}
          </div>

          <button
            type="submit"
            className={isAdmin ? "admin-submit-button" : "client-submit-button"}
            disabled={loading}
          >
            {loading ? "Submitting..." : isAdmin ? "Login" : isLogin ? "Login" : "Register"}
          </button>
        </form>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {!isAdmin && (
          <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
