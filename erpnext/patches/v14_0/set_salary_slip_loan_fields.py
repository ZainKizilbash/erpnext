from __future__ import unicode_literals
import frappe
from frappe.model.utils.rename_field import rename_field

def execute():
	frappe.reload_doc("HR", "doctype", "salary_slip_loan")
	rename_field("Salary Slip Loan", "total_payment", "repayment_amount")

	frappe.db.sql("""
		UPDATE `tabSalary Slip Loan` cssl
		INNER JOIN `tabRepayment Schedule` rps ON rps.name = cssl.loan_repayment_detail
		INNER JOIN `tabLoan` loan ON loan.name = rps.parent
		SET cssl.loan_type = loan.loan_type,
			cssl.disbursement_date = loan.disbursement_date,
			cssl.total_loan_amount = loan.total_payment,
			cssl.pending_loan_amount = cssl.total_payment + rps.balance_loan_amount
			cssl.balance_amount = rps.balance_loan_amount
	""")