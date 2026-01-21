const employeeModel = require('../models/employeeModel');
const pool = require('../config/db');

const parseEmployeeId = (rawId) => {
  const parsed = parseInt(rawId, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getEmployeeContext = async (req) => {
  const employeeId = parseEmployeeId(req.params.id);
  if (!employeeId) {
    return { error: { status: 400, message: 'Invalid employee ID. Must be a number.' } };
  }

  try {
    const lookupCenterId = req.isSuperAdmin ? null : req.center_id || null;
    const employee = await employeeModel.getById(employeeId, lookupCenterId);
    if (!employee) {
      return { error: { status: 404, message: 'Employee not found' } };
    }

    const username = employee.username || employee.Username;
    if (!username) {
      return { error: { status: 400, message: 'Employee username is missing' } };
    }

    // center_id has been removed from Employee table
    return {
      employeeId,
      username,
      centerId: null,
    };
  } catch (err) {
    return { error: { status: 500, message: err.message || 'Failed to resolve employee context' } };
  }
};

const buildCountResponse = (res, count) => {
  res.json({ count: Number(count) || 0 });
};

const employeeController = {
  getAll: async (req, res) => {
    try {
      // ✅ Apply tenant filtering: App Admin (center_id=null) sees all, others see only their center
      // Pass centerId: null for App Admin, user.center_id for others
      let centerId = req.center_id || req.user?.center_id || null;
      
      // ✅ Normalize centerId: convert to integer or null
      if (centerId !== null && centerId !== undefined) {
        centerId = parseInt(centerId);
        if (isNaN(centerId)) {
          centerId = null; // Invalid number becomes null
        }
      } else {
        centerId = null; // Explicitly set to null
      }
      
      // ✅ Org Admin (role 3) should only see employees with user_type IN (3, 4, 5)
      // Excluding App Admin (1) and HQ (2)
      let allowedUserTypes = null;
      const userType = parseInt(req.user?.user_type);
      if (userType === 3) { // Org Admin
        allowedUserTypes = [3, 4, 5]; // Only Org Admin, Org Executive, and Caseworker
      }
      
      const data = await employeeModel.getAll(centerId, allowedUserTypes);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      // ✅ Apply tenant filtering: App Admin (center_id=null) sees all, others see only their center
      const centerId = req.center_id || req.user?.center_id || null;
      
      // ✅ Validate ID parameter
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid employee ID. Must be a number.' });
      }
      
      const data = await employeeModel.getById(id, centerId);
      if (!data) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  },

  create: async (req, res) => {
    try {
      // ✅ Add audit fields
      const username = req.user?.username || 'system';
      req.body.created_by = username;
      req.body.updated_by = username;
      
      // Remove center_id if present (column has been removed from Employee table)
      delete req.body.center_id;
      
      const data = await employeeModel.create(req.body);
      res.status(201).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      // ✅ Get existing employee to check if it exists
      const existingEmployee = await employeeModel.getById(req.params.id, null);
      if (!existingEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      // ✅ Add audit field (don't allow overwrite of created_by)
      const username = req.user?.username || 'system';
      req.body.updated_by = username;
      delete req.body.created_by; // Prevent overwrite
      
      // Remove center_id if present (column has been removed from Employee table)
      delete req.body.center_id;
      
      // ✅ Apply tenant filtering: App Admin (center_id=null) can update all, others only their center
      const centerId = req.center_id || req.user?.center_id || null;
      const data = await employeeModel.update(req.params.id, req.body, centerId);
      if (!data) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      // ✅ Apply tenant filtering: App Admin (center_id=null) can delete all, others only their center
      const centerId = req.center_id || req.user?.center_id || null;
      const deleted = await employeeModel.delete(req.params.id, centerId);
      if (!deleted) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getTotalApplicants: async (req, res) => {
    const context = await getEmployeeContext(req);
    if (context.error) {
      return res.status(context.error.status).json({ error: context.error.message });
    }

    const { username } = context;
    // Applicant_Details table has been removed - use Imam_Profiles instead
    try {
      const result = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM Imam_Profiles ip
        INNER JOIN Employee e ON ip.employee_id = e.id
        WHERE e.username = $1
      `, [username]);
      buildCountResponse(res, result.rows[0]?.count);
    } catch (err) {
      console.error('[ERROR] EmployeeController.getTotalApplicants -', err.message);
      res.status(500).json({ error: err.message || 'Failed to fetch total imam profiles' });
    }
  },

  getTotalHomeVisits: async (req, res) => {
    const context = await getEmployeeContext(req);
    if (context.error) {
      return res.status(context.error.status).json({ error: context.error.message });
    }

    const { username } = context;
    // Home_Visit table removed - use Community_Engagement from Imam Profiles instead
    try {
      const result = await pool.query(`
        SELECT COUNT(*)::int AS count
        FROM Community_Engagement ce
        INNER JOIN Imam_Profiles ip ON ce.imam_profile_id = ip.id
        INNER JOIN Employee e ON ip.employee_id = e.id
        WHERE e.username = $1
      `, [username]);
      buildCountResponse(res, result.rows[0]?.count);
    } catch (err) {
      console.error('[ERROR] EmployeeController.getTotalHomeVisits -', err.message);
      res.status(500).json({ error: err.message || 'Failed to fetch total community engagements' });
    }
  },

  getTotalSkills: async (req, res) => {
    const context = await getEmployeeContext(req);
    if (context.error) {
      return res.status(context.error.status).json({ error: context.error.message });
    }

    const { employeeId } = context;
    const params = [employeeId];
    const query = `
      SELECT COUNT(*)::int AS count
      FROM Employee_Skills
      WHERE Employee_ID = $1
    `;

    try {
      const result = await pool.query(query, params);
      buildCountResponse(res, result.rows[0]?.count);
    } catch (err) {
      console.error('[ERROR] EmployeeController.getTotalSkills -', err.message);
      res.status(500).json({ error: err.message || 'Failed to fetch total skills' });
    }
  },
};

module.exports = employeeController;
