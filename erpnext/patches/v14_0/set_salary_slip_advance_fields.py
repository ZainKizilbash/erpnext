import frappe
def execute():
	frappe.reload_doc("HR", "doctype", "advances")

	frappe.db.sql("""
		UPDATE `tabSalary Slip Employee Advance`
		SET balance_amount = advance_amount - allocated_amount
	""")
