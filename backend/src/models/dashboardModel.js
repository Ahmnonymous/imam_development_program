const pool = require('../config/db');

const DURATION_CONFIGS = {
  '1': { key: 'year', interval: 'month', step: '1 month', periods: 12, labelType: 'month' },
  '2': { key: 'month', interval: 'week', step: '1 week', periods: 8, labelType: 'week' },
  '3': { key: 'week', interval: 'day', step: '1 day', periods: 7, labelType: 'day' },
};

const METRIC_DEFINITIONS = [
  {
    key: 'imamProfiles',
    label: ' Imam Profiles',
    table: 'Imam_Profiles',
    alias: 'ip',
    // icon: 'bx-user',
  },
  {
    key: 'jumuahKhutbah',
    label: ' Jumuah Khutbah',
    table: 'Jumuah_Khutbah_Topic',
    alias: 'jk',
    // icon: 'bx-message',
  },
  {
    key: 'communityEngagement',
    label: ' Community Engagement',
    table: 'Community_Engagement',
    alias: 'ce',
    // icon: 'bx-group',
  },
  {
    key: 'medicalReimbursement',
    label: ' Medical Reimbursement',
    table: 'Medical_Reimbursement',
    alias: 'mr',
    // icon: 'bx-heart',
  },
];

function getDurationConfig(duration) {
  const key = String(duration || '1');
  return DURATION_CONFIGS[key] || DURATION_CONFIGS['1'];
}

function buildCenterCondition(alias, paramIndex) {
  // center_id has been removed - return always-true condition
  return '1=1';
}

function buildTimeSeriesQuery({ table, alias }, config, centerParamIndex) {
  const { interval, step, periods } = config;
  const centerCondition = buildCenterCondition(alias, centerParamIndex);
  const [stepSizeRaw, stepUnitRaw] = String(step).split(' ');
  const stepSize = Number(stepSizeRaw) || 1;
  const stepUnit = stepUnitRaw || interval;
  const rangeInterval = `${(periods - 1) * stepSize} ${stepUnit}`;

  return `
    WITH config AS (
      SELECT 
        date_trunc('${interval}', CURRENT_DATE) AS current_period_start,
        (date_trunc('${interval}', CURRENT_DATE) - INTERVAL '${rangeInterval}') AS range_start
    ),
    periods AS (
      SELECT generate_series(
        (SELECT range_start FROM config),
        (SELECT current_period_start FROM config),
        INTERVAL '${step}'
      ) AS period_start
    )
    SELECT
      periods.period_start,
      COALESCE(counts.value, 0)::INTEGER AS value
    FROM periods
    LEFT JOIN (
      SELECT
        date_trunc('${interval}', ${alias}.created_at) AS period_start,
        COUNT(*)::INTEGER AS value
      FROM ${table} ${alias}, config
      WHERE ${centerCondition}
        AND ${alias}.created_at >= config.range_start
      GROUP BY 1
    ) counts ON counts.period_start = periods.period_start
    ORDER BY periods.period_start;
  `;
}

function formatPeriodLabel(dateString, config) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const options = { timeZone: 'UTC' };

  if (config.labelType === 'month') {
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  if (config.labelType === 'week') {
    const end = new Date(date);
    end.setUTCDate(end.getUTCDate() + 6);
    const startLabel = date.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    const endLabel = end.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return `${startLabel} - ${endLabel}`;
  }

  // Default to day labels
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

const dashboardModel = {
  getApplicantStatistics: async (centerId, isSuperAdmin) => {
    try {
      const params = [];
      
      // Get statistics from Imam Profiles and related tables
      const [
        nationalityStats,
        genderStats,
        educationStats,
        raceStats,
        suburbStats,
        employmentStats,
        maritalStats,
        statusStats,
        summaryStats,
        imamTrendStats,
        jumuahTrendStats,
        communityTrendStats,
        medicalTrendStats,
      ] = await Promise.all([
        // Nationality statistics from Imam Profiles
        pool.query(`
          SELECT 
            c.name as label,
            COUNT(ip.id)::INTEGER as value
          FROM Imam_Profiles ip
          LEFT JOIN Country c ON ip.nationality_id = c.id
          WHERE c.name IS NOT NULL AND ip.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)
          GROUP BY c.id, c.name
          ORDER BY value DESC
        `, params),
        
        // Gender statistics from Imam Profiles
        pool.query(`
          SELECT 
            g.name as label,
            COUNT(ip.id)::INTEGER as value
          FROM Imam_Profiles ip
          LEFT JOIN Gender g ON ip.gender = g.id
          WHERE g.name IS NOT NULL AND ip.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)
          GROUP BY g.id, g.name
          ORDER BY value DESC
        `, params),
        
        // Education statistics from Imam Profiles (using Highest_Education_Level from Employee)
        pool.query(`
          SELECT 
            e.name as label,
            COUNT(DISTINCT ip.id)::INTEGER as value
          FROM Imam_Profiles ip
          INNER JOIN Employee emp ON ip.employee_id = emp.id
          LEFT JOIN Education_Level e ON emp.highest_education_level = e.id
          WHERE e.name IS NOT NULL AND ip.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)
          GROUP BY e.id, e.name
          ORDER BY value DESC
        `, params),
        
        // Race statistics from Imam Profiles
        pool.query(`
          SELECT 
            r.name as label,
            COUNT(ip.id)::INTEGER as value
          FROM Imam_Profiles ip
          LEFT JOIN Race r ON ip.race = r.id
          WHERE r.name IS NOT NULL AND ip.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)
          GROUP BY r.id, r.name
          ORDER BY value DESC
        `, params),
        
        // Suburb statistics from Imam Profiles
        pool.query(`
          SELECT 
            s.name as label,
            COUNT(ip.id)::INTEGER as value
          FROM Imam_Profiles ip
          LEFT JOIN Suburb s ON ip.suburb_id = s.id
          WHERE s.name IS NOT NULL AND ip.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)
          GROUP BY s.id, s.name
          ORDER BY value DESC
          LIMIT 20
        `, params),
        
        // Employment Type statistics from Imam Profiles
        pool.query(`
          SELECT 
            et.name as label,
            COUNT(ip.id)::INTEGER as value
          FROM Imam_Profiles ip
          LEFT JOIN Employment_Type et ON ip.employment_type = et.id
          WHERE et.name IS NOT NULL AND ip.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)
          GROUP BY et.id, et.name
          ORDER BY value DESC
        `, params),
        
        // Marital Status statistics from Imam Profiles
        pool.query(`
          SELECT 
            m.name as label,
            COUNT(ip.id)::INTEGER as value
          FROM Imam_Profiles ip
          LEFT JOIN Marital_Status m ON ip.marital_status = m.id
          WHERE m.name IS NOT NULL AND ip.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)
          GROUP BY m.id, m.name
          ORDER BY value DESC
        `, params),
        
        // Status statistics from Imam Profiles
        pool.query(`
          SELECT 
            s.name as label,
            COUNT(ip.id)::INTEGER as value
          FROM Imam_Profiles ip
          LEFT JOIN Status s ON ip.status_id = s.id
          WHERE s.name IS NOT NULL
          GROUP BY s.id, s.name
          ORDER BY value DESC
        `, params),
        
        // Summary statistics from Imam Profiles
        pool.query(`
          SELECT 
            COUNT(*)::INTEGER as total_imams,
            COUNT(CASE WHEN ip.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1) THEN 1 END)::INTEGER as approved_imams,
            COUNT(CASE WHEN ip.created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::INTEGER as new_this_month,
            (SELECT COUNT(*)::INTEGER FROM Jumuah_Khutbah_Topic jk WHERE jk.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)) AS total_jumuah_khutbah,
            (SELECT COUNT(*)::INTEGER FROM Community_Engagement ce WHERE ce.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)) AS total_community_engagement,
            (SELECT COUNT(*)::INTEGER FROM Medical_Reimbursement mr WHERE mr.status_id = (SELECT id FROM Status WHERE name = 'Approved' LIMIT 1)) AS total_medical_reimbursement
          FROM Imam_Profiles ip
        `, params),

        // Imam Profiles trend (last 8 months)
        pool.query(`
          WITH months AS (
            SELECT generate_series(
              date_trunc('month', CURRENT_DATE) - INTERVAL '7 months',
              date_trunc('month', CURRENT_DATE),
              INTERVAL '1 month'
            ) AS month_start
          )
          SELECT
            months.month_start,
            COALESCE(counts.value, 0)::INTEGER AS value
          FROM months
          LEFT JOIN (
            SELECT 
              date_trunc('month', ip.created_at) AS month_start,
              COUNT(*)::INTEGER AS value
            FROM Imam_Profiles ip
            WHERE ip.created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '7 months'
            GROUP BY 1
          ) counts ON counts.month_start = months.month_start
          ORDER BY months.month_start
        `, params),

        // Jumuah Khutbah trend (last 8 months)
        pool.query(`
          WITH months AS (
            SELECT generate_series(
              date_trunc('month', CURRENT_DATE) - INTERVAL '7 months',
              date_trunc('month', CURRENT_DATE),
              INTERVAL '1 month'
            ) AS month_start
          )
          SELECT
            months.month_start,
            COALESCE(counts.value, 0)::INTEGER AS value
          FROM months
          LEFT JOIN (
            SELECT 
              date_trunc('month', jk.created_at) AS month_start,
              COUNT(*)::INTEGER AS value
            FROM Jumuah_Khutbah_Topic jk
            WHERE jk.created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '7 months'
            GROUP BY 1
          ) counts ON counts.month_start = months.month_start
          ORDER BY months.month_start
        `, params),

        // Community Engagement trend (last 8 months)
        pool.query(`
          WITH months AS (
            SELECT generate_series(
              date_trunc('month', CURRENT_DATE) - INTERVAL '7 months',
              date_trunc('month', CURRENT_DATE),
              INTERVAL '1 month'
            ) AS month_start
          )
          SELECT
            months.month_start,
            COALESCE(counts.value, 0)::INTEGER AS value
          FROM months
          LEFT JOIN (
            SELECT 
              date_trunc('month', ce.created_at) AS month_start,
              COUNT(*)::INTEGER AS value
            FROM Community_Engagement ce
            WHERE ce.created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '7 months'
            GROUP BY 1
          ) counts ON counts.month_start = months.month_start
          ORDER BY months.month_start
        `, params),

        // Medical Reimbursement trend (last 8 months)
        pool.query(`
          WITH months AS (
            SELECT generate_series(
              date_trunc('month', CURRENT_DATE) - INTERVAL '7 months',
              date_trunc('month', CURRENT_DATE),
              INTERVAL '1 month'
            ) AS month_start
          )
          SELECT
            months.month_start,
            COALESCE(counts.value, 0)::INTEGER AS value
          FROM months
          LEFT JOIN (
            SELECT 
              date_trunc('month', mr.created_at) AS month_start,
              COUNT(*)::INTEGER AS value
            FROM Medical_Reimbursement mr
            WHERE mr.created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '7 months'
            GROUP BY 1
          ) counts ON counts.month_start = months.month_start
          ORDER BY months.month_start
        `, params),
      ]);

      const mapTrendValues = (rows) => rows.map((row) => Number(row.value) || 0);
      const calculateChange = (series) => {
        if (!Array.isArray(series) || series.length < 2) return null;
        const prev = series[series.length - 2];
        const current = series[series.length - 1];
        if (prev === 0) {
          if (current === 0) return 0;
          return 100;
        }
        return ((current - prev) / prev) * 100;
      };

      const imamTrendSeries = mapTrendValues(imamTrendStats.rows);
      const jumuahTrendSeries = mapTrendValues(jumuahTrendStats.rows);
      const communityTrendSeries = mapTrendValues(communityTrendStats.rows);
      const medicalTrendSeries = mapTrendValues(medicalTrendStats.rows);

      const summaryRow = summaryStats.rows[0] || {
        total_imams: 0,
        approved_imams: 0,
        new_this_month: 0,
        total_jumuah_khutbah: 0,
        total_community_engagement: 0,
        total_medical_reimbursement: 0,
      };

      return {
        nationality: nationalityStats.rows,
        gender: genderStats.rows,
        education: educationStats.rows,
        race: raceStats.rows,
        suburbs: suburbStats.rows,
        employment: employmentStats.rows,
        marital: maritalStats.rows,
        fileStatus: statusStats.rows,
        fileCondition: [],
        summary: {
          total_applicants: Number(summaryRow.total_imams) || 0,
          active_applicants: Number(summaryRow.approved_imams) || 0,
          new_this_month: Number(summaryRow.new_this_month) || 0,
          total_food_aid: Number(summaryRow.total_jumuah_khutbah) || 0,
          total_home_visits: Number(summaryRow.total_community_engagement) || 0,
          total_programs: Number(summaryRow.total_medical_reimbursement) || 0,
        },
        trends: {
          applicants: imamTrendSeries,
          foodAid: jumuahTrendSeries,
          homeVisits: communityTrendSeries,
          programs: medicalTrendSeries,
          applicantsChange: calculateChange(imamTrendSeries),
          foodAidChange: calculateChange(jumuahTrendSeries),
          homeVisitsChange: calculateChange(communityTrendSeries),
          programsChange: calculateChange(medicalTrendSeries),
        },
      };
    } catch (err) {
      throw new Error('Error fetching applicant statistics: ' + err.message);
    }
  },

  getStatisticsApplications: async (duration, centerId, hasGlobalAccess) => {
    try {
      const config = getDurationConfig(duration);
      // center_id has been removed, so no parameters are needed
      const params = [];
      const centerParamIndex = 1;

      const timeSeriesQueries = METRIC_DEFINITIONS.map((metric) =>
        pool.query(buildTimeSeriesQuery(metric, config, centerParamIndex), params)
      );

      const totalsQuery = pool.query(
        `
          SELECT
            (SELECT COUNT(*)::INTEGER FROM ${METRIC_DEFINITIONS[0].table} ${METRIC_DEFINITIONS[0].alias} WHERE ${buildCenterCondition(METRIC_DEFINITIONS[0].alias, centerParamIndex)}) AS imam_profiles_total,
            (SELECT COUNT(*)::INTEGER FROM ${METRIC_DEFINITIONS[1].table} ${METRIC_DEFINITIONS[1].alias} WHERE ${buildCenterCondition(METRIC_DEFINITIONS[1].alias, centerParamIndex)}) AS jumuah_khutbah_total,
            (SELECT COUNT(*)::INTEGER FROM ${METRIC_DEFINITIONS[2].table} ${METRIC_DEFINITIONS[2].alias} WHERE ${buildCenterCondition(METRIC_DEFINITIONS[2].alias, centerParamIndex)}) AS community_engagement_total,
            (SELECT COUNT(*)::INTEGER FROM ${METRIC_DEFINITIONS[3].table} ${METRIC_DEFINITIONS[3].alias} WHERE ${buildCenterCondition(METRIC_DEFINITIONS[3].alias, centerParamIndex)}) AS medical_reimbursement_total
        `,
        params
      );

      const queryResults = await Promise.all([...timeSeriesQueries, totalsQuery]);

      const firstSeriesRows = Array.isArray(queryResults[0]?.rows) ? queryResults[0].rows : [];
      const categories = firstSeriesRows.map((row) => row.period_start instanceof Date
        ? row.period_start.toISOString()
        : new Date(row.period_start).toISOString()
      );
      const formattedCategories = firstSeriesRows.map((row) =>
        formatPeriodLabel(row.period_start, config)
      );

      const metrics = METRIC_DEFINITIONS.map((metric, index) => {
        const seriesRows = queryResults[index].rows || [];
        const data = seriesRows.map((row) => Number(row.value) || 0);
        const rangeTotal = data.reduce((acc, val) => acc + (Number.isFinite(val) ? val : 0), 0);
        return {
          key: metric.key,
          label: metric.label,
          icon: metric.icon,
          data,
          rangeTotal,
        };
      });

      const totalsRow = queryResults[queryResults.length - 1].rows[0] || {};

      const overallTotals = {
        imamProfiles: Number(totalsRow.imam_profiles_total) || 0,
        jumuahKhutbah: Number(totalsRow.jumuah_khutbah_total) || 0,
        communityEngagement: Number(totalsRow.community_engagement_total) || 0,
        medicalReimbursement: Number(totalsRow.medical_reimbursement_total) || 0,
      };

      return {
        duration: config.key,
        categories,
        categoryLabels: formattedCategories,
        metrics: metrics.map((metric) => ({
          ...metric,
          overallTotal: overallTotals[metric.key] ?? 0,
        })),
      };
    } catch (err) {
      throw new Error('Error fetching dashboard statistics applications: ' + err.message);
    }
  },
};

module.exports = dashboardModel;

