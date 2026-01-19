import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Badge,
  UncontrolledTooltip,
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { API_BASE_URL } from "../../helpers/url_helper";
import axiosApi from "../../helpers/api_helper";
import { getAuditName } from "../../helpers/userStorage";

const EmailTemplateSettings = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", color: "success" });
  const [previewModal, setPreviewModal] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    template_name: "",
    subject: "",
    html_content: "",
    background_color: "#8f98ff",
    text_color: "#666",
    button_color: "#BD1F5B",
    button_text_color: "#fff",
    image_position: "center",
    text_alignment: "left",
    available_variables: JSON.stringify([
      "{{imam_name}}",
      "{{imam_surname}}",
      "((submission_date))",
      "{{topic}}",
      "{{masjid_name}}",
      "{{table_name}}",
      "{{table_label}}",
    ]),
    recipient_type: "imam",
    is_active: true,
    login_url: "https://imamdp.org/dashboard",
    email_triggers: JSON.stringify([]), // Array of {table_name, action, template_id}
  });

  // Available database tables and their CRUD operations
  const availableTables = [
    { name: "Jumuah_Khutbah_Topic", label: "Jumuah Khutbah Topic", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "Jumuah_Audio_Khutbah", label: "Jumuah Audio Khutbah", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "Imam_Profiles", label: "Imam Profiles", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "Pearls_Of_Wisdom", label: "Pearls of Wisdom", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "Medical_Reimbursement", label: "Medical Assistance", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "Community_Engagement", label: "Community Engagement", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "Nikah_Bonus", label: "Nikah Bonus", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "New_Muslim_Bonus", label: "New Muslim Bonus", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "New_Baby_Bonus", label: "New Baby Bonus", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "Higher_Education_Request", label: "Higher Education Request", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "Waqf_Loan", label: "Waqf Loan", actions: ["CREATE", "UPDATE", "DELETE"] },
    { name: "Tree_Requests", label: "Tree Requests", actions: ["CREATE", "UPDATE", "DELETE"] },
      { name: "imam_financial_assistance", label: "Financial Assistance", actions: ["CREATE", "UPDATE", "DELETE"] },
      { name: "hardship_relief", label: "Hardship Relief", actions: ["CREATE", "UPDATE", "DELETE"] },
      { name: "Imam_Profiles", label: "Imam Profiles", actions: ["CREATE", "UPDATE", "DELETE"] },
      { name: "Conversations", label: "Conversations", actions: ["CREATE", "UPDATE", "DELETE"] },
      { name: "Messages", label: "Messages", actions: ["CREATE", "UPDATE", "DELETE"] },
    ];

  const [emailTriggers, setEmailTriggers] = useState([]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axiosApi.get(`${API_BASE_URL}/emailTemplates`);
      setTemplates(response.data);
    } catch (error) {
      showAlert("Failed to fetch email templates", "danger");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, color = "success") => {
    setAlert({ show: true, message, color });
    setTimeout(() => setAlert({ show: false, message: "", color: "success" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (template) => {
    setEditTemplate(template);
    setFormData({
      template_name: template.template_name || "",
      subject: template.subject || "",
      html_content: template.html_content || "",
      background_color: template.background_color || "#8f98ff",
      text_color: template.text_color || "#666",
      button_color: template.button_color || "#8f98ff",
      button_text_color: template.button_text_color || "#fff",
      image_position: template.image_position || "center",
      text_alignment: template.text_alignment || "left",
      available_variables: typeof template.available_variables === 'string' 
        ? template.available_variables 
        : JSON.stringify(template.available_variables || []),
      recipient_type: template.recipient_type || "imam",
      is_active: template.is_active !== false,
      login_url: template.login_url || "https://imamdp.org/dashboard",
      email_triggers: template.email_triggers || JSON.stringify([]),
    });
    // Load email triggers for this template
    try {
      const triggers = typeof template.email_triggers === 'string' 
        ? JSON.parse(template.email_triggers || '[]')
        : (template.email_triggers || []);
      setEmailTriggers(triggers);
    } catch (e) {
      setEmailTriggers([]);
    }
    // Reset image selection and set preview to existing image URL
    setSelectedImage(null);
    if (template.background_image_show_link) {
      setImagePreview(template.background_image_show_link);
    } else {
      setImagePreview(null);
    }
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditTemplate(null);
    setFormData({
      template_name: "",
      subject: "",
      html_content: "",
      background_color: "#8f98ff",
      text_color: "#666",
      button_color: "#BD1F5B",
      button_text_color: "#fff",
      image_position: "center",
      text_alignment: "left",
      available_variables: JSON.stringify([
        "{{imam_name}}",
        "{{imam_surname}}",
        "((submission_date))",
        "{{topic}}",
        "{{masjid_name}}",
      ]),
      recipient_type: "imam",
      is_active: true,
      login_url: "https://imamdp.org/dashboard",
      email_triggers: JSON.stringify([]),
    });
    setEmailTriggers([]);
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    setTimeout(() => {
      const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
      if (fileInput) fileInput.value = '';
    }, 100);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== 'email_triggers') {
          submitData.append(key, formData[key]);
        }
      });
      // Add email triggers
      submitData.append("email_triggers", JSON.stringify(emailTriggers));
      if (selectedImage) {
        submitData.append("background_image", selectedImage);
      }

      let response;
      if (editTemplate) {
        response = await axiosApi.put(`${API_BASE_URL}/emailTemplates/${editTemplate.id}`, submitData);
        showAlert("Email template updated successfully", "success");
      } else {
        response = await axiosApi.post(`${API_BASE_URL}/emailTemplates`, submitData);
        showAlert("Email template created successfully", "success");
      }
      
      // Update image preview with the server response
      if (response?.data?.background_image_show_link) {
        setImagePreview(response.data.background_image_show_link);
      }
      
      // Clear selected image after successful save
      setSelectedImage(null);
      
      setModalOpen(false);
      fetchTemplates();
    } catch (error) {
      showAlert(error?.response?.data?.error || "Failed to save email template", "danger");
    }
  };

  const handleToggleTrigger = (tableName, action) => {
    setEmailTriggers((prev) => {
      const key = `${tableName}_${action}`;
      const exists = prev.find(t => t.table_name === tableName && t.action === action);
      if (exists) {
        return prev.filter(t => !(t.table_name === tableName && t.action === action));
      } else {
        return [...prev, { table_name: tableName, action, template_id: editTemplate?.id || null }];
      }
    });
  };

  const isTriggerActive = (tableName, action) => {
    return emailTriggers.some(t => t.table_name === tableName && t.action === action);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this email template?")) {
      try {
        await axiosApi.delete(`${API_BASE_URL}/emailTemplates/${id}`);
        showAlert("Email template deleted successfully", "success");
        fetchTemplates();
      } catch (error) {
        showAlert("Failed to delete email template", "danger");
      }
    }
  };

  const handlePreview = () => {
    // Get table label from triggers or use default
    let tableLabel = "Jumuah Khutbah Topic";
    let tableName = "Jumuah_Khutbah_Topic";
    
    try {
      const triggers = typeof formData.email_triggers === 'string' 
        ? JSON.parse(formData.email_triggers || '[]')
        : (formData.email_triggers || []);
      
      if (triggers.length > 0) {
        const firstTrigger = triggers[0];
        const table = availableTables.find(t => t.name === firstTrigger.table_name);
        if (table) {
          tableLabel = table.label;
          tableName = table.name;
        }
      }
    } catch (e) {
      // Use defaults
    }

    // Determine which image URL to use for preview
    // Priority: 1) selectedImage data URL, 2) existing background_image_show_link, 3) empty
    let imageUrl = "";
    if (selectedImage && imagePreview && imagePreview.startsWith('data:')) {
      // Use data URL if a new image was selected
      imageUrl = imagePreview;
    } else if (editTemplate?.background_image_show_link) {
      // Use existing image URL from template
      imageUrl = editTemplate.background_image_show_link;
    } else if (imagePreview && !imagePreview.startsWith('data:')) {
      // Use imagePreview if it's a URL (not a data URL)
      imageUrl = imagePreview;
    }

    // Generate preview HTML with sample data
    let preview = formData.html_content
      .replace(/\{\{imam_name\}\}/g, "Ahmed Hassan") // Full name (name + surname)
      .replace(/\{\{imam_surname\}\}/g, "Hassan")
      .replace(/\(\(submission_date\)\)/g, "January 15, 2024")
      .replace(/\{\{topic\}\}/g, "The Importance of Unity")
      .replace(/\{\{masjid_name\}\}/g, "Al-Masjid Al-Haram")
      .replace(/\{\{table_name\}\}/g, tableName)
      .replace(/\{\{table_label\}\}/g, tableLabel)
      .replace(/\{\{background_image\}\}/g, imageUrl)
      .replace(/\(\(background_image\)\)/g, imageUrl)
      .replace(/\{\{login_url\}\}/g, formData.login_url)
      .replace(/\(\(login_url\)\)/g, formData.login_url);

    setPreviewHtml(preview);
    setPreviewModal(true);
  };

  const handlePreviewFromTable = (template) => {
    // Get table label from triggers or use default
    let tableLabel = "Jumuah Khutbah Topic";
    let tableName = "Jumuah_Khutbah_Topic";
    
    try {
      const triggers = typeof template.email_triggers === 'string' 
        ? JSON.parse(template.email_triggers || '[]')
        : (template.email_triggers || []);
      
      if (triggers.length > 0) {
        const firstTrigger = triggers[0];
        const table = availableTables.find(t => t.name === firstTrigger.table_name);
        if (table) {
          tableLabel = table.label;
          tableName = table.name;
        }
      }
    } catch (e) {
      // Use defaults
    }

    // Generate preview HTML with sample data from template
    let preview = template.html_content
      .replace(/\{\{imam_name\}\}/g, "Ahmed Hassan") // Full name (name + surname)
      .replace(/\{\{imam_surname\}\}/g, "Hassan")
      .replace(/\(\(submission_date\)\)/g, "January 15, 2024")
      .replace(/\{\{topic\}\}/g, "The Importance of Unity")
      .replace(/\{\{masjid_name\}\}/g, "Al-Masjid Al-Haram")
      .replace(/\{\{table_name\}\}/g, tableName)
      .replace(/\{\{table_label\}\}/g, tableLabel)
      .replace(/\{\{background_image\}\}/g, template.background_image_show_link || "")
      .replace(/\(\(background_image\)\)/g, template.background_image_show_link || "")
      .replace(/\{\{login_url\}\}/g, template.login_url || "https://imamdp.org/dashboard")
      .replace(/\(\(login_url\)\)/g, template.login_url || "https://imamdp.org/dashboard");

    setPreviewHtml(preview);
    setPreviewModal(true);
  };

  const handleDuplicate = (template) => {
    // Set form data with template data but clear the ID and modify name
    setEditTemplate(null);
    setFormData({
      template_name: `${template.template_name} (Copy)`,
      subject: template.subject || "",
      html_content: template.html_content || "",
      background_color: template.background_color || "#8f98ff",
      text_color: template.text_color || "#666",
      button_color: template.button_color || "#8f98ff",
      button_text_color: template.button_text_color || "#fff",
      image_position: template.image_position || "center",
      text_alignment: template.text_alignment || "left",
      available_variables: typeof template.available_variables === 'string' 
        ? template.available_variables 
        : JSON.stringify(template.available_variables || []),
      recipient_type: template.recipient_type || "imam",
      is_active: false, // Set to inactive by default for duplicates
      login_url: template.login_url || "https://imamdp.org/dashboard",
      email_triggers: JSON.stringify([]),
    });
    setEmailTriggers([]);
    if (template.background_image_show_link) {
      setImagePreview(template.background_image_show_link);
    } else {
      setImagePreview(null);
    }
    setSelectedImage(null);
    setModalOpen(true);
  };

  const generateDefaultTemplate = () => {
    const recipientType = formData.recipient_type || "imam";
    
    let defaultHtml = '';
    
    if (recipientType === "imam") {
      // Imam User Template
      defaultHtml = `
<body style="background-color: #f7f5f5;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>{{table_label}}</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="{{table_label}}" style="max-width:60%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Asalaamu Alaikum {{imam_name}},
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      JazakAllahu khayran for submitting your {{table_label}} on ((submission_date)).
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      We confirm that your submission has been successfully received and is currently marked as Pending Review.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      <strong>Submission:</strong> {{table_label}}<br/>
      <strong>Submission Date:</strong> ((submission_date))<br/>
      <strong>Current Status:</strong> Pending
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      The submitted {{topic}} will be reviewed by the relevant administrators.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      You may log in to the platform at any time to track the status of your submission.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      In sha' Allah, your {{topic}} will be a means of goodness and guidance for your community.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      LOGIN HERE
    </a>
  </div>
</body>
      `.trim();
    } else if (recipientType === "admin") {
      // App Admin Template
      defaultHtml = `
<body style="background-color: #f7f5f5;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>{{table_label}}</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="{{table_label}}" style="max-width:60%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Asalaamu Alaikum,
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      A {{table_label}} has been submitted on ((submission_date)) and is currently marked as Pending Review.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      <strong>Submitted By:</strong> {{imam_name}}<br/>
      <strong>Submission:</strong> {{table_label}}<br/>
      <strong>Submission Date:</strong> ((submission_date))<br/>
      <strong>Current Status:</strong> Pending
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Please log in to the platform to review the submission and take the appropriate action.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      JazakAllahu khayran for your continued service and oversight.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      LOGIN HERE
    </a>
  </div>
</body>
      `.trim();
    } else {
      // Both - use admin template as default
      defaultHtml = `
<body style="background-color: #f7f5f5;">
  <div style="width:70%; margin:20px auto;background-color:#fff;padding:20px;border-radius:8px;text-align:center;font-family:Arial,sans-serif;">
    <h1 style="color:#2d2d2d;font-size:36px;font-style:bold;"><b>{{table_label}}</b></h1>
    <div style="background-color:#BD1F5B; border-radius: 20px;margin-top:10px;">
      <img src="{{background_image}}" alt="{{table_label}}" style="max-width:60%;height:auto;border-radius:8px;background:#BD1F5B;" />
    </div>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Dear Admin,
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      A {{table_label}} has been submitted on ((submission_date)) and is currently marked as Pending Review.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      <strong>Submitted By:</strong> {{imam_name}}<br/>
      <strong>Submission:</strong> {{table_label}}<br/>
      <strong>Submission Date:</strong> ((submission_date))<br/>
      <strong>Current Status:</strong> Pending
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Please log in to the platform to review the submission and take the appropriate action.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      JazakAllahu khayran for your continued service and oversight.
    </p>
    <p style="color:#666;font-size:14px;line-height:1.6;margin-top:10px;text-align:left;">
      Kind regards,<br/>
      Imam Development Plan<br/>
      helpdesk@imamdp.org
    </p>
    <a href="{{login_url}}" target="_blank" style="display:inline-block;background-color:#BD1F5B;color:#fff;padding:15px 60px;text-decoration:none;margin-top:20px;border-radius:5px;font-size:14px;">
      LOGIN HERE
    </a>
  </div>
</body>
      `.trim();
    }
    
    setFormData((prev) => ({ ...prev, html_content: defaultHtml }));
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Email Template Settings" breadcrumbItem="Email Templates" />
        
        {alert.show && (
          <Alert color={alert.color} className="mt-3">
            {alert.message}
          </Alert>
        )}

        <Row>
          <Col>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">Email Templates</h4>
                <Button color="primary" onClick={handleCreate}>
                  <i className="bx bx-plus me-1"></i> Create Template
                </Button>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Template Name</th>
                        <th>Recipient</th>
                        <th>Status</th>
                        <th>Triggers</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templates.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            No email templates found. Create one to get started.
                          </td>
                        </tr>
                      ) : (
                        templates.map((template) => {
                          let triggers = [];
                          try {
                            triggers = typeof template.email_triggers === 'string' 
                              ? JSON.parse(template.email_triggers || '[]')
                              : (template.email_triggers || []);
                          } catch (e) {
                            triggers = [];
                          }
                          return (
                          <tr key={template.id}>
                            <td>{template.template_name}</td>
                            <td>
                              <Badge color="secondary">
                                {template.recipient_type === "imam"
                                  ? "Imam"
                                  : template.recipient_type === "admin"
                                  ? "Admin"
                                  : "Both"}
                              </Badge>
                            </td>
                            <td>
                              <Badge color={template.is_active ? "success" : "danger"}>
                                {template.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td>
                              {triggers.length > 0 ? (
                                <div>
                                  {triggers.slice(0, 2).map((t, idx) => (
                                    <Badge key={idx} color="info" className="me-1 mb-1">
                                      {t.table_name} ({t.action})
                                    </Badge>
                                  ))}
                                  {triggers.length > 2 && (
                                    <Badge color="secondary">
                                      +{triggers.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">No triggers</span>
                              )}
                            </td>
                            <td>
                              <Button
                                color="info"
                                size="sm"
                                className="me-1"
                                onClick={() => handlePreviewFromTable(template)}
                                title="Preview"
                              >
                                <i className="bx bx-show"></i>
                              </Button>
                              <Button
                                color="primary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleEdit(template)}
                                title="Edit"
                              >
                                <i className="bx bx-edit"></i>
                              </Button>
                              <Button
                                color="secondary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleDuplicate(template)}
                                title="Duplicate"
                              >
                                <i className="bx bx-copy"></i>
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => handleDelete(template.id)}
                                title="Delete"
                              >
                                <i className="bx bx-trash"></i>
                              </Button>
                            </td>
                          </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Create/Edit Modal */}
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size="xl">
          <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
            {editTemplate ? "Edit Email Template" : "Create Email Template"}
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Template Name *</Label>
                    <Input
                      type="text"
                      name="template_name"
                      value={formData.template_name}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Recipient Type *</Label>
                    <Input
                      type="select"
                      name="recipient_type"
                      value={formData.recipient_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="imam">Imam User</option>
                      <option value="admin">App Admin</option>
                      <option value="both">Both</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label>Email Subject *</Label>
                <Input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>HTML Content *</Label>
                <div className="d-flex justify-content-between mb-2">
                  <small className="text-muted">
                    Use variables like {`{{imam_name}}`}, {`((submission_date))`}, {`{{table_label}}`}, or {`{{table_name}}`}
                  </small>
                  <Button
                    type="button"
                    color="secondary"
                    size="sm"
                    onClick={generateDefaultTemplate}
                  >
                    Load Default Template ({formData.recipient_type === "imam" ? "Imam" : formData.recipient_type === "admin" ? "Admin" : "Both"})
                  </Button>
                </div>
                <Input
                  type="textarea"
                  name="html_content"
                  value={formData.html_content}
                  onChange={handleInputChange}
                  rows={15}
                  required
                  style={{ fontFamily: "monospace", fontSize: "12px" }}
                />
              </FormGroup>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Background Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      key={editTemplate?.id || 'new'} // Reset file input when editing different template
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxWidth: "200px", maxHeight: "200px", objectFit: "contain" }}
                          onError={(e) => {
                            console.error("Error loading image preview:", imagePreview);
                            e.target.style.display = "none";
                          }}
                        />
                        <div className="mt-2">
                          <Button
                            type="button"
                            color="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                              // Reset file input
                              const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
                              if (fileInput) fileInput.value = '';
                            }}
                          >
                            Clear Image
                          </Button>
                        </div>
                      </div>
                    )}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Login URL</Label>
                    <Input
                      type="text"
                      name="login_url"
                      value={formData.login_url}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={3}>
                  <FormGroup>
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      name="background_color"
                      value={formData.background_color}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Text Color</Label>
                    <Input
                      type="color"
                      name="text_color"
                      value={formData.text_color}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Button Color</Label>
                    <Input
                      type="color"
                      name="button_color"
                      value={formData.button_color}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Button Text Color</Label>
                    <Input
                      type="color"
                      name="button_text_color"
                      value={formData.button_text_color}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Image Position</Label>
                    <Input
                      type="select"
                      name="image_position"
                      value={formData.image_position}
                      onChange={handleInputChange}
                    >
                      <option value="top">Top</option>
                      <option value="center">Center</option>
                      <option value="bottom">Bottom</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Text Alignment</Label>
                    <Input
                      type="select"
                      name="text_alignment"
                      value={formData.text_alignment}
                      onChange={handleInputChange}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>


              <FormGroup check>
                <Input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                <Label check>Active</Label>
              </FormGroup>

              <FormGroup>
                <Label>Available Variables (JSON array)</Label>
                <Input
                  type="textarea"
                  name="available_variables"
                  value={formData.available_variables}
                  onChange={handleInputChange}
                  rows={3}
                />
                <small className="text-muted">
                  Example: {`["{{imam_name}}", "((submission_date))", "{{table_label}}"]`}
                  <br />
                  <strong>Note:</strong> {`{{imam_name}}`} represents the full name (Name + Surname), while {`{{imam_surname}}`} is just the surname.
                </small>
              </FormGroup>

              <FormGroup>
                <Label>Email Triggers *</Label>
                <small className="text-muted d-block mb-2">
                  Select which table actions should trigger this email template. The email will be sent when the specified action (CREATE, UPDATE, DELETE) occurs on the selected table.
                </small>
                <Card>
                  <CardBody style={{ maxHeight: "400px", overflowY: "auto" }}>
                    <Table responsive size="sm">
                      <thead>
                        <tr>
                          <th>Table Name</th>
                          <th>CREATE</th>
                          <th>UPDATE</th>
                          <th>DELETE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableTables.map((table) => (
                          <tr key={table.name}>
                            <td>
                              <strong>{table.label}</strong>
                              <br />
                              <small className="text-muted">{table.name}</small>
                            </td>
                            {table.actions.map((action) => (
                              <td key={action} className="text-center">
                                <Input
                                  type="checkbox"
                                  checked={isTriggerActive(table.name, action)}
                                  onChange={() => handleToggleTrigger(table.name, action)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </CardBody>
                </Card>
                {emailTriggers.length > 0 && (
                  <div className="mt-2">
                    <small className="text-info">
                      <strong>Active Triggers:</strong> {emailTriggers.map(t => `${t.table_name} (${t.action})`).join(", ")}
                    </small>
                  </div>
                )}
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button type="button" color="info" onClick={handlePreview}>
                Preview
              </Button>
              <Button type="submit" color="primary">
                {editTemplate ? "Update" : "Create"}
              </Button>
              <Button type="button" color="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Preview Modal */}
        <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="lg">
          <ModalHeader toggle={() => setPreviewModal(false)}>Email Preview</ModalHeader>
          <ModalBody>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setPreviewModal(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default EmailTemplateSettings;

