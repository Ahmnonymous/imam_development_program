const db = require('../config/db');
const { applyCenterFilter } = require('../utils/applyCenterFilter');

const withCenterFilter = (sql, params, user, centerId, alias) => {
    const { text, values } = applyCenterFilter(
        { text: sql, values: params },
        user,
        { centerId, alias }
    );
    return { text, values };
};

class ReportsModel {
    // Center Audits Report - Table removed
    static async getCenterAudits(centerId = null, user = {}) {
        try {
            // center_audits table has been removed - return empty result
            return [];
        } catch (error) {
            throw new Error(`Error fetching center audits: ${error.message}`);
        }
    }

    // Total Financial Assistance Report - applicant_details table removed
    static async getTotalFinancialAssistance(centerId = null, user = {}) {
        try {
            // applicant_details table has been removed - return empty result
            return [];
        } catch (error) {
            throw new Error(`Error fetching total financial assistance: ${error.message}`);
        }
    }

    // Financial Assistance Report - applicant_details table removed
    static async getFinancialAssistance(centerId = null, user = {}) {
        try {
            // applicant_details table has been removed - return empty result
            return [];
        } catch (error) {
            throw new Error(`Error fetching financial assistance: ${error.message}`);
        }
    }

    // Food Assistance Report - applicant_details table removed
    static async getFoodAssistance(centerId = null, user = {}) {
        try {
            // applicant_details table has been removed - return empty result
            return [];
        } catch (error) {
            throw new Error(`Error fetching food assistance: ${error.message}`);
        }
    }

    // Home Visits Report - applicant_details table removed
    static async getHomeVisits(centerId = null, user = {}) {
        try {
            // applicant_details table has been removed - return empty result
            return [];
        } catch (error) {
            throw new Error(`Error fetching home visits: ${error.message}`);
        }
    }

    // Relationship Report - applicant_details table removed
    static async getRelationshipReport(centerId = null, user = {}) {
        try {
            // applicant_details table has been removed - return empty result
            return [];
        } catch (error) {
            throw new Error(`Error fetching relationship report: ${error.message}`);
        }
    }



    // Skills Matrix Report (Employee Skills)
    static async getSkillsMatrix(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    e.id AS employee_id,
                    e.name,
                    e.surname,
                    e.id_number,
                    e.contact_number AS cell_number,
                    d.name AS department_name,
                    es.course,
                    es.institution,
                    es.date_conducted,
                    es.date_expired,
                    es.training_outcome,
                    es.created_by,
                    es.created_at,
                    -- Join with lookup tables for readable names
                    tc.name AS course_name,
                    ti.institute_name AS institution_name,
                    tout.name AS program_outcome_name,
                    -- Calculate status based on date_expired
                    CASE
                        WHEN es.date_expired IS NULL THEN 'No Expiry'
                        WHEN es.date_expired < CURRENT_DATE THEN 'Expired'
                        WHEN es.date_expired <= CURRENT_DATE + INTERVAL '30 days' THEN 'Coming Up Soon'
                        ELSE 'Still Valid'
                    END AS status
                FROM employee_skills es
                INNER JOIN employee e ON es.employee_id = e.id
                LEFT JOIN departments d ON e.department = d.id
                LEFT JOIN training_courses tc ON es.course = tc.id
                LEFT JOIN training_institutions ti ON es.institution = ti.id
                LEFT JOIN training_outcome tout ON es.training_outcome = tout.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'es');
            const finalQuery = `${text} ORDER BY e.surname, e.name, es.date_expired ASC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching skills matrix: ${error.message}`);
        }
    }

    // Imam Details Report
    static async getImamDetails(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id,
                    ip.name,
                    ip.surname,
                    ip.email,
                    ip.id_number,
                    ip.cell_number,
                    ip.contact_number,
                    ip.dob,
                    ip.created_by,
                    ip.created_at,
                    ip.updated_by,
                    ip.updated_at,
                    -- Join with lookup tables for readable names
                    t.name AS title_name,
                    n.name AS nationality_name,
                    m.name AS madhab_name,
                    r.name AS race_name,
                    g.name AS gender_name,
                    ms.name AS marital_status_name,
                    s.name AS status_name
                FROM Imam_Profiles ip
                LEFT JOIN Title_Lookup t ON ip.title = t.id
                LEFT JOIN Nationality n ON ip.nationality_id = n.id
                LEFT JOIN Madhab m ON ip.madhab = m.id
                LEFT JOIN Race r ON ip.race = r.id
                LEFT JOIN Gender g ON ip.gender = g.id
                LEFT JOIN Marital_Status ms ON ip.marital_status = ms.id
                LEFT JOIN Status s ON ip.status_id = s.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'ip');
            const finalQuery = `${text} ORDER BY ip.created_at DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching imam details: ${error.message}`);
        }
    }

    // Hardship Relief Report
    static async getHardshipRelief(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    hr.id,
                    hr.request_for,
                    hr.is_muslim,
                    hr.name_of_person_community,
                    hr.area_of_residence,
                    hr.age_group,
                    hr.has_disabilities,
                    hr.disability_details,
                    hr.dependents,
                    hr.assistance_type,
                    hr.amount_required_local_currency,
                    hr.acknowledge,
                    hr.status_id,
                    hr.datestamp,
                    hr.created_by,
                    hr.created_at,
                    hr.updated_by,
                    hr.updated_at,
                    -- Join with lookup tables for readable names
                    rfl.name AS request_for_name,
                    yn.name AS is_muslim_name,
                    s.name AS suburb_name,
                    yn2.name AS has_disabilities_name,
                    st.name AS status_name
                FROM hardship_relief hr
                INNER JOIN Imam_Profiles ip ON hr.imam_profile_id = ip.id
                LEFT JOIN Request_For_Lookup rfl ON hr.request_for = rfl.id
                LEFT JOIN Yes_No_Some_Not_Lookup yn ON hr.is_muslim = yn.id
                LEFT JOIN Suburb s ON hr.area_of_residence = s.id
                LEFT JOIN Yes_No yn2 ON hr.has_disabilities = yn2.id
                LEFT JOIN Status st ON hr.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'hr');
            const finalQuery = `${text} ORDER BY hr.created_at DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching hardship relief: ${error.message}`);
        }
    }

    // Community Engagement Report
    static async getCommunityEngagement(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    ce.id,
                    ce.engagement_type,
                    ce.people_count,
                    ce.engagement_date,
                    ce.acknowledge,
                    ce.status_id,
                    ce.comment,
                    ce.datestamp,
                    ce.created_by,
                    ce.created_at,
                    ce.updated_by,
                    ce.updated_at,
                    -- Join with lookup tables for readable names
                    cet.name AS engagement_type_name,
                    st.name AS status_name
                FROM Community_Engagement ce
                INNER JOIN Imam_Profiles ip ON ce.imam_profile_id = ip.id
                LEFT JOIN Community_Engagement_Type cet ON ce.engagement_type = cet.id
                LEFT JOIN Status st ON ce.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'ce');
            const finalQuery = `${text} ORDER BY ce.engagement_date DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching community engagement: ${error.message}`);
        }
    }

    // Borehole Report
    static async getBorehole(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    b.id,
                    b.where_required,
                    b.has_electricity,
                    b.received_borehole_before,
                    b.current_water_source,
                    b.distance_to_water_source,
                    b.beneficiaries_count,
                    b.challenges_due_to_lack_of_water,
                    b.motivation,
                    b.acknowledge,
                    b.status_id,
                    b.datestamp,
                    b.Created_By,
                    b.Created_At,
                    b.Updated_By,
                    b.Updated_At,
                    -- Join with lookup tables for readable names
                    bl.name AS borehole_location_name,
                    yn1.name AS has_electricity_name,
                    yn2.name AS received_borehole_before_name,
                    st.name AS status_name
                FROM borehole b
                INNER JOIN Imam_Profiles ip ON b.imam_profile_id = ip.id
                LEFT JOIN Borehole_Location bl ON b.where_required = bl.id
                LEFT JOIN Yes_No yn1 ON b.has_electricity = yn1.id
                LEFT JOIN Yes_No yn2 ON b.received_borehole_before = yn2.id
                LEFT JOIN Status st ON b.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'b');
            const finalQuery = `${text} ORDER BY b.Created_At DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching borehole: ${error.message}`);
        }
    }

    // Continuous Professional Development Report
    static async getContinuousProfessionalDevelopment(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    cpd.id,
                    cpd.course_name,
                    cpd.course_type,
                    cpd.institution_name,
                    cpd.start_date,
                    cpd.end_date,
                    cpd.cost,
                    cpd.cost_currency,
                    cpd.funding_source,
                    cpd.completion_status,
                    cpd.certificate_obtained,
                    cpd.acknowledge,
                    cpd.status_id,
                    cpd.datestamp,
                    cpd.Created_By,
                    cpd.Created_At,
                    cpd.Updated_By,
                    cpd.Updated_At,
                    -- Join with lookup tables for readable names
                    c.name AS cost_currency_name,
                    st.name AS status_name
                FROM educational_development cpd
                INNER JOIN Imam_Profiles ip ON cpd.imam_profile_id = ip.id
                LEFT JOIN Currency c ON cpd.cost_currency = c.id
                LEFT JOIN Status st ON cpd.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'cpd');
            const finalQuery = `${text} ORDER BY cpd.Created_At DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching continuous professional development: ${error.message}`);
        }
    }

    // Higher Education Request Report
    static async getHigherEducationRequest(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    her.id,
                    her.course_type,
                    her.course_name,
                    her.cost_local_currency,
                    her.cost_south_african_rand,
                    her.institute_name,
                    her.duration,
                    her.start_date,
                    her.end_date,
                    her.study_method,
                    her.days_times_attending,
                    her.times_per_month,
                    her.semesters_per_year,
                    her.will_stop_imam_duties,
                    her.acknowledge,
                    her.status_id,
                    her.datestamp,
                    her.created_by,
                    her.created_at,
                    her.updated_by,
                    her.updated_at,
                    -- Join with lookup tables for readable names
                    st.name AS status_name
                FROM higher_education_request her
                INNER JOIN Imam_Profiles ip ON her.imam_profile_id = ip.id
                LEFT JOIN Status st ON her.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'her');
            const finalQuery = `${text} ORDER BY her.created_at DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching higher education request: ${error.message}`);
        }
    }

    // Jumuah Audio Khutbah Report
    static async getJumuahAudioKhutbah(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    jak.id,
                    jak.khutbah_topic,
                    jak.khutbah_date,
                    jak.masjid_name,
                    jak.town,
                    jak.attendance_count,
                    jak.language,
                    jak.acknowledge,
                    jak.status_id,
                    jak.comment,
                    jak.datestamp,
                    jak.Created_By,
                    jak.Created_At,
                    jak.Updated_By,
                    jak.Updated_At,
                    -- Join with lookup tables for readable names
                    s.name AS suburb_name,
                    l.name AS language_name,
                    st.name AS status_name
                FROM Jumuah_Audio_Khutbah jak
                INNER JOIN Imam_Profiles ip ON jak.imam_profile_id = ip.id
                LEFT JOIN Suburb s ON jak.town = s.id
                LEFT JOIN Language l ON jak.language = l.id
                LEFT JOIN Status st ON jak.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'jak');
            const finalQuery = `${text} ORDER BY jak.khutbah_date DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching jumuah audio khutbah: ${error.message}`);
        }
    }

    // Jumuah Khutbah Topic Submission Report
    static async getJumuahKhutbahTopicSubmission(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    jkts.id,
                    jkts.topic,
                    jkts.masjid_name,
                    jkts.town,
                    jkts.attendance_count,
                    jkts.language,
                    jkts.acknowledge,
                    jkts.status_id,
                    jkts.comment,
                    jkts.datestamp,
                    jkts.Created_By,
                    jkts.Created_At,
                    jkts.Updated_By,
                    jkts.Updated_At,
                    -- Join with lookup tables for readable names
                    s.name AS suburb_name,
                    l.name AS language_name,
                    st.name AS status_name
                FROM Jumuah_Khutbah_Topic jkts
                INNER JOIN Imam_Profiles ip ON jkts.imam_profile_id = ip.id
                LEFT JOIN Suburb s ON jkts.town = s.id
                LEFT JOIN Language l ON jkts.language = l.id
                LEFT JOIN Status st ON jkts.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'jkts');
            const finalQuery = `${text} ORDER BY jkts.datestamp DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching jumuah khutbah topic submission: ${error.message}`);
        }
    }

    // Medical Reimbursement Report
    static async getMedicalReimbursement(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    mr.id,
                    mr.relationship_type,
                    mr.visit_type,
                    mr.visit_date,
                    mr.illness_description,
                    mr.service_provider,
                    mr.amount,
                    mr.acknowledge,
                    mr.status_id,
                    mr.comment,
                    mr.datestamp,
                    mr.created_by,
                    mr.created_at,
                    mr.updated_by,
                    mr.updated_at,
                    -- Join with lookup tables for readable names
                    rt.name AS relationship_type_name,
                    mvt.name AS visit_type_name,
                    msp.name AS service_provider_name,
                    st.name AS status_name
                FROM Medical_Reimbursement mr
                INNER JOIN Imam_Profiles ip ON mr.imam_profile_id = ip.id
                LEFT JOIN Relationship_Types rt ON mr.relationship_type = rt.id
                LEFT JOIN Medical_Visit_Type mvt ON mr.visit_type = mvt.id
                LEFT JOIN Medical_Service_Provider msp ON mr.service_provider = msp.id
                LEFT JOIN Status st ON mr.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'mr');
            const finalQuery = `${text} ORDER BY mr.visit_date DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching medical reimbursement: ${error.message}`);
        }
    }

    // New Baby Bonus Report
    static async getNewBabyBonus(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    nbb.id,
                    nbb.spouse_name,
                    nbb.spouse_relationship_id,
                    ir.name AS spouse_name_from_relationship,
                    ir.surname AS spouse_surname_from_relationship,
                    nbb.baby_name,
                    nbb.baby_gender,
                    nbb.gender,
                    nbb.identification_number,
                    nbb.baby_dob,
                    nbb.acknowledge,
                    nbb.status_id,
                    nbb.comment,
                    nbb.datestamp,
                    nbb.created_by,
                    nbb.created_at,
                    nbb.updated_by,
                    nbb.updated_at,
                    -- Join with lookup tables for readable names
                    g.name AS baby_gender_name,
                    g2.name AS gender_name,
                    st.name AS status_name
                FROM New_Baby_Bonus nbb
                INNER JOIN Imam_Profiles ip ON nbb.imam_profile_id = ip.id
                LEFT JOIN Gender g ON nbb.baby_gender = g.id
                LEFT JOIN Gender g2 ON nbb.gender = g2.id
                LEFT JOIN Imam_Relationships ir ON nbb.spouse_relationship_id = ir.id
                LEFT JOIN Status st ON nbb.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'nbb');
            const finalQuery = `${text} ORDER BY nbb.baby_dob DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching new baby bonus: ${error.message}`);
        }
    }

    // New Muslim Bonus Report
    static async getNewMuslimBonus(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    nmb.id,
                    nmb.revert_name,
                    nmb.revert_gender,
                    nmb.revert_dob,
                    nmb.revert_phone,
                    nmb.revert_email,
                    nmb.revert_reason,
                    nmb.revert_pack_requested,
                    nmb.course_completed,
                    nmb.acknowledge,
                    nmb.status_id,
                    nmb.comment,
                    nmb.datestamp,
                    nmb.created_by,
                    nmb.created_at,
                    nmb.updated_by,
                    nmb.updated_at,
                    -- Join with lookup tables for readable names
                    g.name AS revert_gender_name,
                    yn1.name AS requested_revert_pack_name,
                    yn2.name AS completed_33_lessons_name,
                    st.name AS status_name
                FROM New_Muslim_Bonus nmb
                INNER JOIN Imam_Profiles ip ON nmb.imam_profile_id = ip.id
                LEFT JOIN Gender g ON nmb.revert_gender = g.id
                LEFT JOIN Yes_No yn1 ON nmb.revert_pack_requested = yn1.id
                LEFT JOIN Yes_No yn2 ON nmb.course_completed = yn2.id
                LEFT JOIN Status st ON nmb.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'nmb');
            const finalQuery = `${text} ORDER BY nmb.datestamp DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching new muslim bonus: ${error.message}`);
        }
    }

    // Nikah Bonus Report
    static async getNikahBonus(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    nb.id,
                    nb.spouse_name,
                    nb.nikah_date,
                    nb.is_first_nikah,
                    nb.acknowledge,
                    nb.status_id,
                    nb.comment,
                    nb.datestamp,
                    nb.created_by,
                    nb.created_at,
                    nb.updated_by,
                    nb.updated_at,
                    -- Join with lookup tables for readable names
                    yn.name AS is_first_nikah_name,
                    st.name AS status_name
                FROM Nikah_Bonus nb
                INNER JOIN Imam_Profiles ip ON nb.imam_profile_id = ip.id
                LEFT JOIN Yes_No yn ON nb.is_first_nikah = yn.id
                LEFT JOIN Status st ON nb.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'nb');
            const finalQuery = `${text} ORDER BY nb.nikah_date DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching nikah bonus: ${error.message}`);
        }
    }

    // Pearls of Wisdom Report
    static async getPearlsOfWisdom(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    pow.id,
                    pow.resource_type,
                    pow.resource_title,
                    pow.author_speaker,
                    pow.heading_description,
                    pow.pearl_one,
                    pow.pearl_two,
                    pow.pearl_three,
                    pow.pearl_four,
                    pow.pearl_five,
                    pow.acknowledge,
                    pow.status_id,
                    pow.comment,
                    pow.datestamp,
                    pow.created_by,
                    pow.created_at,
                    pow.updated_by,
                    pow.updated_at,
                    -- Join with lookup tables for readable names
                    rt.name AS resource_type_name,
                    st.name AS status_name
                FROM Pearls_Of_Wisdom pow
                INNER JOIN Imam_Profiles ip ON pow.imam_profile_id = ip.id
                LEFT JOIN Resource_Type rt ON pow.resource_type = rt.id
                LEFT JOIN Status st ON pow.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'pow');
            const finalQuery = `${text} ORDER BY pow.datestamp DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching pearls of wisdom: ${error.message}`);
        }
    }

    // Tickets Report
    static async getTickets(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    t.id,
                    t.classification_id,
                    t.description,
                    t.status_id,
                    t.allocated_to,
                    t.created_at,
                    t.closed_at,
                    t.closing_notes,
                    t.created_by,
                    t.updated_by,
                    t.updated_at,
                    -- Join with lookup tables for readable names
                    cl.name AS classification_name,
                    st.name AS status_name,
                    e.name AS allocated_to_name,
                    e.surname AS allocated_to_surname
                FROM tickets t
                LEFT JOIN Classification_Lookup cl ON t.classification_id = cl.id
                LEFT JOIN Status st ON t.status_id = st.id
                LEFT JOIN Employee e ON t.allocated_to = e.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 't');
            const finalQuery = `${text} ORDER BY t.created_at DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching tickets: ${error.message}`);
        }
    }

    // Tree Requests Report
    static async getTreeRequests(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    tp.id,
                    tp.number_of_trees,
                    tp.tree_type,
                    tp.planting_location,
                    tp.planting_date,
                    tp.acknowledge,
                    tp.status_id,
                    tp.comment,
                    tp.datestamp,
                    tp.created_by,
                    tp.created_at,
                    tp.updated_by,
                    tp.updated_at,
                    -- Join with lookup tables for readable names
                    st.name AS status_name
                FROM tree_planting tp
                INNER JOIN Imam_Profiles ip ON tp.imam_profile_id = ip.id
                LEFT JOIN Status st ON tp.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'tp');
            const finalQuery = `${text} ORDER BY tp.created_at DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching tree requests: ${error.message}`);
        }
    }

    // WAQF Loan Report
    static async getWaqfLoan(centerId = null, user = {}) {
        try {
            let query = `
                SELECT 
                    ip.id AS imam_id,
                    ip.name AS imam_name,
                    ip.surname AS imam_surname,
                    ip.email AS imam_email,
                    ip.id_number AS imam_id_number,
                    ip.cell_number AS imam_cell_number,
                    wl.id,
                    wl.participated_recent_bonuses_90_days,
                    wl.recent_bonuses_details,
                    wl.active_dawah,
                    wl.dawah_activities_details,
                    wl.contributed_to_waqf_loan_fund,
                    wl.loan_type,
                    wl.loan_reason,
                    wl.tried_employer_request,
                    wl.promise_to_repay,
                    wl.understand_waqf_fund,
                    wl.amount_required,
                    wl.monthly_income,
                    wl.monthly_expenses,
                    wl.repayment_structure,
                    wl.repayment_explanation,
                    wl.first_guarantor_name,
                    wl.first_guarantor_contact,
                    wl.second_guarantor_name,
                    wl.second_guarantor_contact,
                    wl.acknowledge,
                    wl.status_id,
                    wl.comment,
                    wl.datestamp,
                    wl.created_by,
                    wl.created_at,
                    wl.updated_by,
                    wl.updated_at,
                    -- Join with lookup tables for readable names
                    yn1.name AS participated_recent_bonuses_name,
                    yn2.name AS active_dawah_name,
                    yn3.name AS contributed_to_waqf_loan_fund_name,
                    yn4.name AS promise_to_repay_name,
                    yn5.name AS understand_waqf_fund_name,
                    st.name AS status_name
                FROM waqf_loan wl
                INNER JOIN Imam_Profiles ip ON wl.imam_profile_id = ip.id
                LEFT JOIN Yes_No yn1 ON wl.participated_recent_bonuses_90_days = yn1.id
                LEFT JOIN Yes_No yn2 ON wl.active_dawah = yn2.id
                LEFT JOIN Yes_No yn3 ON wl.contributed_to_waqf_loan_fund = yn3.id
                LEFT JOIN Yes_No yn4 ON wl.promise_to_repay = yn4.id
                LEFT JOIN Yes_No yn5 ON wl.understand_waqf_fund = yn5.id
                LEFT JOIN Status st ON wl.status_id = st.id
            `;
            
            const params = [];
            const { text, values } = withCenterFilter(query, params, user, centerId, 'wl');
            const finalQuery = `${text} ORDER BY wl.created_at DESC`;
            const result = await db.query(finalQuery, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Error fetching waqf loan: ${error.message}`);
        }
    }
}

module.exports = ReportsModel;
