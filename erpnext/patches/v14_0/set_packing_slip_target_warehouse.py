import frappe


def execute():
	frappe.reload_doc("stock", "doctype", "packing_slip")
	frappe.db.sql("update `tabPacking Slip` set target_warehouse = warehouse")
