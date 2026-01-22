import PropTypes from "prop-types";
import React from "react";
import {
  Row,
  Col,
  Alert,
  Card,
  CardBody,
  Container,
  FormFeedback,
  Input,
  Label,
  Form,
} from "reactstrap";

import { Link, useNavigate } from "react-router-dom";
import withRouter from "../../components/Common/withRouter";
import axiosApi from "../../helpers/api_helper";
import { API_BASE_URL } from "../../helpers/url_helper";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";
import { useState } from "react";

// import images
import profile from "../../assets/images/profile-img.png";
import authLogo from "../../assets/images/animated_email_images/Logos/IDP Logo for Favicon login and register.png";

const ForgetPasswordPage = (props) => {
  //meta title
  document.title =
    "Forget Password | IDP - Admin & Dashboard";
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Please enter a valid email").required("Please Enter Your Email"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError("");
        setSuccessMsg("");
        
        const response = await axiosApi.post(`${API_BASE_URL}/auth/password-reset/request`, {
          email: values.email
        });
        
        setSuccessMsg(response.data.msg || "If an account with that email exists, a password reset link has been sent.");
        validation.resetForm();
      } catch (err) {
        const errorMessage = err.response?.data?.msg || err.message || "An error occurred. Please try again.";
        if (err.response?.status === 429) {
          setError(errorMessage);
        } else {
          // For security, show success message even on error (don't reveal if email exists)
          setSuccessMsg("If an account with that email exists, a password reset link has been sent.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <React.Fragment>
      <div className="home-btn d-none d-sm-block">
        <Link to="/" className="text-dark">
          <i className="bx bx-home h2" />
        </Link>
      </div>
      <div className="account-pages my-5 pt-sm-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="overflow-hidden">
                <div className="bg-primary-subtlebg-soft-primary">
                  <Row>
                    <Col xs={7}>
                      <div className="text-primary p-4">
                        <h5 className="text-primary">Welcome Back !</h5>
                        <p>Sign in to continue to IDP.</p>
                      </div>
                    </Col>
                    <Col className="col-5 align-self-end">
                      <img src={profile} alt="" className="img-fluid" />
                    </Col>
                  </Row>
                </div>
                <CardBody className="pt-0">
                  <div className="auth-logo">
                    <Link to="/" className="auth-logo-light">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img
                            src={authLogo}
                            alt="IDP"
                            className="rounded-circle"
                            height="34"
                          />
                        </span>
                      </div>
                    </Link>
                    <Link to="/" className="auth-logo-dark">
                      <div className="avatar-md profile-user-wid mb-4">
                        <span className="avatar-title rounded-circle bg-light">
                          <img
                            src={authLogo}
                            alt="IDP"
                            className="rounded-circle"
                            height="34"
                          />
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="p-2">
                    {error ? (
                      <Alert color="danger" style={{ marginTop: "13px" }}>
                        {error}
                      </Alert>
                    ) : null}
                    {successMsg ? (
                      <Alert color="success" style={{ marginTop: "13px" }}>
                        {successMsg}
                      </Alert>
                    ) : null}

                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      <div className="mb-3">
                        <Label className="form-label">Email</Label>
                        <Input
                          name="email"
                          className="form-control"
                          placeholder="Enter email"
                          type="email"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.email || ""}
                          invalid={
                            validation.touched.email && validation.errors.email
                              ? true
                              : false
                          }
                        />
                        {validation.touched.email && validation.errors.email ? (
                          <FormFeedback type="invalid">
                            {validation.errors.email}
                          </FormFeedback>
                        ) : null}
                      </div>
                      <Row className="mb-3">
                        <Col className="text-end">
                          <button
                            className="btn btn-primary w-md "
                            type="submit"
                            disabled={loading}
                          >
                            {loading ? "Sending..." : "Reset"}
                          </button>
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>
                  Go back to{" "}
                  <Link to="/login" className="font-weight-medium text-primary">
                    Login
                  </Link>{" "}
                </p>
                <p>
                  © {new Date().getFullYear()} IDP. Crafted with{" "}
                  <i className="mdi mdi-heart text-danger" /> by Uchakide Solutions
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

ForgetPasswordPage.propTypes = {
  history: PropTypes.object,
};

export default withRouter(ForgetPasswordPage);
