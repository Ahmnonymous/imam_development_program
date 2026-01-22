import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, CardBody, Card, Alert, Container, Input, Label, Form, FormFeedback } from "reactstrap";

// Formik Validation
import * as Yup from "yup";
import { useFormik } from "formik";

// action
import { registerUser, apiError } from "/src/store/actions";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

import { Link } from "react-router-dom";

// import images
import profileImg from "../../assets/images/profile-img.png";
import authLogo from "../../assets/images/animated_email_images/Logos/IDP Logo for Favicon login and register.png";

const Register = () => {
  document.title = "Register | IDP - Admin & Dashboard";

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      name: '',
      surname: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Please Enter Your Name"),
      surname: Yup.string().required("Please Enter Your Surname"),
      username: Yup.string().required("Please Enter Your Username"),
      password: Yup.string()
        .required("Please Enter Your Password")
        .min(6, "Password must be at least 6 characters"),
      confirmPassword: Yup.string()
        .required("Please Confirm Your Password")
        .oneOf([Yup.ref('password')], "Passwords must match"),
    }),
    onSubmit: (values) => {
      dispatch(registerUser(values));
    }
  });

  const AccountProperties = createSelector(
    (state) => state.Account,
    (account) => ({
      user: account.user,
      registrationError: account.registrationError,
      // loading: account.loading,
    })
  );

  const {
    user,
    registrationError,
    // loading
  } = useSelector(AccountProperties);

  useEffect(() => {
    dispatch(apiError(""));
  }, []);

  // Redirect to login on successful registration
  useEffect(() => {
    if (user) {
      // Store name and surname in sessionStorage for create profile page
      if (validation.values.name && validation.values.surname) {
        sessionStorage.setItem("registrationData", JSON.stringify({
          name: validation.values.name,
          surname: validation.values.surname
        }));
      }
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [user, navigate, validation.values.name, validation.values.surname]);

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
                <div className="bg-primary-subtle">
                  <Row>
                    <Col className="col-7">
                      <div className="text-primary p-4">
                        <h5 className="text-primary">Free Register</h5>
                        <p>Get your free IDP account now.</p>
                      </div>
                    </Col>
                    <Col className="col-5 align-self-end">
                      <img src={profileImg} alt="" className="img-fluid" />
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
                    <Form
                      className="form-horizontal"
                      onSubmit={(e) => {
                        e.preventDefault();
                        validation.handleSubmit();
                        return false;
                      }}
                    >
                      {user && user ? (
                        <Alert color="success">
                          Registration successful! Redirecting to login...
                        </Alert>
                      ) : null}

                      {registrationError && registrationError ? (
                        <Alert color="danger">
                          {typeof registrationError === 'string' 
                            ? registrationError 
                            : registrationError.msg || 'Registration failed'}
                        </Alert>
                      ) : null}

                      <div className="mb-3">
                        <Label className="form-label">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          className="form-control"
                          placeholder="Enter your name"
                          type="text"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.name || ""}
                          invalid={
                            validation.touched.name && validation.errors.name ? true : false
                          }
                        />
                        {validation.touched.name && validation.errors.name ? (
                          <FormFeedback type="invalid">{validation.errors.name}</FormFeedback>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">Surname</Label>
                        <Input
                          id="surname"
                          name="surname"
                          className="form-control"
                          placeholder="Enter your surname"
                          type="text"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.surname || ""}
                          invalid={
                            validation.touched.surname && validation.errors.surname ? true : false
                          }
                        />
                        {validation.touched.surname && validation.errors.surname ? (
                          <FormFeedback type="invalid">{validation.errors.surname}</FormFeedback>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">Username</Label>
                        <Input
                          name="username"
                          type="text"
                          placeholder="Enter username"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.username || ""}
                          invalid={
                            validation.touched.username && validation.errors.username ? true : false
                          }
                        />
                        {validation.touched.username && validation.errors.username ? (
                          <FormFeedback type="invalid">{validation.errors.username}</FormFeedback>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <Label className="form-label">Password</Label>
                        <Input
                          name="password"
                          type="password"
                          placeholder="Enter Password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.password || ""}
                          invalid={
                            validation.touched.password && validation.errors.password ? true : false
                          }
                        />
                        {validation.touched.password && validation.errors.password ? (
                          <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <Label className="form-label">Confirm Password</Label>
                        <Input
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm Password"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.confirmPassword || ""}
                          invalid={
                            validation.touched.confirmPassword && validation.errors.confirmPassword ? true : false
                          }
                        />
                        {validation.touched.confirmPassword && validation.errors.confirmPassword ? (
                          <FormFeedback type="invalid">{validation.errors.confirmPassword}</FormFeedback>
                        ) : null}
                      </div>

                      <div className="mt-4">
                        <button
                          className="btn btn-primary btn-block "
                          type="submit"
                        >
                          Register
                        </button>
                      </div>

                      <div className="mt-4 text-center">
                        <p className="mb-0">
                          By registering you agree to the IDP{" "}
                          <Link to="#" className="text-primary">
                            Terms of Use
                          </Link>
                        </p>
                      </div>
                    </Form>
                  </div>
                </CardBody>
              </Card>
              <div className="mt-5 text-center">
                <p>
                  Already have an account ?{" "}
                  <Link to="/login" className="font-weight-medium text-primary">
                    {" "}
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

export default Register;
