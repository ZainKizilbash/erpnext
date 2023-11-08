import frappe

def execute():
	frappe.reload_doc("HR", "doctype", "salary_slip_loan")

	frappe.db.sql("""
		UPDATE `tabSalary Slip Loan` cssl
		INNER JOIN `tabRepayment Schedule` rps ON rps.name = cssl.loan_repayment_detail
		INNER JOIN `tabLoan` loan ON loan.name = rps.parent
		SET cssl.loan_type = loan.loan_type,
			cssl.disbursement_date = loan.disbursement_date,
			cssl.total_loan_amount = loan.total_payment,
			cssl.total_amount_paid = loan.total_payment - rps.balance_loan_amount,
			cssl.total_balance_amount = loan.total_loan_amount - loan.total_payment - rps.balance_loan_amount - loan.total_payment
	""")