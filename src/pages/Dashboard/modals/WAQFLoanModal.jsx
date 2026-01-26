import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, FormFeedback, Row, Col, Button } from "reactstrap";
import { useForm, Controller } from "react-hook-form";
import axiosApi from "../../../helpers/api_helper";
import { API_BASE_URL } from "../../../helpers/url_helper";
import { getAuditName } from "../../../helpers/userStorage";
import TopRightAlert from "../../../components/Common/TopRightAlert";

const WAQFLoanModal = ({ isOpen, toggle, imamProfileId }) => {
  const [alert, setAlert] = useState(null);
  const [lookupData, setLookupData] = useState({ yesNo: [] });
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm();

  const participatedBonuses = watch("participated_recent_bonuses_90_days");
  const activeDawah = watch("active_dawah");
  const loanType = watch("loan_type");

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const yesNoRes = await axiosApi.get(`${API_BASE_URL}/lookup/Yes_No`);
        setLookupData({ yesNo: yesNoRes.data || [] });
      } catch (error) {
        console.error("Error fetching lookup data:", error);
      }
    };
    fetchLookupData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      reset({
        participated_recent_bonuses_90_days: "",
        recent_bonuses_details: "",
        active_dawah: "",
        dawah_activities_details: "",
        contributed_to_waqf_loan_fund: "",
        loan_type: "",
        loan_type_other: "",
        loan_reason: "",
        promise_to_repay: "",
        understand_waqf_fund: "",
        agree_to_pay_bank_service_costs: "",
        amount_required: "",
        monthly_income: "",
        monthly_expenses: "",
        repayment_structure: "",
        repayment_explanation: "",
        first_guarantor_name: "",
        first_guarantor_contact: "",
        second_guarantor_name: "",
        second_guarantor_contact: "",
        acknowledge: false,
        comment: "",
      });
    }
  }, [isOpen, reset]);

  const showAlert = (message, color = "success") => {
    setAlert({ message, color });
    setTimeout(() => setAlert(null), 4000);
  };

  const loanTypeOptions = [
    "Food Assistance",
    "New Business/Seed Funding/Economic Empowerment",
    "House Building/Repairs",
    "Tech Request",
    "Personal Request",
    "Outstanding Debts To Pay",
    "Medical Expense",
    "Vehicle/Motorbike",
    "School Fees",
    "Purchase a new property/land/stand",
    "Other"
  ];

  const onSubmit = async (data) => {
    try {
      const formData = {
        imam_profile_id: imamProfileId,
        participated_recent_bonuses_90_days: data.participated_recent_bonuses_90_days ? parseInt(data.participated_recent_bonuses_90_days) : null,
        recent_bonuses_details: data.recent_bonuses_details || "",
        active_dawah: data.active_dawah ? parseInt(data.active_dawah) : null,
        dawah_activities_details: data.dawah_activities_details || "",
        contributed_to_waqf_loan_fund: data.contributed_to_waqf_loan_fund || "",
        loan_type: data.loan_type || "",
        loan_type_other: data.loan_type_other || "",
        loan_reason: data.loan_reason || "",
        promise_to_repay: data.promise_to_repay ? parseInt(data.promise_to_repay) : null,
        understand_waqf_fund: data.understand_waqf_fund ? parseInt(data.understand_waqf_fund) : null,
        agree_to_pay_bank_service_costs: data.agree_to_pay_bank_service_costs ? parseInt(data.agree_to_pay_bank_service_costs) : null,
        amount_required: data.amount_required ? parseFloat(data.amount_required) : null,
        monthly_income: data.monthly_income ? parseFloat(data.monthly_income) : null,
        monthly_expenses: data.monthly_expenses ? parseFloat(data.monthly_expenses) : null,
        repayment_structure: data.repayment_structure ? parseFloat(data.repayment_structure) : null,
        repayment_explanation: data.repayment_explanation || "",
        first_guarantor_name: data.first_guarantor_name || "",
        first_guarantor_contact: data.first_guarantor_contact || "",
        second_guarantor_name: data.second_guarantor_name || "",
        second_guarantor_contact: data.second_guarantor_contact || "",
        acknowledge: data.acknowledge || false,
        status_id: 1,
        comment: data.comment || "",
        created_by: getAuditName(),
      };
      await axiosApi.post(`${API_BASE_URL}/waqfLoan`, formData);
      showAlert("WAQF Loan created successfully", "success");
      setTimeout(() => {
        toggle();
      }, 1500);
    } catch (error) {
      showAlert(error?.response?.data?.message || "Failed to create WAQF Loan", "danger");
    }
  };

  return (
    <>
      <TopRightAlert alert={alert} onClose={() => setAlert(null)} />
      <Modal isOpen={isOpen} toggle={toggle} centered size="xl" backdrop="static">
        <ModalHeader toggle={toggle}>
          <i className="bx bx-plus-circle me-2"></i>
          Add WAQF Loan
        </ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label>Have you participated in any of the recent IDP Bonuses within the last 90 days? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="participated_recent_bonuses_90_days" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.participated_recent_bonuses_90_days} {...field}>
                        <option value="">Select</option>
                        {lookupData.yesNo.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.participated_recent_bonuses_90_days && <FormFeedback>{errors.participated_recent_bonuses_90_days.message}</FormFeedback>}
                </FormGroup>
              </Col>
              {participatedBonuses && parseInt(participatedBonuses) === 1 && (
                <Col md={12}>
                  <FormGroup>
                    <Label>If yes, please provide details of your recent participation in the IDP Bonuses.</Label>
                    <Controller 
                      name="recent_bonuses_details" 
                      control={control} 
                      render={({ field }) => <Input type="textarea" rows={3} {...field} placeholder="Enter details" />} 
                    />
                  </FormGroup>
                </Col>
              )}
              <Col md={12}>
                <FormGroup>
                  <Label>Are you currently involved in active Dawah? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="active_dawah" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.active_dawah} {...field}>
                        <option value="">Select</option>
                        {lookupData.yesNo.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.active_dawah && <FormFeedback>{errors.active_dawah.message}</FormFeedback>}
                </FormGroup>
              </Col>
              {activeDawah && parseInt(activeDawah) === 1 && (
                <Col md={12}>
                  <FormGroup>
                    <Label>If yes, please provide details of your current Dawah activities in the last 30 days.</Label>
                    <Controller 
                      name="dawah_activities_details" 
                      control={control} 
                      render={({ field }) => <Input type="textarea" rows={3} {...field} placeholder="Enter details" />} 
                    />
                  </FormGroup>
                </Col>
              )}
              <Col md={12}>
                <FormGroup>
                  <Label>Have you contributed anything towards the Waqf Loan Fund?</Label>
                  <Controller 
                    name="contributed_to_waqf_loan_fund" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter details" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Which of the following would best describe the type of loan you're applying for? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="loan_type" 
                    control={control} 
                    rules={{ required: "Loan type is required" }}
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.loan_type} {...field}>
                        <option value="">Select Loan Type</option>
                        {loanTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.loan_type && <FormFeedback>{errors.loan_type.message}</FormFeedback>}
                </FormGroup>
              </Col>
              {loanType === "Other" && (
                <Col md={12}>
                  <FormGroup>
                    <Label>Other: <span className="text-danger">*</span></Label>
                    <Controller 
                      name="loan_type_other" 
                      control={control} 
                      rules={{ required: loanType === "Other" ? "Please specify the loan type" : false }}
                      render={({ field }) => <Input type="text" invalid={!!errors.loan_type_other} {...field} placeholder="Please specify" />} 
                    />
                    {errors.loan_type_other && <FormFeedback>{errors.loan_type_other.message}</FormFeedback>}
                  </FormGroup>
                </Col>
              )}
              <Col md={12}>
                <FormGroup>
                  <Label>Please explain, in full detail, why you need this loan? (The more details provided the better the chances of the loan being approved) <span className="text-danger">*</span></Label>
                  <Controller 
                    name="loan_reason" 
                    control={control} 
                    rules={{ required: "Loan reason is required" }}
                    render={({ field }) => <Input type="textarea" rows={4} invalid={!!errors.loan_reason} {...field} placeholder="Enter detailed explanation" />} 
                  />
                  {errors.loan_reason && <FormFeedback>{errors.loan_reason.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>If the loan is approved, do you promise to pay back the full amount within the specified time? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="promise_to_repay" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.promise_to_repay} {...field}>
                        <option value="">Select</option>
                        {lookupData.yesNo.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.promise_to_repay && <FormFeedback>{errors.promise_to_repay.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Do you understand that this is a waqf fund and the money must be paid back? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="understand_waqf_fund" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.understand_waqf_fund} {...field}>
                        <option value="">Select</option>
                        {lookupData.yesNo.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.understand_waqf_fund && <FormFeedback>{errors.understand_waqf_fund.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Do you agree to pay any related bank service costs? <span className="text-danger">*</span></Label>
                  <Controller 
                    name="agree_to_pay_bank_service_costs" 
                    control={control} 
                    rules={{ required: "This field is required" }}
                    render={({ field }) => (
                      <Input type="select" invalid={!!errors.agree_to_pay_bank_service_costs} {...field}>
                        <option value="">Select</option>
                        {lookupData.yesNo.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </Input>
                    )} 
                  />
                  {errors.agree_to_pay_bank_service_costs && <FormFeedback>{errors.agree_to_pay_bank_service_costs.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Amount Required <span className="text-danger">*</span></Label>
                  <Controller 
                    name="amount_required" 
                    control={control} 
                    rules={{ required: "Amount required is mandatory" }}
                    render={({ field }) => <Input type="number" step="0.01" invalid={!!errors.amount_required} {...field} placeholder="0.00" />} 
                  />
                  {errors.amount_required && <FormFeedback>{errors.amount_required.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>What is your monthly income? (Salary, Additional income)* PLEASE EXCLUDE IDP STIPEND <span className="text-danger">*</span></Label>
                  <Controller 
                    name="monthly_income" 
                    control={control} 
                    rules={{ required: "Monthly income is required" }}
                    render={({ field }) => <Input type="number" step="0.01" invalid={!!errors.monthly_income} {...field} placeholder="0.00" />} 
                  />
                  {errors.monthly_income && <FormFeedback>{errors.monthly_income.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>What are your monthly expenses? (Please include any existing loan repayments) <span className="text-danger">*</span></Label>
                  <Controller 
                    name="monthly_expenses" 
                    control={control} 
                    rules={{ required: "Monthly expenses are required" }}
                    render={({ field }) => <Input type="number" step="0.01" invalid={!!errors.monthly_expenses} {...field} placeholder="0.00" />} 
                  />
                  {errors.monthly_expenses && <FormFeedback>{errors.monthly_expenses.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Repayment Structure</Label>
                  <Controller 
                    name="repayment_structure" 
                    control={control} 
                    render={({ field }) => <Input type="number" step="0.01" {...field} placeholder="0.00" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label>Please explain how you will meet your monthly repayment. <span className="text-danger">*</span></Label>
                  <Controller 
                    name="repayment_explanation" 
                    control={control} 
                    rules={{ required: "Repayment explanation is required" }}
                    render={({ field }) => <Input type="textarea" rows={3} invalid={!!errors.repayment_explanation} {...field} placeholder="Enter detailed explanation" />} 
                  />
                  {errors.repayment_explanation && <FormFeedback>{errors.repayment_explanation.message}</FormFeedback>}
                </FormGroup>
              </Col>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>First Guarantor Name</Label>
                    <Controller 
                      name="first_guarantor_name" 
                      control={control} 
                      render={({ field }) => <Input type="text" {...field} placeholder="Enter guarantor name" />} 
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>First Guarantor Contact</Label>
                    <Controller 
                      name="first_guarantor_contact" 
                      control={control} 
                      render={({ field }) => <Input type="text" {...field} placeholder="Enter contact number" />} 
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Second Guarantor Name</Label>
                    <Controller 
                      name="second_guarantor_name" 
                      control={control} 
                      render={({ field }) => <Input type="text" {...field} placeholder="Enter guarantor name" />} 
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Second Guarantor Contact</Label>
                    <Controller 
                      name="second_guarantor_contact" 
                      control={control} 
                      render={({ field }) => <Input type="text" {...field} placeholder="Enter contact number" />} 
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Col md={12}>
                <FormGroup>
                  <Label>Comment</Label>
                  <Controller 
                    name="comment" 
                    control={control} 
                    render={({ field }) => <Input type="textarea" rows={2} {...field} placeholder="Enter comment" />} 
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup check>
                  <Controller
                    name="acknowledge"
                    control={control}
                    rules={{ required: "You must acknowledge the statement to proceed" }}
                    render={({ field }) => (
                      <>
                        <Input
                          type="checkbox"
                          id="acknowledgment-waqf"
                          checked={field.value || false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          invalid={!!errors.acknowledge}
                        />
                        <Label check htmlFor="acknowledgment-waqf">
                          I swear by Allah, the All-Hearing and the All-Seeing, that I have completed this form truthfully and honestly, to the best of my knowledge and belief.
                        </Label>
                        {errors.acknowledge && (
                          <FormFeedback>{errors.acknowledge.message}</FormFeedback>
                        )}
                      </>
                    )}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={toggle} disabled={isSubmitting} className="me-2">
              <i className="bx bx-x me-1"></i> Cancel
            </Button>
            <Button color="success" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bx bx-save me-1"></i> Save
                </>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
};

export default WAQFLoanModal;
