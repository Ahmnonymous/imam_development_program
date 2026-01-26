-- Migration: Add new fields to waqf_loan table
-- Date: 2026-01-26
-- Description: Add agree_to_pay_bank_service_costs, loan_type_other fields and change contributed_to_waqf_loan_fund to TEXT

-- Add new field for bank service costs agreement
ALTER TABLE waqf_loan 
ADD COLUMN IF NOT EXISTS agree_to_pay_bank_service_costs BIGINT;

-- Add foreign key constraint for bank service costs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_waqf_loan_bank_costs'
    ) THEN
        ALTER TABLE waqf_loan
        ADD CONSTRAINT fk_waqf_loan_bank_costs 
        FOREIGN KEY (agree_to_pay_bank_service_costs) REFERENCES Yes_No(ID);
    END IF;
END $$;

-- Add loan_type_other field for "Other" option
ALTER TABLE waqf_loan 
ADD COLUMN IF NOT EXISTS loan_type_other TEXT;

-- Change contributed_to_waqf_loan_fund from BIGINT to TEXT
-- First, drop the foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_waqf_loan_contributed'
    ) THEN
        ALTER TABLE waqf_loan
        DROP CONSTRAINT fk_waqf_loan_contributed;
    END IF;
END $$;

-- Change the column type
ALTER TABLE waqf_loan 
ALTER COLUMN contributed_to_waqf_loan_fund TYPE TEXT USING contributed_to_waqf_loan_fund::TEXT;
