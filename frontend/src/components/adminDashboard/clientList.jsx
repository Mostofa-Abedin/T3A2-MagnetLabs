import React, { useState } from "react";
import {
  CContainer,
  CCard,
  CCardHeader,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CFormInput,
  CAlert,
} from "@coreui/react";
import { Link } from "react-router-dom";

const ClientsList = ({ clients, setClients, businesses, setBusinesses }) => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const token = localStorage.getItem("authToken");

  // Filter clients (users with role "client")
  const clientList = clients.filter((user) => user.role === "client");

  // Helper: Get the business record for a client (if available)
  const getBusinessForClient = (clientId) => {
    // Look for a business where userId is either a string or an object with _id matching clientId
    return businesses.find((bus) => {
      if (!bus.userId) return false;
      // bus.userId may be an object or a string
      if (typeof bus.userId === "object" && bus.userId._id) {
        return bus.userId._id === clientId;
      }
      return bus.userId === clientId;
    }) || {};
  };

  // Modal state for Add/Edit functionality
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"
  const [currentItem, setCurrentItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // For editing, find the current business record for the selected client (if any)
  const currentBusiness =
    modalType === "edit" && currentItem && businesses
      ? getBusinessForClient(currentItem._id)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.target);
    // Collect user data
    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: "client",
      ...(modalType === "add" && { password: formData.get("password") }),
    };

    // Collect business data
    const businessData = {
      businessName: formData.get("businessName"),
      industry: formData.get("industry"),
      website: formData.get("website"),
      phone: formData.get("phone"),
      address: formData.get("address"),
    };

    // Basic validation – require all fields
    if (
      !userData.name ||
      !userData.email ||
      (!userData.password && modalType === "add") ||
      !businessData.businessName ||
      !businessData.industry ||
      !businessData.website ||
      !businessData.phone ||
      !businessData.address
    ) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    try {
      let updatedUser;
      if (modalType === "add") {
        // Create the new user
        const userRes = await fetch(`${baseUrl}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        });
        if (!userRes.ok) {
          const errText = await userRes.text();
          throw new Error("Failed to create user: " + errText);
        }
        updatedUser = await userRes.json();

        // Create the business record using the new user's ID in the payload.
        const businessPayload = { ...businessData, userId: updatedUser._id };
        const bizRes = await fetch(`${baseUrl}/business`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(businessPayload),
        });
        if (!bizRes.ok) {
          const errText = await bizRes.text();
          throw new Error("Failed to create business: " + errText);
        }
        const bizData = await bizRes.json();

        // Merge business details into the user object for local display.
        updatedUser.business = bizData.business;

        // Update local states.
        setClients((prev) => [...prev, updatedUser]);
        setBusinesses((prev) => [...prev, bizData.business]);
      } else if (modalType === "edit" && currentItem) {
        // Update user details.
        const userPatchRes = await fetch(
          `${baseUrl}/users/${currentItem._id}/profile`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
          }
        );
        if (!userPatchRes.ok) {
          const errText = await userPatchRes.text();
          throw new Error("Failed to update user: " + errText);
        }
        const patchedUser = await userPatchRes.json();
        updatedUser = patchedUser.user ? patchedUser.user : patchedUser;

        // Update or create the business record.
        if (currentBusiness && currentBusiness._id) {
          // Update existing business via PATCH.
          const bizPatchRes = await fetch(
            `${baseUrl}/business/${currentBusiness._id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(businessData),
            }
          );
          if (!bizPatchRes.ok) {
            const errText = await bizPatchRes.text();
            throw new Error("Failed to update business: " + errText);
          }
          const bizPatchData = await bizPatchRes.json();
          updatedUser.business = bizPatchData.business;
          // Update businesses state.
          setBusinesses((prev) =>
            prev.map((bus) =>
              bus._id === currentBusiness._id ? bizPatchData.business : bus
            )
          );
        } else {
          // No business exists—create one.
          const businessPayload = { ...businessData, userId: currentItem._id };
          const bizRes = await fetch(`${baseUrl}/business`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(businessPayload),
          });
          if (!bizRes.ok) {
            const errText = await bizRes.text();
            throw new Error("Failed to create business: " + errText);
          }
          const bizData = await bizRes.json();
          updatedUser.business = bizData.business;
          setBusinesses((prev) => [...prev, bizData.business]);
        }
        // Update clients state with the patched user.
        setClients((prev) =>
          prev.map((client) =>
            client._id === currentItem._id ? { ...client, ...updatedUser } : client
          )
        );
      }

      setModalVisible(false);
      setCurrentItem(null);
    } catch (error) {
      console.error("Error saving user:", error);
      setErrorMessage("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error("Failed to delete user: " + errText);
      }
      setClients((prev) => prev.filter((client) => client._id !== id));
      // Remove associated business from state.
      setBusinesses((prev) =>
        prev.filter((bus) => {
          // Check if bus.userId is an object with _id, or a string
          if (bus.userId && typeof bus.userId === "object" && bus.userId._id) {
            return bus.userId._id !== id;
          }
          return bus.userId !== id;
        })
      );
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <CContainer fluid>
      <Link to="/admin/dashboard">
        <CButton className="dashboard-button">Back to Dashboard</CButton>
      </Link>

      {errorMessage && <CAlert color="danger">{errorMessage}</CAlert>}

      <CCard>
        <CCardHeader>
          <h4>All Clients</h4>
          <CButton
            data-testid="add-client-button"
            onClick={() => {
              setModalType("add");
              setCurrentItem(null);
              setModalVisible(true);
            }}
          >
            Add Client
          </CButton>
        </CCardHeader>
        <CCardBody>
          <CRow>
            {clientList.length > 0 ? (
              clientList.map((client) => {
                const business = getBusinessForClient(client._id);
                return (
                  <CCol md="4" key={client._id}>
                    <CCard className="client-card">
                      <CCardBody>
                        <h5>{client.name}</h5>
                        <p>
                          Business Name:{" "}
                          {business.businessName || "N/A"}
                        </p>
                        <p>
                          Phone: {business.phone || "N/A"}
                        </p>
                        <p>Email: {client.email}</p>
                        <CButton
                          onClick={() => {
                            setModalType("edit");
                            setCurrentItem(client);
                            setModalVisible(true);
                          }}
                        >
                          Edit
                        </CButton>
                        <CButton onClick={() => handleDelete(client._id)}>
                          Delete
                        </CButton>
                      </CCardBody>
                    </CCard>
                  </CCol>
                );
              })
            ) : (
              <p>No clients found.</p>
            )}
          </CRow>
        </CCardBody>
      </CCard>

      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>
            {modalType === "edit" ? "Edit Client" : "Add Client"}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <form
            onSubmit={handleSubmit}
            key={currentItem ? currentItem._id : "new"}
          >
            <CFormInput
              type="text"
              label="Name"
              name="name"
              defaultValue={currentItem?.name || ""}
            />
            <CFormInput
              type="email"
              label="Email"
              name="email"
              defaultValue={currentItem?.email || ""}
            />
            {modalType === "add" && (
              <CFormInput
                type="password"
                label="Password"
                name="password"
              />
            )}
            <CFormInput
              type="text"
              label="Business Name"
              name="businessName"
              defaultValue={currentBusiness?.businessName || ""}
            />
            <CFormInput
              type="text"
              label="Industry"
              name="industry"
              defaultValue={currentBusiness?.industry || ""}
            />
            <CFormInput
              type="text"
              label="Website"
              name="website"
              defaultValue={currentBusiness?.website || ""}
            />
            <CFormInput
              type="text"
              label="Phone"
              name="phone"
              defaultValue={currentBusiness?.phone || ""}
            />
            <CFormInput
              type="text"
              label="Address"
              name="address"
              defaultValue={currentBusiness?.address || ""}
            />
            <CModalFooter>
              <CButton onClick={() => setModalVisible(false)}>
                Close
              </CButton>
              <CButton type="submit">Save Changes</CButton>
            </CModalFooter>
          </form>
        </CModalBody>
      </CModal>
    </CContainer>
  );
};

export default ClientsList;
