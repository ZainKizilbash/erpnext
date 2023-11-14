import frappe
def execute():
	frappe.reload_doc("HR", "doctype", "advances")

	frappe.db.sql("""
		UPDATE `tabSalary Slip Employee Advance` advance
		SET advance.balance_amount = advance.advance_amount - advance.allocated_amount
	""")
