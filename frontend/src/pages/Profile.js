import React, { useState, useEffect } from "react";
// API
import { axiosReq } from "../api/axiosDefaults";
// Hooks
import useAuthStatus from "../hooks/useAuthStatus";
// Components
import AccountAlerts from "../components/AccountAlerts";
// Styling & Images
import styles from "../styles/Profile.module.css";
import inputStyles from "../styles/ServiceManagement.module.css";
import modalStyles from "../styles/Modals.module.css";
import passwordInput from "../styles/Register.module.css";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Image,
  Modal,
  Alert,
} from "react-bootstrap";
import ProfileImageText from "../assets/images/Profile.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

function Profile() {
  useAuthStatus();

  const [profileData, setProfileData] = useState(null);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data } = await axiosReq.get("/accounts/profile/");
        setProfileData(data);
        setImagePreview(data.profile_image);
        setIsAdmin(data.is_staff || data.is_superuser);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setLoading(false);
        if (err.response && err.response.status === 401) {
          window.location.href = "/login";
        }
      }
    };
    fetchProfileData();
  }, []);

  // Handle changes in profile form
  const handleProfileChange = (event) => {
    setProfileData({
      ...profileData,
      [event.target.name]: event.target.value,
    });
  };

  // Handle profile image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileData({
        ...profileData,
        profile_image: file,
      });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle profile update submission
  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("username", profileData.username);
    formData.append("email", profileData.email);
    formData.append("name", profileData.name);
    formData.append("surname", profileData.surname);
    formData.append("phone_number", profileData.phone_number);

    // Check if a new image is uploaded
    const isNewImage = profileData.profile_image instanceof File;

    if (isNewImage) {
      formData.append("profile_image", profileData.profile_image);
    }

    try {
      const { data } = await axiosReq.put("/accounts/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProfileData(data);
      setSuccessMessage("Profile updated successfully!");

      // Reload the page if a new image is uploaded
      if (isNewImage) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    }
  };

  // Handle changes in password form inputs
  const handlePasswordChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  // Handle password change submission
  const handleChangePassword = async (event) => {
    event.preventDefault();
    try {
      await axiosReq.put("/accounts/change-password/", passwordData);
      setSuccessMessage("Password updated successfully!");
      setPasswordData({ old_password: "", new_password: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    try {
      await axiosReq.delete("/accounts/delete-account/", {
        data: { password: deletePassword },
      });
      setSuccessMessage("Account deleted successfully!");
      // Log out the user and redirect to login page
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    } catch (err) {
      console.error("Error deleting account:", err);
      if (err.response && err.response.data) {
        setErrors(err.response.data);
      }
    }
  };

  // Display loading state if data is not fetched yet
  if (loading) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={3}>
            <h3 className={styles.loadingProfile}>Loading Profile...</h3>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className={styles.profilePage}>
      <AccountAlerts
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
      <Container fluid>
        {/* Profile Header Image Text */}
        <Row className="justify-content-center">
          <img
            src={ProfileImageText}
            alt="Profile"
            className={styles.profileImageText}
          />
        </Row>

        {isAdmin && (
          <Row className="justify-content-center mt-4">
            <Col md={6} className="text-center">
              <Alert variant="info">
                In the Demo version, I have disabled the Profile editing and
                deletion of the Admin user. To try this functionality, please
                register a new user.
              </Alert>
            </Col>
          </Row>
        )}

        <Row className="justify-content-center">
          <Col md={7}>
            {/* Display any errors */}
            {errors.non_field_errors && (
              <Alert variant="danger">{errors.non_field_errors}</Alert>
            )}

            {/* Profile Update Form */}
            <Form onSubmit={handleProfileUpdate}>
              <Row className="justify-content-center align-items-center">
                <Col xs="auto" className="text-center">
                  {/* Profile Image */}
                  <Form.Group
                    className={`mb-4 ${styles.imageUploadGroup}`}
                  >
                    <label
                      htmlFor="profileImageInput"
                      className={styles.imageUploadLabel}
                    >
                      <Image
                        src={imagePreview || "default_image_url"}
                        roundedCircle
                        width={100}
                        height={100}
                        alt="Profile"
                        className={`${styles.profileImage}`}
                      />
                      <span className={styles.hoverText}>Choose Image</span>
                    </label>
                    <Form.Control
                      type="file"
                      id="profileImageInput"
                      name="profile_image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="d-none"
                      disabled={isAdmin}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Profile Details */}
              <Row>
                <Col className={`${styles.formContainer}`}>
                  <h3 className="text-center">Update Profile</h3>
                  <Form.Group>
                    <Form.Label className={`${inputStyles["form-label"]} mt-2`}>
                      Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={profileData.name || ""}
                      onChange={handleProfileChange}
                      className={`${inputStyles["form-input"]}`}
                      disabled={isAdmin}
                    />
                    {errors.name && (
                      <div className="text-danger">{errors.name}</div>
                    )}
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className={`${inputStyles["form-label"]} mt-3`}>
                      Surname
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="surname"
                      value={profileData.surname || ""}
                      onChange={handleProfileChange}
                      className={`${inputStyles["form-input"]}`}
                      disabled={isAdmin}
                    />
                    {errors.surname && (
                      <div className="text-danger">{errors.surname}</div>
                    )}
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className={`${inputStyles["form-label"]} mt-3`}>
                      Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={profileData.email || ""}
                      onChange={handleProfileChange}
                      className={`${inputStyles["form-input"]}`}
                      disabled={isAdmin}
                    />
                    {errors.email && (
                      <div className="text-danger">{errors.email}</div>
                    )}
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className={`${inputStyles["form-label"]} mt-3`}>
                      Phone Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="phone_number"
                      value={profileData.phone_number || ""}
                      onChange={handleProfileChange}
                      className={`${inputStyles["form-input"]}`}
                      disabled={isAdmin}
                    />
                    {errors.phone_number && (
                      <div className="text-danger">{errors.phone_number}</div>
                    )}
                  </Form.Group>
                  <div className="d-flex justify-content-center">
                    <Button
                      variant="primary"
                      type="submit"
                      className={`${styles["customButton"]} mt-4`}
                      disabled={isAdmin}
                    >
                      Update
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Col>

          {/* Password */}
          <Col md={7}>
            <Row>
              <Col className={`${styles.formContainer}`}>
                {/* Change Password Form */}
                <h3 className="text-center mt-2">
                  <FontAwesomeIcon icon={faLock} /> Change Password
                </h3>
                {errors.old_password && (
                  <Alert variant="danger">{errors.old_password}</Alert>
                )}
                <Form onSubmit={handleChangePassword}>
                  <Form.Group>
                    <Form.Label className={`${inputStyles["form-label"]} mt-2`}>
                      Old Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChange}
                      className={`${inputStyles["form-input"]} ${passwordInput["passwordInput"]}`}
                      disabled={isAdmin}
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label className={`${inputStyles["form-label"]} mt-3`}>
                      New Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className={`${inputStyles["form-input"]} ${passwordInput["passwordInput"]}`}
                      disabled={isAdmin}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-center">
                    <Button
                      variant="primary"
                      type="submit"
                      className={`${styles["customButton"]} mt-4`}
                      disabled={isAdmin}
                    >
                      Save
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>

            {/* Delete Account */}
            <Row>
              <Col className={`${styles.deleteContainer}`}>
                <h3 className="text-danger text-center">
                  <FontAwesomeIcon icon={faTriangleExclamation} /> Delete
                  Account
                </h3>
                <div className="d-flex justify-content-center">
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                    className={`${styles["deleteButton"]} mt-4`}
                    disabled={isAdmin}
                  >
                    Delete
                  </Button>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Modal for Account Deletion Confirmation */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header
            className={`${modalStyles["deleteAccModalHeader"]}`}
            closeButton
          >
            <Modal.Title
              className={`${modalStyles["deleteAccountModalTitle"]}`}
            >
              Confirm Account Deletion
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className={`${modalStyles["deleteAccModalBody"]}`}>
            <Form onSubmit={handleDeleteAccount}>
              {errors.password && (
                <Alert variant="danger">{errors.password}</Alert>
              )}
              <Form.Group>
                <p className={`${modalStyles["warningText"]}`}>
                  <FontAwesomeIcon
                    className={`${modalStyles["warningIcon"]}`}
                    icon={faTriangleExclamation}
                  />{" "}
                  All your data will be deleted!
                </p>
                <Form.Label className={`${modalStyles["deleteAccModalLabel"]}`}>
                  Enter your password to confirm
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className={`${modalStyles["deleteAccModalInput"]} ${passwordInput["passwordInput"]}`}
                />
              </Form.Group>
              <div className="mt-3">
                <Button
                  variant="danger"
                  type="submit"
                  className={`${modalStyles["deleteAccDltBtn"]}`}
                >
                  Delete Account
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteModal(false)}
                  className={`${modalStyles["deleteAccCnlBtn"]}`}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}

export default Profile;
